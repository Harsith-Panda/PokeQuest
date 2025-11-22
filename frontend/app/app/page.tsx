// app/app/page.tsx
"use client";
import AppNavbar from "../components/AppNavbar";
import { MapPin, Zap, Trophy, Package, TrendingUp } from "lucide-react";
import { useStore } from "../utils/store/store";

export default function DashboardPage() {
  const { user } = useStore();

  return (
    <>
      <AppNavbar user={user} />

      <div className="min-h-screen bg- p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="font-accents text-3xl sm:text-4xl text-text-primary mb-2">
              Welcome back, {user?.username}! 👋
            </h1>
            <p className="text-text-secondary">
              Ready to catch some Pokémon today?
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            {[
              {
                label: "Pokémon Caught",
                value: "156",
                icon: Package,
                color: "var(--color-accent)",
                trend: "+12 today",
              },
              {
                label: "Battles Won",
                value: "89",
                icon: Trophy,
                color: "var(--color-accent-tertiary)",
                trend: "+5 today",
              },
              {
                label: "Distance",
                value: "45.2 km",
                icon: MapPin,
                color: "var(--color-info)",
                trend: "+3.2 km today",
              },
              {
                label: "Streak",
                value: "7 days",
                icon: Zap,
                color: "var(--color-fire)",
                trend: "Keep it up!",
              },
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-surface rounded-2xl p-6 border-2 border-border hover:border-[var(--color-accent)] transition-all hover:scale-105 shadow-lg"
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${stat.color}20` }}
                  >
                    <stat.icon
                      className="w-6 h-6"
                      style={{ color: stat.color }}
                    />
                  </div>
                  <TrendingUp className="w-4 h-4 text-[var(--color-success)]" />
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-text-primary mb-1">
                  {stat.value}
                </p>
                <p className="text-sm text-text-secondary mb-2">{stat.label}</p>
                <p className="text-xs text-[var(--color-success)]">
                  {stat.trend}
                </p>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Recent Activity */}
            <div className="bg-surface rounded-2xl p-6 border-2 border-border shadow-lg">
              <h2 className="font-accents text-xl text-text-primary mb-4">
                Recent Activity
              </h2>
              <div className="space-y-3">
                {[
                  {
                    action: "Caught a Pikachu",
                    time: "5 minutes ago",
                    type: "success",
                  },
                  {
                    action: "Won a battle against Trainer Mike",
                    time: "1 hour ago",
                    type: "trophy",
                  },
                  {
                    action: "Reached Level 42",
                    time: "2 hours ago",
                    type: "level",
                  },
                  { action: "Walked 5 km", time: "Today", type: "distance" },
                ].map((activity, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--color-hover)] transition-colors"
                  >
                    <div className="w-2 h-2 rounded-full bg-[var(--color-accent)]" />
                    <div className="flex-1">
                      <p className="text-sm text-text-primary">
                        {activity.action}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Daily Goals */}
            <div className="bg-surface rounded-2xl p-6 border-2 border-border shadow-lg">
              <h2 className="font-accents text-xl text-text-primary mb-4">
                Daily Goals
              </h2>
              <div className="space-y-4">
                {[
                  {
                    goal: "Catch 5 Pokémon",
                    progress: 3,
                    total: 5,
                    color: "var(--color-accent)",
                  },
                  {
                    goal: "Win 3 Battles",
                    progress: 2,
                    total: 3,
                    color: "var(--color-accent-tertiary)",
                  },
                  {
                    goal: "Walk 10 km",
                    progress: 7.2,
                    total: 10,
                    color: "var(--color-info)",
                  },
                ].map((goal, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm text-text-primary">{goal.goal}</p>
                      <p className="text-xs text-text-secondary">
                        {goal.progress}/{goal.total}
                      </p>
                    </div>
                    <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                      <div
                        className="h-full transition-all duration-300 rounded-full"
                        style={{
                          width: `${(goal.progress / goal.total) * 100}%`,
                          backgroundColor: goal.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
