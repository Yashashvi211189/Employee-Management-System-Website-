from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from datetime import timedelta
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import http.client
import json
from urllib.parse import urlencode
from django.conf import settings
from django.core import signing
from rest_framework.authentication import SessionAuthentication

from account.authentication import QuietJWTAuthentication
from account.employee_models import EmployeeProfile, OTPVerification
from account.employee_serializers import (
    EmployeeLoginSerializer,
    OTPSendSerializer,
    OTPVerifySerializer,
    EmployeeRegisterSerializer,
    EmployeeTokenSerializer,
)
from django.contrib.auth import get_user_model

User = get_user_model()
ONBOARDING_TOKEN_SALT = "employee.onboarding.v1"
ONBOARDING_TOKEN_MAX_AGE_SECONDS = 30 * 60

class DebugForce200Mixin:
    def finalize_response(self, request, response, *args, **kwargs):
        response = super().finalize_response(request, response, *args, **kwargs)
        if not getattr(settings, "DEBUG", False):
            return response
        status_code = getattr(response, "status_code", 200)
        if status_code < 400:
            return response
        if hasattr(response, "data"):
            payload = response.data
            response.data = {
                "success": False,
                "original_status": int(status_code),
                "error": payload,
            }
        response.status_code = status.HTTP_200_OK
        return response


def send_otp_via_email(email, otp_code, employee_name):
    """
    Send OTP to employee's email
    """
    try:
        # Email configuration
        sender_email = os.getenv('EMAIL_HOST_USER', 'your-email@gmail.com')
        sender_password = os.getenv('EMAIL_HOST_PASSWORD', 'your-password')
        
        # Create message
        subject = f"Nilaya Login OTP - {otp_code}"
        body = f"""
        Hello {employee_name},
        
        Your One-Time Password (OTP) for Nilaya login is:
        
        {otp_code}
        
        This OTP is valid for 10 minutes.
        
        If you didn't request this OTP, please ignore this email.
        
        Best regards,
        Nilaya Team
        """
        
        message = MIMEMultipart()
        message["From"] = sender_email
        message["To"] = email
        message["Subject"] = subject
        message.attach(MIMEText(body, "plain"))
        
        # Send email
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(sender_email, sender_password)
            server.send_message(message)
        
        return True
    except Exception as e:
        print(f"Error sending OTP email: {str(e)}")
        return False


def send_otp_via_sms(phone, otp_code):
    """
    Send OTP to employee's phone via SMS
    """
    try:
        digits = "".join(ch for ch in str(phone) if ch.isdigit())
        if len(digits) >= 10:
            digits = digits[-10:]

        fast2sms_auth = os.getenv("FAST2SMS_AUTHORIZATION", "").strip()
        if fast2sms_auth:
            conn = http.client.HTTPSConnection("www.fast2sms.com")
            payload = urlencode(
                {
                    "variables_values": str(otp_code),
                    "route": "otp",
                    "numbers": digits,
                }
            )
            headers = {
                "authorization": fast2sms_auth,
                "Content-Type": "application/x-www-form-urlencoded",
                "Cache-Control": "no-cache",
            }
            conn.request("POST", "/dev/bulkV2", payload, headers)
            res = conn.getresponse()
            data = res.read()
            try:
                parsed = json.loads(data.decode("utf-8"))
                ok = bool(parsed.get("return") is True) or bool(parsed.get("status_code") == 200)
            except Exception:
                ok = res.status == 200
            return ok

        msg91_authkey = os.getenv("MSG91_AUTHKEY", "").strip()
        msg91_template_id = os.getenv("MSG91_TEMPLATE_ID", "").strip()
        if msg91_authkey and msg91_template_id:
            conn = http.client.HTTPSConnection("control.msg91.com")
            path = (
                f"/api/v5/otp?template_id={msg91_template_id}"
                f"&mobile=91{digits}&authkey={msg91_authkey}&otp={otp_code}&invisible="
            )
            conn.request("POST", path, "{}", {"Content-Type": "application/JSON"})
            res = conn.getresponse()
            _ = res.read()
            return res.status == 200

        print("SMS provider not configured. Set FAST2SMS_AUTHORIZATION or MSG91_AUTHKEY+MSG91_TEMPLATE_ID.")
        return False
    except Exception as e:
        print(f"Error sending OTP SMS: {str(e)}")
        return False


class EmployeeLoginRequestView(DebugForce200Mixin, APIView):
    """
    Step 1: Employee enters email/phone and password
    Returns: Phone number masked (for security) and employee details
    Triggers: OTP sending to registered phone/email
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = OTPSendSerializer(data=request.data)
        
        if not serializer.is_valid():
            for field_errors in serializer.errors.values():
                for err in (field_errors if isinstance(field_errors, list) else [field_errors]):
                    code = getattr(err, "code", None)
                    if code == "inactive":
                        return Response(
                            {"detail": "Pending admin approval"},
                            status=status.HTTP_403_FORBIDDEN,
                        )
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        user = serializer.validated_data['user']
        employee = user.employee_profile

        # Delete any old unverified OTPs
        OTPVerification.objects.filter(
            employee=employee,
            is_verified=False
        ).delete()

        # Generate new OTP
        otp = OTPVerification.objects.create(
            employee=employee,
            otp_code=OTPVerification().generate_otp(),
            expires_at=timezone.now() + timedelta(minutes=10)
        )

        # Send OTP via email
        first = getattr(user, 'firstname', '') or ''
        last = getattr(user, 'lastname', '') or ''
        full_name = f"{first} {last}".strip() or getattr(user, 'username', '')
        email_sent = send_otp_via_email(
            user.email,
            otp.otp_code,
            full_name
        )

        # Also try to send via SMS
        sms_sent = send_otp_via_sms(employee.phone, otp.otp_code)

        # Mask phone number for security
        masked_phone = employee.phone[:2] + '*' * (len(employee.phone) - 4) + employee.phone[-2:]

        response_data = {
            'success': True,
            'message': 'OTP sent successfully',
            'employee_id': employee.employee_id,
            'employee_name': full_name,
            'phone': masked_phone,
            'email': user.email,
            'email_sent': email_sent,
            'sms_sent': sms_sent,
            'otp_expires_in_minutes': 10,
        }
        if settings.DEBUG:
            response_data['otp_code'] = otp.otp_code

        return Response(response_data, status=status.HTTP_200_OK)


class EmployeeOTPVerifyView(DebugForce200Mixin, APIView):
    """
    Step 2: Employee enters OTP
    Returns: JWT tokens for authenticated user
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = OTPVerifySerializer(data=request.data)

        if not serializer.is_valid():
            for field_errors in serializer.errors.values():
                for err in (field_errors if isinstance(field_errors, list) else [field_errors]):
                    code = getattr(err, "code", None)
                    if code == "inactive":
                        return Response(
                            {"detail": "Pending admin approval"},
                            status=status.HTTP_403_FORBIDDEN,
                        )
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        employee = serializer.validated_data['employee']
        otp_record = serializer.validated_data['otp_record']

        # Mark OTP as verified
        otp_record.is_verified = True
        otp_record.save()

        # Generate tokens
        user = employee.user
        token_serializer = EmployeeTokenSerializer({'user': user})

        response_data = {
            'success': True,
            'message': 'OTP verified successfully',
            'access': None,
            'refresh': None,
            'employee': None,
        }

        response_data.update(token_serializer.data)
        response = Response(response_data, status=status.HTTP_200_OK)
        if response_data.get("access"):
            response.set_cookie(
                "access_token",
                response_data.get("access"),
                httponly=True,
                samesite="Lax",
                secure=request.is_secure(),
                path="/",
            )
        if response_data.get("refresh"):
            response.set_cookie(
                "refresh_token",
                response_data.get("refresh"),
                httponly=True,
                samesite="Lax",
                secure=request.is_secure(),
                path="/",
            )
        return response


class EmployeeLoginView(DebugForce200Mixin, APIView):
    """
    Employee login using the Django-admin assigned password.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = EmployeeLoginSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        user = serializer.validated_data['user']
        employee = user.employee_profile

        # Generate tokens
        token_serializer = EmployeeTokenSerializer({'user': user})

        response_data = {
            'success': True,
            'message': 'Login successful',
            'access': None,
            'refresh': None,
            'employee': None,
            'requires_password_change': bool(getattr(user, "requires_password_change", False)),
        }

        response_data.update(token_serializer.data)
        response = Response(response_data, status=status.HTTP_200_OK)
        if response_data.get("access"):
            response.set_cookie(
                "access_token",
                response_data.get("access"),
                httponly=True,
                samesite="Lax",
                secure=request.is_secure(),
                path="/",
            )
        if response_data.get("refresh"):
            response.set_cookie(
                "refresh_token",
                response_data.get("refresh"),
                httponly=True,
                samesite="Lax",
                secure=request.is_secure(),
                path="/",
            )
        return response


class EmployeeRegisterView(DebugForce200Mixin, APIView):
    """
    Employee registration endpoint
    Creates new employee account in inactive status (awaiting admin approval)
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = EmployeeRegisterSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        employee = serializer.save()

        response_data = {
            'success': True,
            'message': 'Registration successful. Please wait for admin approval.',
            'employee_id': employee.employee_id,
            'status': employee.status,
        }

        return Response(response_data, status=status.HTTP_201_CREATED)


def _employee_full_name(user):
    first = getattr(user, 'firstname', '') or ''
    last = getattr(user, 'lastname', '') or ''
    return f"{first} {last}".strip() or getattr(user, 'username', '')


class EmployeeOnboardingRequestView(DebugForce200Mixin, APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = str(request.data.get("email", "")).strip().lower()
        full_name = str(request.data.get("full_name", "")).strip()

        if not email:
            return Response({"detail": "email is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            return Response({"detail": "Employee record not found for this email."}, status=status.HTTP_404_NOT_FOUND)

        if not hasattr(user, "employee_profile"):
            return Response({"detail": "This user is not configured as an employee."}, status=status.HTTP_400_BAD_REQUEST)

        employee = user.employee_profile
        actual_name = _employee_full_name(user)
        if full_name and actual_name and full_name.lower() != actual_name.lower():
            return Response({"detail": "Provided name does not match our employee records."}, status=status.HTTP_400_BAD_REQUEST)

        OTPVerification.objects.filter(
            employee=employee,
            is_verified=False,
            purpose="onboarding",
        ).delete()

        otp = OTPVerification.objects.create(
            employee=employee,
            otp_code=OTPVerification().generate_otp(),
            purpose="onboarding",
            expires_at=timezone.now() + timedelta(minutes=10),
        )

        send_otp_via_email(user.email, otp.otp_code, actual_name)
        send_otp_via_sms(employee.phone, otp.otp_code)

        response_data = {
            "success": True,
            "message": "OTP sent successfully",
            "employee_id": employee.employee_id,
            "otp_expires_in_minutes": 10,
        }
        if settings.DEBUG:
            response_data["otp_code"] = otp.otp_code
        return Response(response_data, status=status.HTTP_200_OK)


class EmployeeOnboardingVerifyView(DebugForce200Mixin, APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        employee_id = str(request.data.get("employee_id", "")).strip()
        otp_code = str(request.data.get("otp_code", "")).strip()

        if not employee_id or not otp_code:
            return Response({"detail": "employee_id and otp_code are required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            employee = EmployeeProfile.objects.get(employee_id=employee_id)
        except EmployeeProfile.DoesNotExist:
            return Response({"detail": "Employee not found."}, status=status.HTTP_404_NOT_FOUND)

        otp_record = OTPVerification.objects.filter(
            employee=employee,
            purpose="onboarding",
            is_verified=False,
        ).order_by("-created_at").first()

        if not otp_record:
            return Response({"detail": "No onboarding OTP found. Please request a new one."}, status=status.HTTP_404_NOT_FOUND)
        if otp_record.is_expired():
            return Response({"detail": "OTP has expired. Please request a new one."}, status=status.HTTP_400_BAD_REQUEST)
        if otp_record.otp_code != otp_code:
            otp_record.attempts += 1
            otp_record.save(update_fields=["attempts"])
            return Response({"detail": "Invalid OTP."}, status=status.HTTP_400_BAD_REQUEST)

        otp_record.is_verified = True
        otp_record.save(update_fields=["is_verified"])

        setup_token = signing.dumps(
            {
                "employee_id": employee.employee_id,
                "purpose": "onboarding_setup",
            },
            salt=ONBOARDING_TOKEN_SALT,
        )

        return Response(
            {
                "success": True,
                "message": "OTP verified successfully",
                "setup_token": setup_token,
            },
            status=status.HTTP_200_OK,
        )


class EmployeeOnboardingSetPasswordView(DebugForce200Mixin, APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        setup_token = str(request.data.get("setup_token", "")).strip()
        password = str(request.data.get("password", "")).strip()
        confirm_password = str(request.data.get("confirm_password", "")).strip()

        if not setup_token:
            return Response({"detail": "setup_token is required"}, status=status.HTTP_400_BAD_REQUEST)
        if not password:
            return Response({"detail": "password is required"}, status=status.HTTP_400_BAD_REQUEST)
        if password != confirm_password:
            return Response({"detail": "Passwords do not match."}, status=status.HTTP_400_BAD_REQUEST)
        if len(password) < 8:
            return Response({"detail": "Password must be at least 8 characters."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            payload = signing.loads(
                setup_token,
                salt=ONBOARDING_TOKEN_SALT,
                max_age=ONBOARDING_TOKEN_MAX_AGE_SECONDS,
            )
        except signing.SignatureExpired:
            return Response({"detail": "Setup token has expired. Please verify OTP again."}, status=status.HTTP_400_BAD_REQUEST)
        except signing.BadSignature:
            return Response({"detail": "Invalid setup token."}, status=status.HTTP_400_BAD_REQUEST)

        if payload.get("purpose") != "onboarding_setup":
            return Response({"detail": "Invalid setup token."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            employee = EmployeeProfile.objects.select_related("user").get(employee_id=payload.get("employee_id"))
        except EmployeeProfile.DoesNotExist:
            return Response({"detail": "Employee not found."}, status=status.HTTP_404_NOT_FOUND)

        user = employee.user
        user.set_password(password)
        user.is_active = True
        user.save(update_fields=["password", "is_active"])

        employee.email_verified = True
        if employee.status == "inactive":
            employee.status = "active"
        employee.save(update_fields=["email_verified", "status"])

        token_serializer = EmployeeTokenSerializer({"user": user})
        response_data = {
            "success": True,
            "message": "Password created successfully",
            "access": None,
            "refresh": None,
            "employee": None,
        }
        response_data.update(token_serializer.data)
        response = Response(response_data, status=status.HTTP_200_OK)
        if response_data.get("access"):
            response.set_cookie(
                "access_token",
                response_data.get("access"),
                httponly=True,
                samesite="Lax",
                secure=request.is_secure(),
                path="/",
            )
        if response_data.get("refresh"):
            response.set_cookie(
                "refresh_token",
                response_data.get("refresh"),
                httponly=True,
                samesite="Lax",
                secure=request.is_secure(),
                path="/",
            )
        return response


class EmployeePasswordChangeView(DebugForce200Mixin, APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [QuietJWTAuthentication, SessionAuthentication]

    def post(self, request):
        user = request.user
        if not getattr(user, "is_authenticated", False) or not hasattr(user, "employee_profile"):
            return Response({"detail": "Employee account required."}, status=status.HTTP_403_FORBIDDEN)

        current_password = str(request.data.get("current_password", "") or "")
        new_password = str(request.data.get("new_password", "") or "")
        confirm_password = str(request.data.get("confirm_password", "") or "")

        if not current_password:
            return Response({"detail": "Current password is required."}, status=status.HTTP_400_BAD_REQUEST)
        if not user.check_password(current_password):
            return Response({"detail": "Current password is incorrect."}, status=status.HTTP_400_BAD_REQUEST)
        if not new_password:
            return Response({"detail": "New password is required."}, status=status.HTTP_400_BAD_REQUEST)
        if new_password != confirm_password:
            return Response({"detail": "Passwords do not match."}, status=status.HTTP_400_BAD_REQUEST)
        if len(new_password) < 8:
            return Response({"detail": "Password must be at least 8 characters."}, status=status.HTTP_400_BAD_REQUEST)
        if current_password == new_password:
            return Response({"detail": "New password must be different from the temporary password."}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.requires_password_change = False
        user.save(update_fields=["password", "requires_password_change"])

        token_serializer = EmployeeTokenSerializer({"user": user})
        response_data = {
            "success": True,
            "message": "Password changed successfully",
            "requires_password_change": False,
            "access": None,
            "refresh": None,
            "employee": None,
        }
        response_data.update(token_serializer.data)
        response = Response(response_data, status=status.HTTP_200_OK)
        if response_data.get("access"):
            response.set_cookie(
                "access_token",
                response_data.get("access"),
                httponly=True,
                samesite="Lax",
                secure=request.is_secure(),
                path="/",
            )
        if response_data.get("refresh"):
            response.set_cookie(
                "refresh_token",
                response_data.get("refresh"),
                httponly=True,
                samesite="Lax",
                secure=request.is_secure(),
                path="/",
            )
        return response


class EmployeeResendOTPView(DebugForce200Mixin, APIView):
    """
    Resend OTP if the customer lost or didn't receive the original OTP
    """
    permission_classes = [AllowAny]

    def post(self, request):
        """
        Request body should contain:
        {
            "employee_id": "DI10001"
        }
        """
        employee_id = request.data.get('employee_id')

        if not employee_id:
            return Response(
                {'error': 'employee_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            employee = EmployeeProfile.objects.get(employee_id=employee_id)
        except EmployeeProfile.DoesNotExist:
            return Response(
                {'error': 'Employee not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        if employee.status != 'active':
            return Response(
                {"detail": "Pending admin approval"},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Delete old OTP
        OTPVerification.objects.filter(
            employee=employee,
            is_verified=False
        ).delete()

        # Generate new OTP
        otp = OTPVerification.objects.create(
            employee=employee,
            otp_code=OTPVerification().generate_otp(),
            expires_at=timezone.now() + timedelta(minutes=10)
        )

        # Send OTP
        user = employee.user
        first = getattr(user, 'firstname', '') or ''
        last = getattr(user, 'lastname', '') or ''
        full_name = f"{first} {last}".strip() or getattr(user, 'username', '')
        send_otp_via_email(user.email, otp.otp_code, full_name)
        send_otp_via_sms(employee.phone, otp.otp_code)

        response_data = {
            'success': True,
            'message': 'OTP resent successfully',
            'otp_expires_in_minutes': 10,
        }
        if settings.DEBUG:
            response_data['otp_code'] = otp.otp_code

        return Response(response_data, status=status.HTTP_200_OK)
