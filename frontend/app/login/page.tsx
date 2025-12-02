"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Loader2,
  XCircle,
  User2Icon
} from "lucide-react";
import Link from "next/link";
import { useStore } from "../utils/store/store";
import LandingNavbar from "../components/LandingNavbar";
import AuthLoading from "../components/AuthLoading";

type NotificationType = "success" | "error" | "warning" | "info";

interface Notification {
  type: NotificationType;
  message: string;
}

export default function LoginPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { login } = useStore();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });

  const showNotification = (type: NotificationType, message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const validateField = (name: string, value: string) => {
    switch (name) {
      case "email":
        if (!value) return "Email is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          return "Please enter a valid email";
        return "";

      case "password":
        if (!value) return "Password is required";
        if (value.length < 8) return "Password must be at least 8 characters";
        return "";

      default:
        return "";
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setFormData((prev) => ({ ...prev, [name]: newValue }));

    if (touched[name as keyof typeof touched] && type !== "checkbox") {
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));

    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setTouched({
      email: true,
      password: true,
    });

    const emailError = validateField("email", formData.email);
    const passwordError = validateField("password", formData.password);

    setErrors({
      email: emailError,
      password: passwordError,
    });

    if (emailError || passwordError) {
      showNotification("error", "Please fix the errors before submitting");
      return;
    }

    setIsSubmitting(true);
    setNotification(null);

    try {
      const response = await login({
        email: formData.email,
        password: formData.password,
      });

      if (response.status === 200) {
        const data = response.data;
        showNotification("success", data.message || "Logged in successfully!");

        if (formData.remember) {
          localStorage.setItem("rememberedEmail", formData.email);
        } else {
          localStorage.removeItem("rememberedEmail");
        }

        setTimeout(() => {
          router.push("/app/map");
        }, 1500);
      }
    } catch (error: any) {
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;

        if (status === 400) {
          showNotification(
            "error",
            data.message || "Email and password are required",
          );
        } else if (status === 404) {
          showNotification(
            "error",
            data.message || "No account found with this email. Please sign up!",
          );
          setErrors((prev) => ({ ...prev, email: "User not found" }));
        } else if (status === 403) {
          showNotification(
            "warning",
            data.message || "Please verify your email before logging in",
          );
        } else if (status === 401) {
          showNotification(
            "error",
            data.message || "Incorrect password. Please try again.",
          );
          setErrors((prev) => ({ ...prev, password: "Invalid password" }));
        } else if (status === 500) {
          showNotification(
            "error",
            data.message || "Server error. Please try again later.",
          );
        } else {
          showNotification(
            "error",
            data.message || "Login failed. Please try again.",
          );
        }
      } else if (error.request) {
        showNotification(
          "error",
          "Network error. Please check your connection and try again.",
        );
      } else {
        showNotification(
          "error",
          "An unexpected error occurred. Please try again.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    const token = localStorage.getItem("accessToken");
    if (token) {
      router.push("/app/map");
    }
    setIsLoading(false);
  }, [router]);

  const NotificationBanner = ({
    notification,
  }: {
    notification: Notification;
  }) => {
    const styles = {
      success: {
        bg: "bg-[var(--color-success)]/10",
        border: "border-[var(--color-success)]",
        text: "text-[var(--color-success)]",
        icon: CheckCircle,
      },
      error: {
        bg: "bg-error/10",
        border: "border-error",
        text: "text-error",
        icon: XCircle,
      },
      warning: {
        bg: "bg-[var(--color-warning)]/10",
        border: "border-[var(--color-warning)]",
        text: "text-[var(--color-warning)]",
        icon: AlertCircle,
      },
      info: {
        bg: "bg-[var(--color-info)]/10",
        border: "border-[var(--color-info)]",
        text: "text-[var(--color-info)]",
        icon: AlertCircle,
      },
    };

    const style = styles[notification.type];
    const Icon = style.icon;

    return (
      <div
        className={`${style.bg} ${style.border} border-2 rounded-lg p-4 mb-4 flex items-start gap-3 animate-in slide-in-from-top`}
      >
        <Icon className={`w-5 h-5 ${style.text} flex-shrink-0 mt-0.5`} />
        <p className={`text-sm ${style.text} flex-1`}>{notification.message}</p>
        <button
          onClick={() => setNotification(null)}
          className={`${style.text} hover:opacity-70 transition-opacity`}
        >
          <XCircle className="w-4 h-4" />
        </button>
      </div>
    );
  };

  if (isLoading) {
    return <AuthLoading variant="full" />;
  }

  return (
    <>
      <LandingNavbar />

      <div className="min-h-screen flex items-center justify-center px-4 py-24 sm:py-28 bg-bg">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-surface rounded-2xl border-2 border-border shadow-2xl p-6 sm:p-8">
            {/* Header */}
            <div className="text-center mb-6 sm:mb-8">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-hover rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 border-2 border-accent">
                <span className="text-2xl sm:text-3xl"><User2Icon style={{color: "var(--color-accent)"}} size={32}/></span>
              </div>
              <h1 className="font-accents text-2xl sm:text-3xl text-text-primary mb-2">
                Welcome Back!
              </h1>
              <p className="font-body text-sm sm:text-base text-">
                Continue your Pokémon adventure
              </p>
            </div>

            {/* Notification Banner */}
            {notification && <NotificationBanner notification={notification} />}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              {/* Email Field */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-text-primary mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-text-secondary" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={isSubmitting}
                    className={`w-full pl-10 sm:pl-11 pr-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg bg-hover border-2 ${
                      errors.email && touched.email
                        ? "border-error"
                        : "border-border"
                    } focus:border-accent focus:outline-none transition-colors text-text-primary placeholder:text-text-secondary disabled:opacity-50 disabled:cursor-not-allowed`}
                    placeholder="trainer@pokequest.com"
                  />
                </div>
                {errors.email && touched.email && (
                  <p className="mt-1 text-xs sm:text-sm text- flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-text-primary mb-2">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-text-secondary" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={isSubmitting}
                    className={`w-full pl-10 sm:pl-11 pr-10 sm:pr-12 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg bg-hover border-2 ${
                      errors.password && touched.password
                        ? "border-error"
                        : "border-border"
                    } focus:border-accent focus:outline-none transition-colors text-text-primary placeholder:text-text-secondary disabled:opacity-50 disabled:cursor-not-allowed`}
                    placeholder="Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isSubmitting}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors disabled:opacity-50"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                    ) : (
                      <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  </button>
                </div>
                {errors.password && touched.password && (
                  <p className="mt-1 text-xs sm:text-sm text-error flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    name="remember"
                    checked={formData.remember}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className="w-4 h-4 rounded border-2 border-border text-accent focus:ring-2 focus:ring-accent focus:ring-offset-0 cursor-pointer disabled:opacity-50"
                  />
                  <span className="text-xs sm:text-sm text-text-secondary group-hover:text-text-primary transition-colors">
                    Remember me
                  </span>
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs sm:text-sm text-accent hover:text-accent-secondary transition-colors font-medium"
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 sm:py-3 text-sm sm:text-base bg-accent hover:bg-accent-secondary disabled:bg-text-secondary disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all hover:scale-105 active:scale-95 disabled:scale-100 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Login to Your Account"
                )}
              </button>
            </form>

            {/* Footer */}
            <p className="text-center text-xs sm:text-sm text-text-secondary mt-4 sm:mt-6">
              {"Don't have an account?"}{" "}
              <Link
                href="/signup"
                className="text-accent hover:text-accent-secondary font-medium transition-colors"
              >
                Sign up now
              </Link>
            </p>
          </div>

          {/* Help Text */}
          <div className="mt-6 text-center">
            <p className="text-xs sm:text-sm text-text-secondary">
              Having trouble logging in?{" "}
              <Link
                href="/#contact"
                className="text-accent hover:text-accent-secondary transition-colors"
              >
                Get help
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
