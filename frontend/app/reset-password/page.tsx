"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
  AlertCircle,
  XCircle,
  ArrowRight,
} from "lucide-react";
import LandingNavbar from "../components/LandingNavbar";
import { api } from "../utils/api/api";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({ password: "", confirmPassword: "" });
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "warning";
    message: string;
  } | null>(null);
  const [countdown, setCountdown] = useState(5);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Check if token exists
  useEffect(() => {
    if (!token) {
      setNotification({
        type: "error",
        message: "Invalid reset link. No token provided.",
      });
    }
  }, [token]);

  // Countdown and redirect after success
  useEffect(() => {
    if (resetSuccess) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            router.push("/login");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [resetSuccess, router]);

  // Validate password
  const validatePassword = (password: string) => {
    if (!password) return "Password is required";
    if (password.length < 8) return "Password must be at least 8 characters";
    if (!/(?=.*[a-z])/.test(password))
      return "Must contain at least one lowercase letter";
    if (!/(?=.*[A-Z])/.test(password))
      return "Must contain at least one uppercase letter";
    if (!/(?=.*\d)/.test(password)) return "Must contain at least one number";
    return "";
  };

  // Password strength
  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/(?=.*[a-z])/.test(password)) strength++;
    if (/(?=.*[A-Z])/.test(password)) strength++;
    if (/(?=.*\d)/.test(password)) strength++;
    if (/(?=.*[@$!%*?&])/.test(password)) strength++;

    if (strength <= 2)
      return { strength, label: "Weak", color: "var(--color-error)" };
    if (strength <= 3)
      return { strength, label: "Fair", color: "var(--color-warning)" };
    if (strength <= 4)
      return { strength, label: "Good", color: "var(--color-info)" };
    return { strength, label: "Strong", color: "var(--color-success)" };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotification(null);

    // Validate
    const passwordError = validatePassword(formData.password);
    const confirmError =
      formData.confirmPassword !== formData.password
        ? "Passwords do not match"
        : "";

    setErrors({
      password: passwordError,
      confirmPassword: confirmError,
    });

    if (passwordError || confirmError || !token) {
      return;
    }

    setIsSubmitting(true);

    try {
      // ⚡ BACKEND API CALL - Reset password
      const response = await api.post("/api/auth/reset-password", {
        token,
        password: formData.password,
      });

      const data = response.data;

      if (response.status === 200) {
        // 200 - Success
        setResetSuccess(true);
        setNotification({
          type: "success",
          message:
            data.message ||
            "Password reset successfully! Redirecting to login...",
        });
      } else if (response.status === 400) {
        if (data.message.includes("expired")) {
          // Token expired
          setNotification({
            type: "warning",
            message: "Reset link has expired. Please request a new one.",
          });
        } else {
          // Other 400 errors
          setNotification({
            type: "error",
            message: data.message || "Password is required",
          });
        }
      } else if (response.status === 404) {
        // 404 - Invalid token
        setNotification({
          type: "error",
          message: "Invalid reset link. Please request a new one.",
        });
      } else {
        setNotification({
          type: "error",
          message:
            data.message || "Failed to reset password. Please try again.",
        });
      }
    } catch (error) {
      console.error("Reset password error:", error);
      setNotification({
        type: "error",
        message: "Network error. Please check your connection and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[var(--color-bg)]">
      <LandingNavbar />
      <div className="w-full max-w-md">
        <div className="bg-[var(--color-surface)] rounded-2xl border-2 border-[var(--color-border)] shadow-2xl p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[var(--color-hover)] rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 border-2 border-[var(--color-accent)]">
              <Lock className="w-7 h-7 sm:w-8 sm:h-8 text-[var(--color-accent)]" />
            </div>
            <h1 className="font-accents text-2xl sm:text-3xl text-[var(--color-text-primary)] mb-2">
              Reset Password
            </h1>
            <p className="font-body text-sm sm:text-base text-[var(--color-text-secondary)]">
              Enter your new password below
            </p>
          </div>

          {/* Notification */}
          {notification && (
            <div
              className={`mb-6 p-4 rounded-lg border-2 flex items-start gap-3 ${
                notification.type === "success"
                  ? "bg-[var(--color-success)]/10 border-[var(--color-success)]"
                  : notification.type === "warning"
                    ? "bg-[var(--color-warning)]/10 border-[var(--color-warning)]"
                    : "bg-[var(--color-error)]/10 border-[var(--color-error)]"
              }`}
            >
              {notification.type === "success" ? (
                <CheckCircle className="w-5 h-5 text-[var(--color-success)] flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle
                  className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                    notification.type === "warning"
                      ? "text-[var(--color-warning)]"
                      : "text-[var(--color-error)]"
                  }`}
                />
              )}
              <p
                className={`text-sm ${
                  notification.type === "success"
                    ? "text-[var(--color-success)]"
                    : notification.type === "warning"
                      ? "text-[var(--color-warning)]"
                      : "text-[var(--color-error)]"
                }`}
              >
                {notification.message}
              </p>
            </div>
          )}

          {/* Countdown after success */}
          {resetSuccess && (
            <div className="mb-6">
              <p className="text-sm text-[var(--color-text-secondary)] text-center mb-2">
                Redirecting to login in{" "}
                <span className="font-bold text-[var(--color-success)]">
                  {countdown}
                </span>{" "}
                seconds...
              </p>
              <div className="w-full h-2 bg-[var(--color-border)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--color-success)] transition-all duration-1000"
                  style={{ width: `${((5 - countdown) / 5) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* Password */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-[var(--color-text-primary)] mb-2">
                New Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-[var(--color-text-secondary)]" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  disabled={isSubmitting || resetSuccess}
                  className={`w-full pl-10 sm:pl-11 pr-10 sm:pr-12 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg bg-[var(--color-hover)] border-2 ${
                    errors.password
                      ? "border-[var(--color-error)]"
                      : "border-[var(--color-border)]"
                  } focus:border-[var(--color-accent)] focus:outline-none transition-colors text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] disabled:opacity-50`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isSubmitting}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </button>
              </div>

              {/* Password Strength */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-[var(--color-text-secondary)]">
                      Password Strength:
                    </span>
                    <span
                      className="text-xs font-medium"
                      style={{ color: passwordStrength.color }}
                    >
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[var(--color-border)] rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all duration-300"
                      style={{
                        width: `${(passwordStrength.strength / 5) * 100}%`,
                        backgroundColor: passwordStrength.color,
                      }}
                    />
                  </div>
                </div>
              )}

              {errors.password && (
                <p className="mt-1 text-xs sm:text-sm text-[var(--color-error)] flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-[var(--color-text-primary)] mb-2">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-[var(--color-text-secondary)]" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  disabled={isSubmitting || resetSuccess}
                  className={`w-full pl-10 sm:pl-11 pr-10 sm:pr-12 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg bg-[var(--color-hover)] border-2 ${
                    errors.confirmPassword
                      ? "border-[var(--color-error)]"
                      : formData.confirmPassword &&
                          formData.confirmPassword === formData.password
                        ? "border-[var(--color-success)]"
                        : "border-[var(--color-border)]"
                  } focus:border-[var(--color-accent)] focus:outline-none transition-colors text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] disabled:opacity-50`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isSubmitting}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-xs sm:text-sm text-[var(--color-error)] flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                  {errors.confirmPassword}
                </p>
              )}
              {formData.confirmPassword &&
                formData.confirmPassword === formData.password &&
                !errors.confirmPassword && (
                  <p className="mt-1 text-xs sm:text-sm text-[var(--color-success)] flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                    Passwords match
                  </p>
                )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting || resetSuccess || !token}
              className="w-full py-2.5 sm:py-3 text-sm sm:text-base bg-[var(--color-accent)] hover:bg-[var(--color-accent-secondary)] disabled:bg-[var(--color-text-secondary)] disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all hover:scale-105 active:scale-95 disabled:scale-100 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Resetting Password...
                </>
              ) : resetSuccess ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Password Reset!
                </>
              ) : (
                "Reset Password"
              )}
            </button>
          </form>

          {/* Actions based on notification */}
          {notification &&
            (notification.type === "warning" ||
              notification.type === "error") &&
            !resetSuccess && (
              <div className="mt-6 pt-6 border-t border-[var(--color-border)] space-y-3">
                <Link
                  href="/forgot-password"
                  className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-[var(--color-accent)] hover:bg-[var(--color-accent-secondary)] text-white font-semibold rounded-lg transition-all hover:scale-105 active:scale-95"
                >
                  Request New Reset Link
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-[var(--color-surface)] hover:bg-[var(--color-hover)] text-[var(--color-text-primary)] border-2 border-[var(--color-border)] font-semibold rounded-lg transition-all hover:scale-105 active:scale-95"
                >
                  Back to Login
                </Link>
              </div>
            )}

          {resetSuccess && (
            <div className="mt-6 pt-6 border-t border-[var(--color-border)]">
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-[var(--color-accent)] hover:bg-[var(--color-accent-secondary)] text-white font-semibold rounded-lg transition-all hover:scale-105 active:scale-95"
              >
                Go to Login
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
          <Loader2 className="w-12 h-12 text-[var(--color-accent)] animate-spin" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
