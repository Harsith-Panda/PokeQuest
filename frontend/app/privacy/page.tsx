"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Lock, MapPin, Database, Eye, Shield, Mail, FileText } from "lucide-react";

export default function PrivacyPolicyPage() {
  const router = useRouter();

  const sections = [
    {
      id: "intro",
      icon: FileText,
      title: "Introduction",
      content: [
        "PokeQuest (\"the App\") is a personal portfolio project. This Privacy Policy explains what data we collect, how it's used.",
        "The main motive of this app is to implement and test my skills.",
      ],
    },
    {
      id: "collect",
      icon: Database,
      title: "Information We Collect",
      subsections: [
        {
          subtitle: "Account Information",
          items: [
            "• Username",
            "• Email address",
            "• Password (encrypted)",
          ],
        },
        {
          subtitle: "Location Data",
          items: [
            "• Approximate GPS coordinates",
            "• Used only for gameplay (spawning creatures nearby)",
            "• Never shared with third parties",
          ],
        },
        {
          subtitle: "Game Progress",
          items: [
            "• Captured creatures",
            "• Experience points (XP)",
            "• Level and statistics",
          ],
        },
      ],
    },
    {
      id: "use",
      icon: Eye,
      title: "How We Use Your Information",
      content: [
        "We use your data to:",
        "• Provide core gameplay features",
        "• Display leaderboards and rankings",
        "",
        "We do NOT:",
        "• Sell your data to anyone",
        "• Share your location with others",
        "• Use your data for advertising",
      ],
    },
    {
      id: "location",
      icon: MapPin,
      title: "Location Data",
      content: [
        "The App requires location access to:",
        "• Spawn creatures near you",
        "• Calculate distances",
        "• Enable location-based features",
        "",
        "Your location is:",
        "• Stored temporarily for gameplay",
        "• Never shared publicly",
        "• You can revoke access anytime in device settings",
      ],
    },
    {
      id: "retention",
      icon: Database,
      title: "Data Retention",
      content: [
        "We keep your data as long as your account is active.",
        "",
        "You can request account deletion by contacting us. Upon deletion:",
        "• All personal data is removed",
        "• Game progress is permanently deleted",
        "• Username may remain in historical records for integrity",
        ],
    },
  ];

  return (
    <div className="min-h-screen bg-bg sky-gradient p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <header className="max-w-4xl mx-auto mb-8">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 px-4 py-2 bg-surface border-2 border-border rounded-xl hover:bg-hover transition-colors mb-6"
        >
          <ArrowLeft size={20} className="text-text-primary" />
          <span className="font-accents text-sm text-text-primary">Back</span>
        </button>

        <div className="bg-surface rounded-2xl border-4 border-border shadow-lg p-6 sm:p-8">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center shadow-lg glow-accent flex-shrink-0">
              <Lock className="text-black" size={32} />
            </div>
            <div className="flex-1">
              <h1 className="font-logo text-3xl sm:text-4xl text-text-primary ml-4 mt-4">
                Privacy Policy
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto space-y-6">
        {sections.map((section, index) => {
          const IconComponent = section.icon;
          return (
            <div
              key={section.id}
              className="bg-surface rounded-2xl border-4 border-border shadow-lg p-6 sm:p-8 spawn-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-hover rounded-xl flex items-center justify-center flex-shrink-0">
                  <IconComponent className="text-accent-secondary" size={24} />
                </div>
                <h2 className="font-accents text-xl sm:text-2xl text-text-primary font-bold mt-2 flex-1">
                  {section.title}
                </h2>
              </div>

              <div className="space-y-3 ml-0 sm:ml-16">
                {section.content && section.content.map((text, i) => (
                  <p
                    key={i}
                    className={`font-body text-sm sm:text-base leading-relaxed ${
                      text.startsWith("•")
                        ? "text-text-secondary pl-4"
                        : text.includes(":")
                          ? "text-text-primary font-medium"
                          : text === ""
                            ? "h-2"
                            : "text-text-primary"
                    }`}
                  >
                    {text}
                  </p>
                ))}

                {section.subsections && section.subsections.map((subsection, i) => (
                  <div key={i} className="mb-4">
                    <h3 className="font-accents text-base text-text-primary font-bold mb-2">
                      {subsection.subtitle}
                    </h3>
                    {subsection.items.map((item, j) => (
                      <p key={j} className="font-body text-sm text-text-secondary pl-4 leading-relaxed">
                        {item}
                      </p>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </main>

      {/* Quick Links */}
      <div className="max-w-4xl mx-auto mt-6">
        <div className="bg-surface/50 backdrop-blur-sm rounded-xl p-4 border-2 border-border">
          <p className="font-body text-xs text-text-secondary text-center">
            For more information, see our{" "}
            <button
              onClick={() => router.push("/terms")}
              className="text-accent-secondary hover:underline font-medium"
            >
              Terms & Conditions
            </button>
          </p>
        </div>
      </div>

      {/* Bottom Spacing */}
      <div className="h-8"></div>
    </div>
  );
}