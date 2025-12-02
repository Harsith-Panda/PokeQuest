"use client";
import LandingNavbar from "./components/LandingNavbar";
import {
  MapPin,
  Zap,
  Users,
  Trophy,
  ArrowRight,
  Gamepad2Icon,
  Mail,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import AuthLoading from "./components/AuthLoading";

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    setIsLoading(true);
    const token = localStorage.getItem("accessToken");
    if (token) {
      router.push("/app/map");
    }
    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return <AuthLoading variant="full" />;
  }
  return (
    <div className="min-h-screen">
      <LandingNavbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden sky-gradient">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute top-20 left-10 w-32 h-32 sm:w-48 sm:h-48 rounded-full blur-3xl animate-pulse"
            style={{ backgroundColor: "var(--color-accent)", opacity: 0.2 }}
          />
          <div
            className="absolute bottom-20 right-10 w-48 h-48 sm:w-64 sm:h-64 rounded-full blur-3xl animate-pulse"
            style={{
              backgroundColor: "var(--color-accent-secondary)",
              opacity: 0.2,
              animationDelay: "1s",
            }}
          />
          <div
            className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full blur-3xl animate-pulse"
            style={{
              backgroundColor: "var(--color-accent-tertiary)",
              opacity: 0.1,
              animationDelay: "2s",
            }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto text-center">

          {/* Main Heading */}
          <h1 className="font-logo text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-text-primary mb-4 sm:mb-6 leading-tight px-4">
            Catch Pokémon
            <br />
            <span className="text-accent inline-block mt-2 spawn-in">
              In Real Life
            </span>
          </h1>

          {/* Subtitle */}
          <p className="font-body text-base sm:text-lg md:text-xl lg:text-2xl text-text-secondary mb-8 sm:mb-10 md:mb-12 max-w-3xl mx-auto px-4 leading-relaxed">
            Explore your neighborhood, discover rare Pokémon, and become the
            ultimate trainer in this location-based adventure!
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4 mb-12 sm:mb-16">
            <Link
              href="/signup"
              className="w-full sm:w-auto group flex items-center justify-center gap-2 px-8 py-4 bg-accent hover:bg-accent-secondary text-black rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all hover:scale-105 active:scale-95"
            >
              Start Adventure
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="#features"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-surface text-text-primary border-2 border-border hover:border-accent rounded-xl font-semibold text-lg transition-all hover:scale-105 active:scale-95 shadow-md"
            >
              Learn More
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 px-4 max-w-5xl mx-auto">
            {[
              { label: "Active Players", value: "50+" },
              { label: "Pokémons", value: "30+" },
              { label: "Cities", value: "100+" },
              { label: "Daily Spawns", value: "10K+" },
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-surface backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-border hover:border-accent transition-all hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <div className="font-logo text-2xl sm:text-3xl md:text-4xl text-accent mb-2">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-text-secondary font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-8 bg-surface"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="font-logo text-3xl sm:text-4xl lg:text-5xl text-text-primary mb-4">
              Epic Features
            </h2>
            <p className="font-body text-lg text-text-secondary max-w-2xl mx-auto">
              Everything you need to become a legendary Pokémon trainer
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {[
              {
                icon: MapPin,
                title: "Real Location",
                desc: "Explore your actual surroundings to find Pokémon spawns",
                color: "var(--color-fire)",
              },
              {
                icon: Zap,
                title: "Live Spawns",
                desc: "Pokémon appear in real-time based on your location",
                color: "var(--color-electric)",
              },
              {
                icon: Users,
                title: "Multiplayer",
                desc: "Team up with friends or compete with rivals nearby",
                color: "var(--color-water)",
              },
              {
                icon: Trophy,
                title: "Leaderboard",
                desc: "Climb the ranks and become the best trainer",
                color: "var(--color-grass)",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group p-6 sm:p-8 rounded-2xl bg-surface border-2 border-border hover:border-accent transition-all hover:scale-105 shadow-lg hover:shadow-2xl"
              >
                <div className="w-14 h-14 md:w-16 md:h-16 bg-hover rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-md">
                  <feature.icon
                    className="w-7 h-7 md:w-8 md:h-8"
                    style={{ color: feature.color }}
                  />
                </div>
                <h3 className="font-accents text-xl md:text-2xl text-text-primary mb-3">
                  {feature.title}
                </h3>
                <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-8 bg-hover">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="font-logo text-3xl sm:text-4xl lg:text-5xl text-text-primary mb-4">
              How It Works
            </h2>
            <p className="font-body text-lg text-text-secondary max-w-2xl mx-auto">
              Start your journey in three simple steps
            </p>
          </div>

          {/* Steps */}
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {[
              {
                step: "01",
                title: "Sign Up",
                desc: "Create your trainer account and customize your profile",
              },
              {
                step: "02",
                title: "Explore",
                desc: "Open the map and discover Pokémon spawns near you",
              },
              {
                step: "03",
                title: "Catch",
                desc: "Tap to catch Pokémon and build your collection",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="relative bg-surface rounded-2xl p-8 shadow-xl border-2 border-border hover:border-accent transition-all hover:scale-105"
              >
                <div className="absolute -top-6 left-8 w-12 h-12 bg-accent text-black font-bold rounded-full flex items-center justify-center text-lg shadow-lg">
                  {i + 1}
                </div>

                <h3 className="font-accents text-2xl text-text-primary mb-3">
                  {item.title}
                </h3>
                <p className="text-text-secondary">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="leaderboard"
        className="py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-8 bg-surface"
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="font-logo text-3xl sm:text-4xl lg:text-5xl text-text-primary mb-4">
              Global Leaderboard
            </h2>
            <p className="font-body text-lg text-text-secondary">
              Compete with trainers worldwide
            </p>
          </div>

          {/* Leaderboard Preview */}
          <div className="bg-surface rounded-2xl shadow-2xl border-2 border-border overflow-hidden">
            {[
              {
                rank: 1,
                name: "Ash Ketchum",
                level: 99,
                caught: 898,
                badge: "🥇",
              },
              {
                rank: 2,
                name: "Misty Waters",
                level: 95,
                caught: 856,
                badge: "🥈",
              },
              {
                rank: 3,
                name: "Brock Stone",
                level: 92,
                caught: 823,
                badge: "🥉",
              },
            ].map((trainer, i) => (
              <div
                key={i}
                className={`flex items-center justify-between p-6 ${
                  i !== 2 ? "border-b border-border" : ""
                } hover:bg-hover transition-colors`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{trainer.badge}</span>
                  <div>
                    <p className="font-accents text-lg text-text-primary">
                      {trainer.name}
                    </p>
                    <p className="text-sm text-text-secondary">
                      Level {trainer.level} • {trainer.caught} Caught
                    </p>
                  </div>
                </div>
                <div className="font-accents-secondary text-accent font-bold">
                  #{trainer.rank}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className="py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-secondary) 100%)`,
        }}
      >
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute top-0 left-0 w-full h-full"
            style={{
              backgroundImage: `url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxIDAgNiAyLjY5IDYgNnMtMi42OSA2LTYgNi02LTIuNjktNi02IDIuNjktNiA2LTZ6TTI0IDQyYzMuMzEgMCA2IDIuNjkgNiA2cy0yLjY5IDYtNiA2LTYtMi42OS02LTYgMi42OS02IDYtNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9nPjwvc3ZnPg==')`,
            }}
          />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">

          <h2 className="font-logo text-3xl sm:text-4xl lg:text-5xl text-text-primary mb-6">
            Ready to Start?
          </h2>
          <p className="font-body text-lg sm:text-xl text-text-primary/90 mb-10 max-w-2xl mx-auto">
            Join thousands of trainers and start your Pokémon adventure today.
            {"It's free to play!"}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/signup"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 border-2 border-accent hover:bg-accent text-bg rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all hover:scale-105 active:scale-95"
            >
              Create Account
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-transparent hover:bg-white/10 text-white border-2 border-white rounded-xl font-semibold text-lg transition-all hover:scale-105 active:scale-95"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section
        id="contact"
        className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-surface"
      >
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-logo text-3xl sm:text-4xl text-text-primary mb-4">
            Get In Touch
          </h2>
          <p className="text-lg text-text-secondary mb-8">
            {
              "Have questions? Want to report a bug? We'd love to hear from you!"
            }
          </p>
          <Link
            href="mailto:harsithsappgarage@gmail.com"
            className="inline-flex items-center gap-2 px-8 py-4 bg-accent hover:bg-accent-secondary text-black rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
          >
            <Mail className="w-5 h-5" />
            Contact Us
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-border bg-hover">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="font-logo text-accent text-lg">PokeQuest</div>
            <div>
              <div className="text-sm text-text-secondary text-center">
                {"© 2024 PokeQuest. All rights reserved. Gotta catch 'em all!"}
              </div>
              <div className="text-sm text-text-secondary text-center">
                {"Developed with ❤️ by Harsith Priyan S"}
              </div>
            </div>
            <div className="flex gap-6">
              <Link
                href="/privacy"
                className="text-sm text-text-secondary hover:text-accent transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="text-sm text-text-secondary hover:text-accent transition-colors"
              >
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
