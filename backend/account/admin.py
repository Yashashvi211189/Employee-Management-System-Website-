from django import forms
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth import get_user_model
from django.core.paginator import Paginator
from django.db.models import Q

from .models import (
    Product,
    ProductGallery,
    Project,
    TeamMember,
    GalleryItem,
    Account,
    Blog,
    )
from .employee_models import EmployeeProfile, LeaveRequest, OvertimeRequest, EmployeeDocument, EmployeeTicket, EmployeeTicketNotification

User = get_user_model()


def next_employee_id():
    max_num = 9999
    for eid in EmployeeProfile.objects.filter(employee_id__startswith="DI").values_list("employee_id", flat=True):
        digits = str(eid or "")[2:]
        if digits.isdigit():
            max_num = max(max_num, int(digits))
    return f"DI{max_num + 1}"


class EmployeeProfileAdminForm(forms.ModelForm):
    full_name = forms.CharField(max_length=120, required=True, help_text="Employee display name.")
    email = forms.EmailField(required=True, help_text="Employee login email.")
    temporary_password = forms.CharField(
        required=False,
        widget=forms.PasswordInput(render_value=True),
        help_text="Required when adding an employee. On change, fill this to reset the employee password.",
    )
    force_password_change = forms.BooleanField(
        required=False,
        initial=True,
        help_text="Employee must change this password after the next login.",
    )

    class Meta:
        model = EmployeeProfile
        fields = (
            "employee_id",
            "full_name",
            "email",
            "temporary_password",
            "force_password_change",
            "phone",
            "designation",
            "qualification",
            "employment_type",
            "location",
            "status",
            "private_project",
            "email_verified",
        )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if not self.instance.pk:
            self.fields["employee_id"].initial = next_employee_id()
            self.fields["temporary_password"].required = True
            self.fields["status"].initial = "active"
            self.fields["email_verified"].initial = True
        else:
            user = self.instance.user
            name = f"{getattr(user, 'firstname', '')} {getattr(user, 'lastname', '')}".strip()
            self.fields["full_name"].initial = name or getattr(user, "username", "")
            self.fields["email"].initial = getattr(user, "email", "")
            self.fields["force_password_change"].initial = bool(getattr(user, "requires_password_change", False))

    def clean_email(self):
        email = self.cleaned_data["email"].strip().lower()
        qs = User.objects.filter(Q(email__iexact=email) | Q(username__iexact=email))
        if self.instance.pk:
            qs = qs.exclude(pk=self.instance.user_id)
        if qs.exists():
            raise forms.ValidationError("An account with this email already exists.")
        return email

    def clean_temporary_password(self):
        password = self.cleaned_data.get("temporary_password", "")
        if not self.instance.pk and not password:
            raise forms.ValidationError("Temporary password is required for new employee login.")
        if password and len(password) < 8:
            raise forms.ValidationError("Temporary password must be at least 8 characters.")
        return password

    def save(self, commit=True):
        employee = super().save(commit=False)
        email = self.cleaned_data["email"]
        full_name = self.cleaned_data["full_name"].strip()
        password = self.cleaned_data.get("temporary_password", "")
        force_change = self.cleaned_data.get("force_password_change", False)
        first, _, last = full_name.partition(" ")

        if employee.pk:
            user = employee.user
            user.email = email
            user.username = email
            user.phoneno = employee.phone
        else:
            user = User.objects.create_user(
                username=email,
                email=email,
                phoneno=employee.phone,
                password=password,
            )
            employee.user = user

        user.firstname = first
        user.lastname = last
        user.is_active = True
        user.requires_password_change = bool(force_change or password)
        if password:
            user.set_password(password)
        user.save()

        if commit:
            employee.save()
            self.save_m2m()
        return employee

# ---------------------------
# Product Gallery Inline
# ---------------------------
class ProductGalleryInline(admin.TabularInline):
    model = ProductGallery
    extra = 3
    fields = ['image']
    show_change_link = True


# ---------------------------
# Product Admin (ONLY ONCE)
# ---------------------------
@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'status', 'featured', 'created_at')
    list_filter = ('category', 'status', 'featured')
    search_fields = ('name', 'description')
    ordering = ('-created_at',)

    inlines = [ProductGalleryInline]

    fieldsets = (
        ('Basic Info', {
            'fields': ('name', 'tagline', 'iconText', 'category', 'status', 'featured', 'sortOrder')
        }),
        ('Cover Image', {
            'fields': ('cover',)
        }),
        ('Descriptions', {
            'fields': ('description', 'fullDescription')
        }),
        ('Links', {
            'fields': ('liveUrl', 'demoUrl', 'documentationUrl')
        }),
        ('Structured Data', {
            'fields': (
                'features',
                'outcomes',
                'challenges',
                'technologies',
                'stats',
                'platforms',
                'integrations',
                'support',
            ),
            'classes': ('collapse',),
        }),
    )


# ---------------------------
# Product Gallery Admin
# ---------------------------
@admin.register(ProductGallery)
class ProductGalleryAdmin(admin.ModelAdmin):
    list_display = ('product', 'created_at')
    list_filter = ('product',)
    search_fields = ('product__name',)


# ---------------------------
# Other Admins (unchanged)
# ---------------------------
@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'status', 'created_at')


@admin.register(TeamMember)
class TeamMemberAdmin(admin.ModelAdmin):
    list_display = ('name', 'role', 'status', 'joinDate')


@admin.register(GalleryItem)
class GalleryItemAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'created_at')


@admin.register(EmployeeProfile)
class EmployeeProfileAdmin(admin.ModelAdmin):
    form = EmployeeProfileAdminForm
    list_display = ('employee_id', 'employee_name', 'login_email', 'designation', 'status', 'must_change_password', 'updated_at')
    list_filter = ('status', 'employment_type', 'designation', 'user__requires_password_change')
    search_fields = ('employee_id', 'user__email', 'user__firstname', 'user__lastname', 'phone', 'designation')
    readonly_fields = ('created_at', 'updated_at')

    fieldsets = (
        ('Employee login', {
            'fields': ('employee_id', 'full_name', 'email', 'temporary_password', 'force_password_change')
        }),
        ('Profile', {
            'fields': ('phone', 'designation', 'qualification', 'employment_type', 'location', 'status', 'private_project', 'email_verified')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )

    def employee_name(self, obj):
        return f"{obj.user.firstname} {obj.user.lastname}".strip() or obj.user.username

    def login_email(self, obj):
        return obj.user.email

    def must_change_password(self, obj):
        return bool(getattr(obj.user, "requires_password_change", False))
    must_change_password.boolean = True


@admin.register(LeaveRequest)
class LeaveRequestAdmin(admin.ModelAdmin):
    list_display = ('employee', 'start_date', 'end_date', 'status', 'created_at')
    list_filter = ('status', 'start_date')
    search_fields = ('employee__employee_id', 'employee__user__email', 'employee__user__firstname', 'employee__user__lastname')


@admin.register(OvertimeRequest)
class OvertimeRequestAdmin(admin.ModelAdmin):
    list_display = ('employee', 'date', 'hours', 'status', 'created_at')
    list_filter = ('status', 'date')
    search_fields = ('employee__employee_id', 'employee__user__email', 'employee__user__firstname', 'employee__user__lastname')


@admin.register(EmployeeDocument)
class EmployeeDocumentAdmin(admin.ModelAdmin):
    list_display = ('employee', 'title', 'document_type', 'status', 'uploaded_at')
    list_filter = ('status', 'document_type')
    search_fields = ('employee__employee_id', 'employee__user__email', 'title')


@admin.register(EmployeeTicket)
class EmployeeTicketAdmin(admin.ModelAdmin):
    list_display = ('id', 'employee', 'title', 'status', 'priority', 'created_at')
    list_filter = ('status', 'priority')
    search_fields = ('employee__employee_id', 'employee__user__email', 'title', 'description')


@admin.register(EmployeeTicketNotification)
class EmployeeTicketNotificationAdmin(admin.ModelAdmin):
    list_display = ('title', 'recipient_user', 'recipient_employee', 'kind', 'is_read', 'created_at')
    list_filter = ('kind', 'is_read', 'created_at')
    search_fields = ('title', 'message', 'recipient_user__email', 'recipient_employee__employee_id')


class AccountAdmin(UserAdmin):
    list_display = ('email', 'username', 'is_staff', 'is_admin', 'requires_password_change')
    readonly_fields = ('id', 'date_joined', 'last_login')
    ordering = ('username',)
    search_fields = ('username', 'email', 'firstname', 'lastname', 'phoneno')

    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal info', {'fields': ('firstname', 'lastname', 'email', 'phoneno', 'profile_image')}),
        ('Profile details', {'fields': ('gender', 'position', 'dateofbirth', 'institute', 'city', 'state', 'country')}),
        ('Documents', {'fields': ('officeId_doc', 'govtId1_doc', 'govtId2_doc', 'dobCert_doc')}),
        ('Relations', {'fields': ('contacts', 'usefull_links')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_admin', 'is_superuser', 'requires_password_change', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
        ('System fields', {'fields': ('id', 'registrationid', 'hide_email')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'phoneno', 'password1', 'password2', 'is_staff', 'is_admin', 'is_superuser'),
        }),
    )


@admin.register(Blog)
class BlogAdmin(admin.ModelAdmin):
    list_display = ("title", "status", "author_name", "published_at", "created_at")
    list_filter = ("status", "created_at", "published_at")
    search_fields = ("title", "excerpt", "content", "category", "author_name")
    prepopulated_fields = {"slug": ("title",)}

admin.site.register(Account, AccountAdmin)
