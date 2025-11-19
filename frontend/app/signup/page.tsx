"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Check,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { api } from "../utils/api/api";
import { useStore } from "../utils/store/store";
import { useRouter } from "next/navigation";
import LandingNavbar from "../components/LandingNavbar";

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function SignupPage() {
  const { signUp } = useStore();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState<boolean>(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });

  const [errors, setErrors] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    terms: "",
  });

  const [touched, setTouched] = useState({
    username: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  // Username availability checking
  const [usernameStatus, setUsernameStatus] = useState<
    "idle" | "checking" | "available" | "taken"
  >("idle");
  const debouncedUsername = useDebounce(formData.username, 500);

  // Check username availability (debounced)
  const [emailStatus, setEmailStatus] = useState<
    "idle" | "checking" | "available" | "taken"
  >("idle");
  const debouncedEmail = useDebounce(formData.email, 500);

  // Check username availability (debounced)
  useEffect(() => {
    if (debouncedUsername.length >= 3) {
      setUsernameStatus("checking");

      api
        .post("/api/auth/check-username", { username: debouncedUsername })
        .then((res) => {
          const { available } = res.data;

          setUsernameStatus(!available ? "taken" : "available");

          if (!available) {
            setErrors((prev) => ({
              ...prev,
              username: "Username is already taken",
            }));
          } else if (touched.username) {
            setErrors((prev) => ({ ...prev, username: "" }));
          }
        })
        .catch((error) => {
          console.error(error);
          setUsernameStatus("idle");
        });
    } else if (debouncedUsername.length > 0 && touched.username) {
      setUsernameStatus("idle");
      setErrors((prev) => ({
        ...prev,
        username: "Username must be at least 3 characters",
      }));
    } else {
      setUsernameStatus("idle");
    }
  }, [debouncedUsername, touched.username]);

  // Check email availability (debounced)
  useEffect(() => {
    // First check if email format is valid
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(debouncedEmail);

    if (debouncedEmail && isValidEmail) {
      setEmailStatus("checking");

      api
        .post("/api/auth/check-email", { email: debouncedEmail })
        .then((res) => {
          const { available } = res.data;

          setEmailStatus(!available ? "taken" : "available");

          if (!available) {
            setErrors((prev) => ({
              ...prev,
              email: "Email is already taken",
            }));
          } else if (touched.email) {
            setErrors((prev) => ({ ...prev, email: "" }));
          }
        })
        .catch((error) => {
          console.error(error);
          setEmailStatus("idle");
        });
    } else if (debouncedEmail && !isValidEmail && touched.email) {
      setEmailStatus("idle");
      // Let the validateField handle the error message
    } else {
      setEmailStatus("idle");
    }
  }, [debouncedEmail, touched.email]);

  // Validate field
  const validateField = useCallback(
    (name: string, value: string) => {
      switch (name) {
        case "username":
          if (!value) return "Username is required";
          if (value.length < 3) return "Username must be at least 3 characters";
          if (value.length > 20)
            return "Username must be less than 20 characters";
          if (!/^[a-zA-Z0-9_]+$/.test(value))
            return "Username can only contain letters, numbers, and underscores";
          return "";

        case "email":
          if (!value) return "Email is required";
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
            return "Please enter a valid email";
          return "";

        case "password":
          if (!value) return "Password is required";
          if (value.length < 8) return "Password must be at least 8 characters";
          if (!/(?=.*[a-z])/.test(value))
            return "Password must contain at least one lowercase letter";
          if (!/(?=.*[A-Z])/.test(value))
            return "Password must contain at least one uppercase letter";
          if (!/(?=.*\d)/.test(value))
            return "Password must contain at least one number";
          return "";

        case "confirmPassword":
          if (!value) return "Please confirm your password";
          if (value !== formData.password) return "Passwords do not match";
          return "";

        default:
          return "";
      }
    },
    [formData.password],
  );

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setFormData((prev) => ({ ...prev, [name]: newValue }));

    // Validate on change if field has been touched
    if (touched[name as keyof typeof touched] && type !== "checkbox") {
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  // Handle blur
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));

    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  // Password strength indicator
  const getPasswordStrength = (
    password: string,
  ): { strength: number; label: string; color: string } => {
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

  // Handle submit - Idhula dhan api call pannanum
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({
      username: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    // Validate all fields
    const usernameError = validateField("username", formData.username);
    const emailError = validateField("email", formData.email);
    const passwordError = validateField("password", formData.password);
    const confirmPasswordError = validateField(
      "confirmPassword",
      formData.confirmPassword,
    );
    const termsError = !formData.terms
      ? "You must accept the terms and conditions"
      : "";

    setErrors({
      username: usernameError,
      email: emailError,
      password: passwordError,
      confirmPassword: confirmPasswordError,
      terms: termsError,
    });

    // Check if there are any errors
    if (
      usernameError ||
      emailError ||
      passwordError ||
      confirmPasswordError ||
      termsError ||
      usernameStatus === "taken"
    ) {
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    signUp(formData).then((res) => {
      if (res.status === 201) {
        setShowSuccessMessage(true);
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } else if (res.status === 400) {
        setErrors({
          username: res.data.username || "",
          email: res.data.email || "",
          password: res.data.password || "",
          confirmPassword: res.data.confirmPassword || "",
          terms: res.data.terms || "",
        });
      }
    });
    setIsSubmitting(false);
  };

  if (showSuccessMessage) {
    return (
      <>
        <LandingNavbar />
        <div className="min-h-screen flex items-center justify-center px-4 py-24 sm:py-28 bg-bg">
          <div className="w-full max-w-md">
            <div className="bg-surface rounded-2xl border-2 border-border shadow-2xl p-6 sm:p-8 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-success bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Check className="w-8 h-8 sm:w-10 sm:h-10 text-success" />
              </div>
              <h2 className="font-accents text-xl sm:text-2xl text-text-primary mb-3 sm:mb-4">
                Account Created Successfully!
              </h2>
              <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                <p className="font-body text-sm sm:text-base text-text-secondary">
                  {"We've sent a verification email to:"}
                </p>
                <p className="font-medium text-sm sm:text-base text-accent bg-hover px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg break-all">
                  {formData.email}
                </p>
                <div className="bg-hover border-2 border-border rounded-lg p-3 sm:p-4 text-left">
                  <p className="text-xs sm:text-sm text-text-secondary mb-2">
                    <strong className="text-text-primary">Next steps:</strong>
                  </p>
                  <ol className="text-xs sm:text-sm text-text-secondary space-y-1.5 sm:space-y-2 list-decimal list-inside">
                    <li>Check your email inbox</li>
                    <li>Click the verification link</li>
                    <li>Login to start your adventure</li>
                  </ol>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-text-secondary">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Redirecting to login page...</span>
              </div>
            </div>
          </div>
        </div>
      </>
    );
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
                <span className="text-2xl sm:text-3xl">🎮</span>
              </div>
              <h1 className="font-accents text-2xl sm:text-3xl text-text-primary mb-2">
                Join PokeQuest
              </h1>
              <p className="font-body text-sm sm:text-base text-text-secondary">
                Start your Pokémon adventure today
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              {/* Username Field */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-text-primary mb-2">
                  Trainer Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-text-secondary" />
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full pl-10 sm:pl-11 pr-10 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg bg-hover border-2 ${
                      errors.username && touched.username
                        ? "border-error"
                        : usernameStatus === "available"
                          ? "border-success"
                          : "border-border"
                    } focus:border-accent focus:outline-none transition-colors text-text-primary placeholder:text-text-secondary`}
                    placeholder="Choose your trainer name"
                  />
                  {/* Username status indicator */}
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {usernameStatus === "checking" && (
                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 text-text-secondary animate-spin" />
                    )}
                    {usernameStatus === "available" && !errors.username && (
                      <Check className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
                    )}
                    {usernameStatus === "taken" && (
                      <X className="w-4 h-4 sm:w-5 sm:h-5 text-error" />
                    )}
                  </div>
                </div>
                {errors.username && touched.username && (
                  <p className="mt-1 text-xs sm:text-sm text-error flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                    {errors.username}
                  </p>
                )}
                {usernameStatus === "available" && !errors.username && (
                  <p className="mt-1 text-xs sm:text-sm text-success flex items-center gap-1">
                    <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                    Username is available
                  </p>
                )}
              </div>

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
                    className={`w-full pl-10 sm:pl-11 pr-10 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg bg-hover border-2 ${
                      errors.email && touched.email
                        ? "border-error"
                        : emailStatus === "available"
                          ? "border-success"
                          : "border-border"
                    } focus:border-accent focus:outline-none transition-colors text-text-primary placeholder:text-text-secondary`}
                    placeholder="trainer@pokequest.com"
                  />
                  {/* Email status indicator */}
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {emailStatus === "checking" && (
                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 text-text-secondary animate-spin" />
                    )}
                    {emailStatus === "available" && !errors.email && (
                      <Check className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
                    )}
                    {emailStatus === "taken" && (
                      <X className="w-4 h-4 sm:w-5 sm:h-5 text-error" />
                    )}
                  </div>
                </div>
                {errors.email && touched.email && (
                  <p className="mt-1 text-xs sm:text-sm text-error flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                    {errors.email}
                  </p>
                )}
                {emailStatus === "available" && !errors.email && (
                  <p className="mt-1 text-xs sm:text-sm text-success flex items-center gap-1">
                    <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                    Email is available
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
                    className={`w-full pl-10 sm:pl-11 pr-10 sm:pr-12 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg bg-hover border-2 ${
                      errors.password && touched.password
                        ? "border-error"
                        : "border-border"
                    } focus:border-accent focus:outline-none transition-colors text-text-primary placeholder:text-text-secondary`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                    ) : (
                      <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-text-secondary">
                        Password Strength:
                      </span>
                      <span
                        className="text-xs font-medium"
                        style={{ color: passwordStrength.color }}
                      >
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
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

                {errors.password && touched.password && (
                  <p className="mt-1 text-xs sm:text-sm text-error flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-text-primary mb-2">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-text-secondary" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full pl-10 sm:pl-11 pr-10 sm:pr-12 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg bg-hover border-2 ${
                      errors.confirmPassword && touched.confirmPassword
                        ? "border-error"
                        : formData.confirmPassword &&
                            formData.confirmPassword === formData.password
                          ? "border-success"
                          : "border-border"
                    } focus:border-accent focus:outline-none transition-colors text-text-primary placeholder:text-text-secondary`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                    ) : (
                      <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && touched.confirmPassword && (
                  <p className="mt-1 text-xs sm:text-sm text-error flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                    {errors.confirmPassword}
                  </p>
                )}
                {formData.confirmPassword &&
                  formData.confirmPassword === formData.password &&
                  !errors.confirmPassword && (
                    <p className="mt-1 text-xs sm:text-sm text-success flex items-center gap-1">
                      <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                      Passwords match
                    </p>
                  )}
              </div>

              {/* Terms & Conditions */}
              <div>
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    name="terms"
                    checked={formData.terms}
                    onChange={handleChange}
                    className="mt-0.5 w-4 h-4 rounded border-2 border-border text-accent focus:ring-2 focus:ring-accent focus:ring-offset-0 cursor-pointer"
                  />
                  <span className="text-xs sm:text-sm text-text-secondary group-hover:text-text-primary transition-colors">
                    I agree to the{" "}
                    <Link
                      href="/terms"
                      className="text-accent hover:text-accent-secondarytransition-colors font-medium"
                    >
                      Terms & Conditions
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/privacy"
                      className="text-accent hover:text-accent-secondarytransition-colors font-medium"
                    >
                      Privacy Policy
                    </Link>
                  </span>
                </label>
                {errors.terms && (
                  <p className="mt-1 text-xs sm:text-sm text-error flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                    {errors.terms}
                  </p>
                )}
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
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            {/* Footer */}
            <p className="text-center text-xs sm:text-sm text-text-secondary mt-4 sm:mt-6">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-accent hover:text-accent-secondary font-medium transition-colors"
              >
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
