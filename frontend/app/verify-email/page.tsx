"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle,
  XCircle,
  Loader2,
  Mail,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import LandingNavbar from "../components/LandingNavbar";
import { api } from "../utils/api/api";

type VerificationStatus =
  | "verifying"
  | "success"
  | "error"
  | "expired"
  | "invalid";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<VerificationStatus>("verifying");
  const [message, setMessage] = useState("");
  const [countdown, setCountdown] = useState(5);
  const [isResending, setIsResending] = useState(false);

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus("invalid");
        setMessage("Invalid verification link. No token provided.");
        return;
      }

      try {
        const response = await api.post("/api/auth/verify-email", {
          token,
        });

        const data = await response.data;

        if (response.status === 200) {
          setStatus("success");
          setMessage(
            data.message ||
              "Email verified successfully! Redirecting to login...",
          );

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
        } else if (response.status === 400) {
          setStatus("invalid");
          setMessage(data.message || "Invalid verification link.");
        } else if (response.status === 410) {
          setStatus("expired");
          setMessage(
            data.message ||
              "Verification link has expired. Please request a new one.",
          );
        } else {
          // Other errors
          setStatus("error");
          setMessage(data.message || "Verification failed. Please try again.");
        }
      } catch (error) {
        console.error("Verification error:", error);
        setStatus("error");
        setMessage(
          "Network error. Please check your connection and try again.",
        );
      }
    };

    verifyEmail();
  }, [token, router]);

  const handleResendEmail = async () => {
    if (!email) {
      setMessage("Email address not found. Please sign up again.");
      return;
    }

    setIsResending(true);

    try {
      const response = await api.post("/api/auth/resend-verify-email", {
        email,
      });

      const data = await response.data;

      if (response.status === 200) {
        setStatus("success");
        setMessage(
          data.message || "Verification email sent! Please check your inbox.",
        );
      } else {
        setMessage(data.message || "Failed to resend email. Please try again.");
      }
    } catch (error) {
      console.error("Resend error:", error);
      setMessage("Network error. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  // Status configurations
  const statusConfig = {
    verifying: {
      icon: Loader2,
      iconClass: "w-16 h-16 text-[var(--color-info)] animate-spin",
      title: "Verifying Your Email",
      description: "Please wait while we verify your email address...",
      bgColor: "bg-[var(--color-info)]/10",
      borderColor: "border-[var(--color-info)]",
    },
    success: {
      icon: CheckCircle,
      iconClass: "w-16 h-16 text-[var(--color-success)]",
      title: "Email Verified!",
      description: message,
      bgColor: "bg-[var(--color-success)]/10",
      borderColor: "border-[var(--color-success)]",
    },
    error: {
      icon: XCircle,
      iconClass: "w-16 h-16 text-[var(--color-error)]",
      title: "Verification Failed",
      description: message,
      bgColor: "bg-[var(--color-error)]/10",
      borderColor: "border-[var(--color-error)]",
    },
    expired: {
      icon: XCircle,
      iconClass: "w-16 h-16 text-[var(--color-warning)]",
      title: "Link Expired",
      description: message,
      bgColor: "bg-[var(--color-warning)]/10",
      borderColor: "border-[var(--color-warning)]",
    },
    invalid: {
      icon: XCircle,
      iconClass: "w-16 h-16 text-[var(--color-error)]",
      title: "Invalid Link",
      description: message,
      bgColor: "bg-[var(--color-error)]/10",
      borderColor: "border-[var(--color-error)]",
    },
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[var(--color-bg)]">
      <LandingNavbar />
      <div className="w-full max-w-md">
        {/* Main Card */}
        <div
          className={`bg-[var(--color-surface)] rounded-2xl border-2 ${config.borderColor} shadow-2xl p-8 text-center`}
        >
          {/* Icon */}
          <div
            className={`${config.bgColor} w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6`}
          >
            <StatusIcon className={config.iconClass} />
          </div>

          {/* Title */}
          <h1 className="font-accents text-2xl sm:text-3xl text-[var(--color-text-primary)] mb-3">
            {config.title}
          </h1>

          {/* Description */}
          <p className="text-sm sm:text-base text-[var(--color-text-secondary)] mb-6">
            {config.description}
          </p>

          {/* Success - Show countdown */}
          {status === "success" && countdown > 0 && (
            <div className="mb-6">
              <p className="text-sm text-[var(--color-text-secondary)] mb-2">
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

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Success - Go to Login */}
            {status === "success" && (
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-[var(--color-accent)] hover:bg-[var(--color-accent-secondary)] text-white font-semibold rounded-lg transition-all hover:scale-105 active:scale-95 shadow-lg"
              >
                Go to Login
                <ArrowRight className="w-5 h-5" />
              </Link>
            )}

            {/* Expired - Resend Email */}
            {status === "expired" && email && (
              <button
                onClick={handleResendEmail}
                disabled={isResending}
                className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-[var(--color-accent)] hover:bg-[var(--color-accent-secondary)] disabled:bg-[var(--color-text-secondary)] disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all hover:scale-105 active:scale-95 shadow-lg"
              >
                {isResending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-5 h-5" />
                    Resend Verification Email
                  </>
                )}
              </button>
            )}

            {/* Error/Invalid - Back to Signup */}
            {(status === "error" || status === "invalid") && (
              <Link
                href="/signup"
                className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-[var(--color-accent)] hover:bg-[var(--color-accent-secondary)] text-white font-semibold rounded-lg transition-all hover:scale-105 active:scale-95 shadow-lg"
              >
                Back to Sign Up
                <ArrowRight className="w-5 h-5" />
              </Link>
            )}

            {/* Secondary Action - Go to Login (for non-success states) */}
            {status !== "success" && status !== "verifying" && (
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-[var(--color-surface)] hover:bg-[var(--color-hover)] text-[var(--color-text-primary)] border-2 border-[var(--color-border)] font-semibold rounded-lg transition-all hover:scale-105 active:scale-95"
              >
                Already verified? Login
              </Link>
            )}
          </div>
        </div>

        {/* Help Card */}
        {status !== "verifying" && (
          <div className="mt-6 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-6">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-[var(--color-accent)] flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-[var(--color-text-primary)] mb-2">
                  Need Help?
                </h3>
                <ul className="text-sm text-[var(--color-text-secondary)] space-y-1">
                  <li>• Check your spam/junk folder</li>
                  <li>
                    • {"Make sure you're using the latest verification link"}
                  </li>
                  <li>• Contact support if the issue persists</li>
                </ul>
                <Link
                  href="/help"
                  className="inline-block mt-3 text-sm text-[var(--color-accent)] hover:text-[var(--color-accent-secondary)] transition-colors font-medium"
                >
                  Contact Support →
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
          <Loader2 className="w-12 h-12 text-[var(--color-accent)] animate-spin" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
