"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Shield, AlertTriangle, Info, Mail, FileText } from "lucide-react";

export default function TermsAndConditionsPage() {
  const router = useRouter();

  const sections = [
    {
      id: "about",
      icon: Info,
      title: "1. About This App",
      content: [
        "PokeQuest is a location-based mini-game built for educational and portfolio purposes. It is not affiliated with Nintendo, Pokémon Company, or any official brand.",
      ],
    },
    {
      id: "use",
      icon: Shield,
      title: "2. Use of the App",
      content: [
        "By using PokeQuest, you agree that:",
        "• You will not misuse or attempt to hack the app.",
        "• You will not use fake GPS or unfair tools to exploit the game.",
        "• You understand that the app may contain bugs or limitations.",
        "• The app may change or be taken down at any time.",
      ],
    },
    {
      id: "account",
      icon: FileText,
      title: "3. Account Registration",
      content: [
        "You may create an account using basic details like username, email, and password.",
        "You agree to:",
        "• Provide accurate information.",
        "• Keep your login credentials safe.",
        "• Not impersonate someone else.",
      ],
    },
    {
      id: "location",
      icon: Info,
      title: "4. Location Access",
      content: [
        "The app uses your approximate device location to spawn nearby creatures. You may deny location permission, but game features may not work.",
      ],
    },
    {
      id: "virtual",
      icon: Info,
      title: "5. Virtual Items",
      content: [
        "All creatures, levels, and items inside the app are virtual only. They have no monetary value and cannot be exchanged or sold.",
      ],
    },
    {
      id: "conduct",
      icon: AlertTriangle,
      title: "6. User Conduct",
      content: [
        "You agree not to:",
        "• Attempt to reverse engineer the app",
        "• Use bots or automation tools",
        "• Upload harmful content or interfere with the service",
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
            <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center shadow-lg glow-green flex-shrink-0">
              <FileText className="text-black" size={32} />
            </div>
            <div className="flex-1">
              <h1 className="font-logo text-3xl sm:text-4xl text-text-primary mt-3 mb-2">
                Terms & Conditions
              </h1>
            </div>
          </div>

          <div className="bg-accent/10 border-2 border-accent rounded-xl p-4">
            <p className="font-body text-sm text-text-primary leading-relaxed">
              Welcome to PokeQuest! By using this app, you agree to these Terms & Conditions. 
              This app is a personal portfolio project, not a commercial product.
            </p>
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
              {/* Section Header */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-hover rounded-xl flex items-center justify-center flex-shrink-0">
                  <IconComponent className="text-accent" size={24} />
                </div>
                <h2 className="font-accents text-xl sm:text-2xl mt-1.5 text-text-primary font-bold flex-1">
                  {section.title}
                </h2>
              </div>

              <div className="space-y-3 ml-0 sm:ml-16">
                {section.content.map((text, i) => (
                  <p
                    key={i}
                    className={`font-body text-sm sm:text-base leading-relaxed ${
                      text.startsWith("•")
                        ? "text-text-secondary pl-4"
                        : text.includes(":")
                          ? "text-text-primary font-medium"
                          : "text-text-primary"
                    }`}
                  >
                    {text}
                  </p>
                ))}
              </div>
            </div>
          );
        })}
      </main>

      {/* Disclaimer Banner */}
      <div className="max-w-4xl mx-auto mt-6">
        <div className="bg-warning/10 border-2 border-warning rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="text-warning flex-shrink-0 mt-0.5" size={20} />
          <div className="flex-1">
            <h3 className="font-accents text-sm font-bold text-text-primary mb-1">
              Important Notice
            </h3>
            <p className="font-body text-xs text-text-secondary leading-relaxed">
              PokeQuest is an independent portfolio project and is not endorsed by, affiliated with, or sponsored by 
              Nintendo, The Pokémon Company, or any other official entity. All Pokémon-related trademarks and copyrights 
              belong to their respective owners.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Spacing */}
      <div className="h-8"></div>
    </div>
  );
}