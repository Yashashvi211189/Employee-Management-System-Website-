"use client";
import { API_URL } from '@/lib/config';
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import {
  User,
  Phone,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Briefcase,
  LogIn,
} from "lucide-react";

type LoginMode = "admin" | "employee";

// Props for the InputWithIcon component
interface InputWithIconProps {
  icon: React.ElementType;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  required?: boolean;
  showToggle?: boolean;
  onToggle?: () => void;
  showPassword?: boolean;
}

// Move InputWithIcon outside the main component
const InputWithIcon = ({
  icon: Icon,
  type,
  value,
  onChange,
  placeholder,
  required = false,
  showToggle,
  onToggle,
  showPassword,
}: InputWithIconProps) => (
  <div className="relative">
    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
      <Icon className="w-5 h-5" />
    </span>
    <input
      type={showToggle ? (showPassword ? "text" : "password") : type}
      value={value}
      onChange={onChange}
      className="w-full pl-10 pr-10 py-3 rounded-xl border border-input bg-background text-card-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary transition shadow-sm"
      placeholder={placeholder}
      required={required}
    />
    {showToggle && onToggle && (
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
      >
        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
      </button>
    )}
  </div>
);

export default function LoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const [mode, setMode] = useState<LoginMode>("admin");

  // Admin state
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // Employee login state
  const [empLoginId, setEmpLoginId] = useState("");
  const [empPassword, setEmpPassword] = useState("");
  const [showEmpPassword, setShowEmpPassword] = useState(false);
  const [showEmpNewPassword, setShowEmpNewPassword] = useState(false);
  const [showEmpConfirmPassword, setShowEmpConfirmPassword] = useState(false);

  // Employee onboarding state
  const [empFlow, setEmpFlow] = useState<"login" | "onboarding_request" | "onboarding_otp" | "set_password">("login");
  const [empFullName, setEmpFullName] = useState("");
  const [empEmail, setEmpEmail] = useState("");
  const [empOTP, setEmpOTP] = useState("");
  const [empEmployeeId, setEmpEmployeeId] = useState("");
  const [empSetupToken, setEmpSetupToken] = useState("");
  const [empNewPassword, setEmpNewPassword] = useState("");
  const [empConfirmPassword, setEmpConfirmPassword] = useState("");
  const [otpExpiresIn, setOtpExpiresIn] = useState(10);

  // Common
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // --- Admin Login ---
  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/token/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: identifier, password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("access", data.access);
        localStorage.setItem("refresh", data.refresh);
        await auth.login(data.access);
        router.push("/admin1/dashboard");
      } else {
        setError(data.detail || "Invalid credentials");
      }
    } catch {
      setError("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  // --- Employee returning login ---
  const handleEmployeeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/employee/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login_id: empLoginId, password: empPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("access", data.access);
        localStorage.setItem("refresh", data.refresh);
        await auth.login(data.access);
        router.push("/employee/dashboard");
      } else {
        setError(data.detail || Object.values(data).flat().join(", ") || "Login failed");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleEmployeeOnboardingRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/employee/onboarding/request/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: empFullName, email: empEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        setEmpEmployeeId(data.employee_id);
        setOtpExpiresIn(data.otp_expires_in_minutes || 10);
        setEmpFlow("onboarding_otp");
        setSuccessMsg(`OTP sent to ${empEmail}`);
      } else {
        setError(data.detail || Object.values(data).flat().join(", ") || "Failed to send OTP");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleEmployeeOTPVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/employee/onboarding/verify/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employee_id: empEmployeeId, otp_code: empOTP }),
      });
      const data = await res.json();
      if (res.ok) {
        setEmpSetupToken(data.setup_token);
        setEmpFlow("set_password");
        setSuccessMsg("OTP verified. Create your password to continue.");
      } else {
        setError(data.detail || Object.values(data).flat().join(", ") || "OTP verification failed");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEmployeePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/employee/onboarding/set-password/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          setup_token: empSetupToken,
          password: empNewPassword,
          confirm_password: empConfirmPassword,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("access", data.access);
        localStorage.setItem("refresh", data.refresh);
        await auth.login(data.access);
        router.push("/employee/dashboard");
      } else {
        setError(data.detail || Object.values(data).flat().join(", ") || "Password setup failed");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/employee/onboarding/request/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: empFullName, email: empEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(`OTP resent to ${empEmail}`);
        setEmpOTP("");
      } else {
        setError(data.detail || "Failed to resend OTP");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToEmployeeLogin = () => {
    setEmpFlow("login");
    setEmpOTP("");
    setEmpEmployeeId("");
    setEmpSetupToken("");
    setEmpNewPassword("");
    setEmpConfirmPassword("");
    setError("");
    setSuccessMsg("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20 p-4">
      <div className="bg-card border border-border rounded-3xl shadow-2xl px-6 py-8 md:px-8 md:py-12 w-full max-w-md flex flex-col items-center space-y-6">
        <div className="flex flex-col items-center gap-2">
          <Image
            src="/brand/nilaya-icon.svg"
            width={60}
            height={60}
            alt="Logo"
            className="rounded-xl shadow"
          />
          <p className="text-2xl font-bold text-primary">Nilaya</p>
        </div>

        {/* Main Tabs: Admin / Employee */}
        <div className="flex w-full bg-muted/50 p-1 rounded-xl">
          <button
            onClick={() => {
              setMode("admin");
              setError("");
              setSuccessMsg("");
            }}
            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition flex items-center justify-center gap-2 ${
              mode === "admin"
                ? "bg-primary text-primary-foreground shadow"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Briefcase className="w-4 h-4" />
            Admin
          </button>
          <button
            onClick={() => {
              setMode("employee");
              setEmpFlow("login");
              setError("");
              setSuccessMsg("");
            }}
            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition flex items-center justify-center gap-2 ${
              mode === "employee"
                ? "bg-primary text-primary-foreground shadow"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <User className="w-4 h-4" />
            Employee
          </button>
        </div>

        {/* Error / Success messages */}
        {error && (
          <div className="w-full flex items-center gap-2 text-red-500 bg-red-100/50 border border-destructive/30 rounded-xl py-2 px-4 text-sm">
            <span className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-xs">!</span>
            {error}
          </div>
        )}
        {successMsg && (
          <div className="w-full flex items-center gap-2 text-green-600 bg-green-100/50 border border-green-300 rounded-xl py-2 px-4 text-sm">
            <span className="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center text-xs">✓</span>
            {successMsg}
          </div>
        )}

        {/* Admin Form */}
        {mode === "admin" && (
          <form onSubmit={handleAdminSubmit} className="w-full space-y-4">
            <InputWithIcon
              icon={User}
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Username or Email"
              required
            />
            <InputWithIcon
              icon={Lock}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              showToggle
              showPassword={showAdminPassword}
              onToggle={() => setShowAdminPassword(!showAdminPassword)}
            />
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-xl shadow-md transition flex items-center justify-center gap-2 ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? (
                <span className="animate-spin border-2 border-current border-t-transparent rounded-full w-5 h-5" />
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Login as Admin
                </>
              )}
            </button>
          </form>
        )}

        {/* Employee Area */}
        {mode === "employee" && (
          <div className="w-full">
            {empFlow === "login" && (
              <form onSubmit={handleEmployeeLogin} className="space-y-4">
                <InputWithIcon
                  icon={Mail}
                  type="text"
                  value={empLoginId}
                  onChange={(e) => setEmpLoginId(e.target.value)}
                  placeholder="Email"
                  required
                />
                <InputWithIcon
                  icon={Lock}
                  type="password"
                  value={empPassword}
                  onChange={(e) => setEmpPassword(e.target.value)}
                  placeholder="Password"
                  required
                  showToggle
                  showPassword={showEmpPassword}
                  onToggle={() => setShowEmpPassword(!showEmpPassword)}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-xl shadow-md transition flex items-center justify-center gap-2 ${
                    loading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {loading ? (
                    <span className="animate-spin border-2 border-current border-t-transparent rounded-full w-5 h-5" />
                  ) : (
                    <>
                      <LogIn className="w-5 h-5" />
                      Login as Employee
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmpFlow("onboarding_request");
                    setError("");
                    setSuccessMsg("");
                  }}
                  className="w-full text-sm text-primary hover:underline"
                >
                  First-time employee? Verify your email
                </button>
              </form>
            )}

            {empFlow === "onboarding_request" && (
              <form onSubmit={handleEmployeeOnboardingRequest} className="space-y-4">
                <InputWithIcon
                  icon={User}
                  type="text"
                  value={empFullName}
                  onChange={(e) => setEmpFullName(e.target.value)}
                  placeholder="Full Name"
                  required
                />
                <InputWithIcon
                  icon={Mail}
                  type="email"
                  value={empEmail}
                  onChange={(e) => setEmpEmail(e.target.value)}
                  placeholder="Email Address"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-xl shadow-md transition flex items-center justify-center gap-2 ${
                    loading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {loading ? (
                    <span className="animate-spin border-2 border-current border-t-transparent rounded-full w-5 h-5" />
                  ) : (
                    <>
                      <LogIn className="w-5 h-5" />
                      Send Email OTP
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleBackToEmployeeLogin}
                  className="w-full text-sm text-muted-foreground hover:underline"
                >
                  Back to employee login
                </button>
              </form>
            )}

            {empFlow === "onboarding_otp" && (
              <form onSubmit={handleEmployeeOTPVerify} className="space-y-4">
                <div className="text-center mb-4">
                  <p className="text-sm text-muted-foreground">
                    OTP sent to: <span className="font-semibold">{empEmail}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Expires in {otpExpiresIn} minutes</p>
                </div>

                <InputWithIcon
                  icon={Phone}
                  type="text"
                  value={empOTP}
                  onChange={(e) => setEmpOTP(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="Enter 6-digit OTP"
                  required
                />

                <button
                  type="submit"
                  disabled={loading || empOTP.length !== 6}
                  className={`w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-xl shadow-md transition flex items-center justify-center gap-2 ${
                    loading || empOTP.length !== 6 ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {loading ? (
                    <span className="animate-spin border-2 border-current border-t-transparent rounded-full w-5 h-5" />
                  ) : (
                    <>
                      <LogIn className="w-5 h-5" />
                      Verify OTP
                    </>
                  )}
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={loading}
                    className="flex-1 text-sm text-primary hover:underline disabled:opacity-50"
                  >
                    Resend OTP
                  </button>
                  <button
                    type="button"
                    onClick={handleBackToEmployeeLogin}
                    disabled={loading}
                    className="flex-1 text-sm text-muted-foreground hover:underline disabled:opacity-50"
                  >
                    Back
                  </button>
                </div>
              </form>
            )}

            {empFlow === "set_password" && (
              <form onSubmit={handleCreateEmployeePassword} className="space-y-4">
                <InputWithIcon
                  icon={Lock}
                  type="password"
                  value={empNewPassword}
                  onChange={(e) => setEmpNewPassword(e.target.value)}
                  placeholder="Create Password"
                  required
                  showToggle
                  showPassword={showEmpNewPassword}
                  onToggle={() => setShowEmpNewPassword(!showEmpNewPassword)}
                />
                <InputWithIcon
                  icon={Lock}
                  type="password"
                  value={empConfirmPassword}
                  onChange={(e) => setEmpConfirmPassword(e.target.value)}
                  placeholder="Confirm Password"
                  required
                  showToggle
                  showPassword={showEmpConfirmPassword}
                  onToggle={() => setShowEmpConfirmPassword(!showEmpConfirmPassword)}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-xl shadow-md transition flex items-center justify-center gap-2 ${
                    loading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {loading ? (
                    <span className="animate-spin border-2 border-current border-t-transparent rounded-full w-5 h-5" />
                  ) : (
                    <>
                      <LogIn className="w-5 h-5" />
                      Create Password
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
