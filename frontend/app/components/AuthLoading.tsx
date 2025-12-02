"use client";
import { Zap, Loader2 } from "lucide-react";

interface AuthLoadingProps {
  message?: string;
  variant?: "full" | "minimal" | "spinner";
}

export default function AuthLoading({
  message = "Loading...",
  variant = "full",
}: AuthLoadingProps) {
  // Full Screen Loading (Default - for auth checks)
  if (variant === "full") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="text-center px-4">
          <div className="relative mb-8">
            <div className="absolute inset-0 w-24 h-24 sm:w-28 sm:h-28 mx-auto animate-ping">
              <div className="w-full h-full border-4 border-accent/30 rounded-full" />
            </div>

            <div className="relative w-24 h-24 sm:w-28 sm:h-28 mx-auto bg-linear-to-br from-accent to-accent-secondary rounded-full flex items-center justify-center shadow-2xl">
              <Zap className="w-12 h-12 sm:w-14 sm:h-14 text-white animate-pulse" />
            </div>

            <div className="absolute inset-0 w-24 h-24 sm:w-28 sm:h-28 mx-auto animate-spin">
              <div className="w-full h-full border-t-4 border-accent rounded-full" />
            </div>
          </div>

          <h1 className="font-logo text-2xl sm:text-3xl md:text-4xl text-text-primary mb-4 animate-pulse">
            PokeQuest
          </h1>

          <p className="text-sm sm:text-base text-text-secondary mb-6">
            {message}
          </p>

          <div className="flex items-center justify-center gap-2">
            <div
              className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-accent animate-bounce"
              style={{ animationDelay: "0ms" }}
            />
            <div
              className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-accent animate-bounce"
              style={{ animationDelay: "150ms" }}
            />
            <div
              className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-accent animate-bounce"
              style={{ animationDelay: "300ms" }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (variant === "minimal") {
    return (
      <div className="flex items-center justify-center gap-3 p-4">
        <div className="relative">
          <Loader2 className="w-5 h-5 text-accent animate-spin" />
          <div className="absolute inset-0 w-5 h-5 border-2 border-accent/20 rounded-full animate-ping" />
        </div>
        <span className="text-sm text-text-secondary">{message}</span>
      </div>
    );
  }

  if (variant === "spinner") {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-border rounded-full" />
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-accent rounded-full animate-spin" />
          <div className="absolute inset-2 w-12 h-12 bg-accent/10 rounded-full animate-pulse" />
        </div>
      </div>
    );
  }

  return null;
}
