"use client";
import AppNavbar from "@/app/components/AppNavbar";
import { useStore } from "@/app/utils/store/store";
import { useState, useEffect } from "react";
import {
  User,
  Lock,
  Edit2,
  Save,
  X,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
  AlertCircle,
  Camera,
  Check,
} from "lucide-react";
import { api } from "@/app/utils/api/api";

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

export default function ProfilePage() {
  const { user } = useStore();

  // Edit modes
  const [editingUsername, setEditingUsername] = useState(false);
  const [editingPassword, setEditingPassword] = useState(false);

  // Form states
  const [username, setUsername] = useState(user?.username || "");
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // UI states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Username availability checking
  const [usernameStatus, setUsernameStatus] = useState<
    "idle" | "checking" | "available" | "taken"
  >("idle");
  const debouncedUsername = useDebounce(username, 500);

  // Validation errors
  const [usernameError, setUsernameError] = useState("");
  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Show notification
  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Check username availability (debounced)
  useEffect(() => {
    // Don't check if it's the same as current username
    if (debouncedUsername === user?.username) {
      setUsernameStatus("idle");
      setUsernameError("");
      return;
    }

    if (debouncedUsername.length >= 3) {
      setUsernameStatus("checking");

      const checkUsername = async () => {
        try {
          const response = await api.post("/api/auth/check-username", {
            username: debouncedUsername,
          });

          const { available } = response.data;

          setUsernameStatus(!available ? "taken" : "available");

          if (!available) {
            setUsernameError("Username is already taken");
          }
        } catch (error) {
          setUsernameStatus("idle");
        }
      };

      checkUsername();
    } else if (debouncedUsername.length > 0) {
      setUsernameStatus("idle");
      const error = validateUsername(debouncedUsername);
      setUsernameError(error);
    } else {
      setUsernameStatus("idle");
      setUsernameError("");
    }
  }, [debouncedUsername, user?.username]);

  // Validate username
  const validateUsername = (value: string) => {
    if (!value) return "Username is required";
    if (value.length < 3) return "Username must be at least 3 characters";
    if (value.length > 20) return "Username must be less than 20 characters";
    if (!/^[a-zA-Z0-9_]+$/.test(value))
      return "Username can only contain letters, numbers, and underscores";
    return "";
  };

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

  // Handle username update
  const handleUsernameUpdate = async () => {
    const error = validateUsername(username);
    if (error) {
      setUsernameError(error);
      return;
    }

    if (username === user?.username) {
      setEditingUsername(false);
      return;
    }

    if (usernameStatus === "taken") {
      setUsernameError("Username is already taken");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.put("/api/user/update-username", {
        id: user?._id,
        username: username,
      });

      const data = await response.data;

      if (response.status === 200) {
        showNotification("success", "Username updated successfully!");
        setEditingUsername(false);
        user!.username = username;
      } else {
        showNotification("error", data.message || "Failed to update username");
        setUsernameError(data.message || "Update failed");
      }
    } catch (error) {
      showNotification("error", "Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle password update
  const handlePasswordUpdate = async () => {
    // Validate all fields
    const currentError = !passwordData.currentPassword
      ? "Current password is required"
      : "";
    const newError = validatePassword(passwordData.newPassword);
    const confirmError =
      passwordData.newPassword !== passwordData.confirmPassword
        ? "Passwords do not match"
        : "";

    setPasswordErrors({
      currentPassword: currentError,
      newPassword: newError,
      confirmPassword: confirmError,
    });

    if (currentError || newError || confirmError) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.put("/api/user/update-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      const data = await response.data;

      if (response.status === 200) {
        showNotification("success", "Password updated successfully!");
        setEditingPassword(false);
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else if (response.status === 401) {
        showNotification("error", "Current password is incorrect");
        setPasswordErrors((prev) => ({
          ...prev,
          currentPassword: "Incorrect password",
        }));
      } else {
        showNotification("error", data.message || "Failed to update password");
      }
    } catch (error) {
      showNotification("error", "Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cancel username edit
  const cancelUsernameEdit = () => {
    setUsername(user?.username || "");
    setUsernameError("");
    setUsernameStatus("idle");
    setEditingUsername(false);
  };

  // Cancel password edit
  const cancelPasswordEdit = () => {
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setPasswordErrors({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setEditingPassword(false);
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

  const passwordStrength = getPasswordStrength(passwordData.newPassword);

  return (
    <>
      <AppNavbar user={user} />

      <div className="min-h-screen bg-[var(--color-bg)] p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-accents text-3xl sm:text-4xl text-[var(--color-text-primary)] mb-2">
              Profile Settings
            </h1>
            <p className="text-[var(--color-text-secondary)]">
              Manage your account information and security
            </p>
          </div>

          {/* Notification */}
          {notification && (
            <div
              className={`mb-6 p-4 rounded-lg border-2 flex items-start gap-3 ${
                notification.type === "success"
                  ? "bg-[var(--color-success)]/10 border-[var(--color-success)]"
                  : "bg-[var(--color-error)]/10 border-[var(--color-error)]"
              }`}
            >
              {notification.type === "success" ? (
                <CheckCircle className="w-5 h-5 text-[var(--color-success)] flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-[var(--color-error)] flex-shrink-0 mt-0.5" />
              )}
              <p
                className={`text-sm ${
                  notification.type === "success"
                    ? "text-[var(--color-success)]"
                    : "text-[var(--color-error)]"
                }`}
              >
                {notification.message}
              </p>
            </div>
          )}

          {/* Profile Card */}
          <div className="bg-[var(--color-surface)] rounded-2xl border-2 border-[var(--color-border)] shadow-lg p-6 sm:p-8 mb-6">
            <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 pb-8 border-b border-[var(--color-border)]">
              {/* Avatar */}
              <div className="relative group">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-secondary)] flex items-center justify-center text-white font-bold text-4xl sm:text-5xl shadow-xl">
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
              </div>

              {/* User Info */}
              <div className="text-center sm:text-left flex-1">
                <h2 className="font-accents text-2xl sm:text-3xl text-[var(--color-text-primary)] mb-2">
                  {user?.username}
                </h2>
                <p className="text-[var(--color-text-secondary)] mb-3">
                  {user?.email}
                </p>
                <div className="flex items-center justify-center sm:justify-start gap-4 font-accents-secondary text-sm">
                  <div>
                    <span className="text-[var(--color-accent)] font-bold">
                      LVL {user?.stats.level || 1}
                    </span>
                  </div>
                  <div className="text-[var(--color-text-secondary)]">
                    {user?.stats.xp || 0} XP
                  </div>
                </div>
              </div>
            </div>

            {/* Username Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[var(--color-hover)] rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-[var(--color-accent)]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--color-text-primary)]">
                      Username
                    </h3>
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      Your unique trainer name
                    </p>
                  </div>
                </div>
                {!editingUsername && (
                  <button
                    onClick={() => setEditingUsername(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[var(--color-hover)] hover:bg-[var(--color-border)] border border-[var(--color-border)] rounded-lg transition-all text-sm font-medium text-[var(--color-text-primary)]"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                )}
              </div>

              {editingUsername ? (
                <div className="space-y-4">
                  <div>
                    <div className="relative">
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => {
                          setUsername(e.target.value);
                          setUsernameError("");
                        }}
                        disabled={isSubmitting}
                        className={`w-full px-4 pr-12 py-3 rounded-lg bg-[var(--color-hover)] border-2 ${
                          usernameError
                            ? "border-[var(--color-error)]"
                            : usernameStatus === "available"
                              ? "border-[var(--color-success)]"
                              : "border-[var(--color-border)]"
                        } focus:border-[var(--color-accent)] focus:outline-none transition-colors text-[var(--color-text-primary)] disabled:opacity-50`}
                        placeholder="Enter new username"
                      />
                      {/* Username status indicator */}
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {usernameStatus === "checking" && (
                          <Loader2 className="w-5 h-5 text-[var(--color-text-secondary)] animate-spin" />
                        )}
                        {usernameStatus === "available" && !usernameError && (
                          <Check className="w-5 h-5 text-[var(--color-success)]" />
                        )}
                        {usernameStatus === "taken" && (
                          <X className="w-5 h-5 text-[var(--color-error)]" />
                        )}
                      </div>
                    </div>
                    {usernameError && (
                      <p className="mt-2 text-sm text-[var(--color-error)] flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {usernameError}
                      </p>
                    )}
                    {usernameStatus === "available" && !usernameError && (
                      <p className="mt-2 text-sm text-[var(--color-success)] flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        Username is available
                      </p>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleUsernameUpdate}
                      disabled={
                        isSubmitting ||
                        usernameStatus === "checking" ||
                        usernameStatus === "taken"
                      }
                      className="flex items-center gap-2 px-6 py-2.5 bg-[var(--color-accent)] hover:bg-[var(--color-accent-secondary)] disabled:bg-[var(--color-text-secondary)] text-white font-semibold rounded-lg transition-all hover:scale-105 active:scale-95 disabled:scale-100 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      Save
                    </button>
                    <button
                      onClick={cancelUsernameEdit}
                      disabled={isSubmitting}
                      className="flex items-center gap-2 px-6 py-2.5 bg-[var(--color-hover)] hover:bg-[var(--color-border)] border border-[var(--color-border)] text-[var(--color-text-primary)] font-semibold rounded-lg transition-all disabled:opacity-50"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-[var(--color-hover)] rounded-lg">
                  <p className="text-[var(--color-text-primary)] font-medium">
                    {user?.username}
                  </p>
                </div>
              )}
            </div>

            {/* Password Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[var(--color-hover)] rounded-lg flex items-center justify-center">
                    <Lock className="w-5 h-5 text-[var(--color-accent)]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--color-text-primary)]">
                      Password
                    </h3>
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      Keep your account secure
                    </p>
                  </div>
                </div>
                {!editingPassword && (
                  <button
                    onClick={() => setEditingPassword(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[var(--color-hover)] hover:bg-[var(--color-border)] border border-[var(--color-border)] rounded-lg transition-all text-sm font-medium text-[var(--color-text-primary)]"
                  >
                    <Edit2 className="w-4 h-4" />
                    Change
                  </button>
                )}
              </div>

              {editingPassword ? (
                <div className="space-y-4">
                  {/* Current Password */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                      Current Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) => {
                          setPasswordData({
                            ...passwordData,
                            currentPassword: e.target.value,
                          });
                          setPasswordErrors({
                            ...passwordErrors,
                            currentPassword: "",
                          });
                        }}
                        disabled={isSubmitting}
                        className={`w-full px-4 pr-12 py-3 rounded-lg bg-[var(--color-hover)] border-2 ${
                          passwordErrors.currentPassword
                            ? "border-[var(--color-error)]"
                            : "border-[var(--color-border)]"
                        } focus:border-[var(--color-accent)] focus:outline-none transition-colors text-[var(--color-text-primary)] disabled:opacity-50`}
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    {passwordErrors.currentPassword && (
                      <p className="mt-2 text-sm text-[var(--color-error)] flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {passwordErrors.currentPassword}
                      </p>
                    )}
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                      New Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) => {
                          setPasswordData({
                            ...passwordData,
                            newPassword: e.target.value,
                          });
                          setPasswordErrors({
                            ...passwordErrors,
                            newPassword: "",
                          });
                        }}
                        disabled={isSubmitting}
                        className={`w-full px-4 pr-12 py-3 rounded-lg bg-[var(--color-hover)] border-2 ${
                          passwordErrors.newPassword
                            ? "border-[var(--color-error)]"
                            : "border-[var(--color-border)]"
                        } focus:border-[var(--color-accent)] focus:outline-none transition-colors text-[var(--color-text-primary)] disabled:opacity-50`}
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                      >
                        {showNewPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>

                    {/* Password Strength */}
                    {passwordData.newPassword && (
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

                    {passwordErrors.newPassword && (
                      <p className="mt-2 text-sm text-[var(--color-error)] flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {passwordErrors.newPassword}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                      Confirm New Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={(e) => {
                          setPasswordData({
                            ...passwordData,
                            confirmPassword: e.target.value,
                          });
                          setPasswordErrors({
                            ...passwordErrors,
                            confirmPassword: "",
                          });
                        }}
                        disabled={isSubmitting}
                        className={`w-full px-4 pr-12 py-3 rounded-lg bg-[var(--color-hover)] border-2 ${
                          passwordErrors.confirmPassword
                            ? "border-[var(--color-error)]"
                            : passwordData.confirmPassword &&
                                passwordData.confirmPassword ===
                                  passwordData.newPassword
                              ? "border-[var(--color-success)]"
                              : "border-[var(--color-border)]"
                        } focus:border-[var(--color-accent)] focus:outline-none transition-colors text-[var(--color-text-primary)] disabled:opacity-50`}
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    {passwordErrors.confirmPassword && (
                      <p className="mt-2 text-sm text-[var(--color-error)] flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {passwordErrors.confirmPassword}
                      </p>
                    )}
                    {passwordData.confirmPassword &&
                      passwordData.confirmPassword ===
                        passwordData.newPassword &&
                      !passwordErrors.confirmPassword && (
                        <p className="mt-2 text-sm text-[var(--color-success)] flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          Passwords match
                        </p>
                      )}
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handlePasswordUpdate}
                      disabled={isSubmitting}
                      className="flex items-center gap-2 px-6 py-2.5 bg-[var(--color-accent)] hover:bg-[var(--color-accent-secondary)] disabled:bg-[var(--color-text-secondary)] text-white font-semibold rounded-lg transition-all hover:scale-105 active:scale-95 disabled:scale-100"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      Update Password
                    </button>
                    <button
                      onClick={cancelPasswordEdit}
                      disabled={isSubmitting}
                      className="flex items-center gap-2 px-6 py-2.5 bg-[var(--color-hover)] hover:bg-[var(--color-border)] border border-[var(--color-border)] text-[var(--color-text-primary)] font-semibold rounded-lg transition-all disabled:opacity-50"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-[var(--color-hover)] rounded-lg">
                  <p className="text-[var(--color-text-primary)] font-medium">
                    ••••••••••••
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Security Info Card */}
          <div className="bg-[var(--color-info)]/10 border-2 border-[var(--color-info)] rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-[var(--color-info)] flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-[var(--color-info)] mb-1">
                  Security Tips
                </h4>
                <ul className="text-sm text-[var(--color-info)] space-y-1">
                  <li>
                    {"• Use a unique password you don't use on other sites"}
                  </li>
                  <li>
                    • Include uppercase, lowercase, numbers, and special
                    characters
                  </li>
                  <li>
                    • Change your password regularly to keep your account secure
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
