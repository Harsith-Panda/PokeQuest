"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Mail,
  ArrowLeft,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import LandingNavbar from "../components/LandingNavbar";
import { api } from "../utils/api/api";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const validateEmail = (email: string) => {
    if (!email) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return "Please enter a valid email";
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }

    setIsSubmitting(true);

    try {
      // ⚡ BACKEND API CALL - Request password reset
      const response = await api.post("/api/auth/request-reset", {
        email,
      });

      const data = response.data;

      if (response.status === 200) {
        // 200 - Success
        setSuccess(true);
        // Optionally redirect to confirmation page
        setTimeout(() => {
          router.push(`/login`);
        }, 2000);
      } else if (response.status === 404) {
        // 404 - Email not found
        setError("No account found with this email address");
      } else if (response.status === 429) {
        // 429 - Too many requests
        setError("Too many requests. Please try again later");
      } else {
        setError(
          data.message || "Failed to send reset email. Please try again",
        );
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      setError("Network error. Please check your connection and try again");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-bg">
      <LandingNavbar />
      <div className="w-full max-w-md">
        <div className="bg-surface rounded-2xl border-2 border-border shadow-2xl p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-hover rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 border-2 border-accent">
              <Mail className="w-7 h-7 sm:w-8 sm:h-8 text-accent" />
            </div>
            <h1 className="font-accents text-2xl sm:text-3xl text-text-primary mb-2">
              Forgot Password?
            </h1>
            <p className="font-body text-sm sm:text-base text-text-secondary">
              {
                "No worries! Enter your email and we'll send you reset instructions"
              }
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-success/10 border-2 border-success rounded-lg flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-success font-medium mb-1">
                  Email sent successfully!
                </p>
                <p className="text-xs text-success">
                  Check your inbox for password reset instructions
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-error/10 border-2 border-error rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
              <p className="text-sm text-error">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-text-primary mb-2">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-text-secondary" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting || success}
                  className="w-full pl-10 sm:pl-11 pr-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg bg-hover border-2 border-border focus:border-accent focus:outline-none transition-colors text-text-primary placeholder:text-text-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="trainer@pokequest.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || success}
              className="w-full py-2.5 sm:py-3 text-sm sm:text-base bg-accent hover:bg-accent-secondary disabled:bg-text-secondary disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all hover:scale-105 active:scale-95 disabled:scale-100 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending...
                </>
              ) : success ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Email Sent
                </>
              ) : (
                "Send Reset Link"
              )}
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-6 pt-6 border-t border-border text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm text-accent hover:text-accent-secondary transition-colors font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>
          </div>
        </div>

        {/* Help Text */}
        <p className="mt-6 text-center text-xs sm:text-sm text-text-secondary">
          Remember your password?{" "}
          <Link
            href="/login"
            className="text-accent hover:text-accent-secondary transition-colors font-medium"
          >
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
