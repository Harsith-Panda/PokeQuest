"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, Compass, Trophy, Mail, LogIn, UserPlus } from "lucide-react";
import Switcher from "./Switcher";

export default function LandingNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  // Prevent scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [menuOpen]);

  const navLinks = [
    { href: "#features", label: "Features", icon: Compass },
    { href: "#leaderboard", label: "Leaderboard", icon: Trophy },
    { href: "#contact", label: "Contact", icon: Mail },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? "bg-surface/80 backdrop-blur-lg shadow-lg border-b border-border"
            : "bg-transparent backdrop-blur-sm"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            {/* Logo */}
            <Link
              href="/"
              className="font-logo text-lg sm:text-xl md:text-2xl text-green-500 hover:text-green-600 transition-colors relative group"
            >
              <span className="relative z-10">PokeQuest</span>
              <span className="absolute inset-0 bg-glow blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-text-primary hover:bg-text-primary/40 hover:text-accent transition-all"
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Switcher />

              {/* Desktop Auth Buttons */}
              <div className="hidden lg:flex items-center gap-2">
                <Link
                  href="/login"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-primary hover:bg-hover transition-all"
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="flex items-center gap-2 px-5 py-2 rounded-lg bg-accent hover:bg-accent-secondary text-white font-medium text-sm transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
                >
                  <UserPlus className="w-4 h-4" />
                  Sign Up
                </Link>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="lg:hidden p-2 rounded-lg text-text-primary hover:bg-hover transition-all active:scale-95"
                aria-label="Toggle menu"
                aria-expanded={menuOpen}
              >
                {menuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 bg-bg backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${
          menuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMenuOpen(false)}
      />

      {/* Mobile Menu Drawer */}
      <div
        className={`fixed top-16 md:top-20 right-0 bottom-0 w-full sm:w-80 bg-bg z-40 lg:hidden transform transition-transform duration-300 ease-out shadow-2xl ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <nav className="flex flex-col p-6 gap-2 h-full overflow-y-auto">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 p-4 rounded-lg text-primary hover:bg-hover hover:text-accent transition-all font-medium"
            >
              <link.icon className="w-5 h-5" />
              {link.label}
            </Link>
          ))}

          <div className="mt-4 pt-4 border-t border-border space-y-2">
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full p-4 rounded-lg border-2 border-accent text-accent font-semibold transition-all hover:bg-accent hover:text-white"
            >
              <LogIn className="w-5 h-5" />
              Login
            </Link>

            <Link
              href="/signup"
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full p-4 rounded-lg bg-accent hover:bg-accent-secondary text-white font-semibold transition-all shadow-md hover:shadow-lg active:scale-95"
            >
              <UserPlus className="w-5 h-5" />
              Sign Up
            </Link>
          </div>

          {/* Mobile Menu Footer */}
          <div className="mt-auto pt-6 text-center text-sm text-text-secondary">
            © 2024 PokeQuest. Catch 'em all!
          </div>
        </nav>
      </div>

      {/* Spacer */}
      <div className="h-16 md:h-20" />
    </>
  );
}

// "use client";
// import Link from "next/link";
// import { useState, useEffect } from "react";
// import { Menu, X, Compass, Trophy, Mail, LogIn, UserPlus } from "lucide-react";
// import Switcher from "./Switcher";

// export default function LandingNavbar() {
//   const [menuOpen, setMenuOpen] = useState(false);
//   const [scrolled, setScrolled] = useState(false);

//   useEffect(() => {
//     const handleScroll = () => {
//       setScrolled(window.scrollY > 20);
//     };
//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   useEffect(() => {
//     const handleEscape = (e: KeyboardEvent) => {
//       if (e.key === "Escape") setMenuOpen(false);
//     };
//     document.addEventListener("keydown", handleEscape);
//     return () => document.removeEventListener("keydown", handleEscape);
//   }, []);

//   useEffect(() => {
//     if (menuOpen) {
//       document.body.style.overflow = "hidden";
//     } else {
//       document.body.style.overflow = "unset";
//     }
//     return () => {
//       document.body.style.overflow = "unset";
//     };
//   }, [menuOpen]);

//   const navLinks = [
//     { href: "#features", label: "Features", icon: Compass },
//     { href: "#leaderboard", label: "Leaderboard", icon: Trophy },
//     { href: "#contact", label: "Contact", icon: Mail },
//   ];

//   return (
//     <>
//       <header
//         className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
//           scrolled
//             ? "bg-bg/95 dark:bg-[var(--color-surface)]/95 backdrop-blur-lg shadow-lg border-b border-gray-300 dark:border-[var(--color-border)]"
//             : "bg-bg/80 dark:bg-[var(--color-surface)]/80 backdrop-blur-md border-b border-gray-200 dark:border-[var(--color-border)]/50"
//         }`}
//       >
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-center h-16 md:h-20">
//             {/* Logo */}
//             <Link
//               href="/"
//               className="font-logo text-lg sm:text-xl md:text-2xl text-green-600 dark:text-[var(--color-accent)] hover:text-green-700 dark:hover:text-[var(--color-accent-secondary)] transition-colors relative group"
//             >
//               <span className="relative z-10">PokeQuest</span>
//               <span className="absolute inset-0 bg-green-400/20 dark:bg-[var(--color-glow)] blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
//             </Link>

//             {/* Desktop Navigation */}
//             <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
//               {navLinks.map((link) => (
//                 <Link
//                   key={link.href}
//                   href={link.href}
//                   className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-[var(--color-text-primary)] hover:bg-gray-100 dark:hover:bg-[var(--color-hover)] hover:text-green-600 dark:hover:text-[var(--color-accent)] transition-all"
//                 >
//                   <link.icon className="w-4 h-4" />
//                   {link.label}
//                 </Link>
//               ))}
//             </nav>

//             {/* Right Actions */}
//             <div className="flex items-center gap-2 sm:gap-3">
//               <Switcher />

//               {/* Desktop Auth Buttons */}
//               <div className="hidden lg:flex items-center gap-2">
//                 <Link
//                   href="/login"
//                   className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-[var(--color-text-primary)] hover:bg-gray-100 dark:hover:bg-[var(--color-hover)] transition-all"
//                 >
//                   <LogIn className="w-4 h-4" />
//                   Login
//                 </Link>
//                 <Link
//                   href="/signup"
//                   className="flex items-center gap-2 px-5 py-2 rounded-lg bg-green-600 dark:bg-[var(--color-accent)] hover:bg-green-700 dark:hover:bg-[var(--color-accent-secondary)] text-white font-medium text-sm transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
//                 >
//                   <UserPlus className="w-4 h-4" />
//                   Sign Up
//                 </Link>
//               </div>

//               {/* Mobile Menu Button */}
//               <button
//                 onClick={() => setMenuOpen(!menuOpen)}
//                 className="lg:hidden p-2 rounded-lg text-gray-700 dark:text-[var(--color-text-primary)] hover:bg-gray-100 dark:hover:bg-[var(--color-hover)] transition-all active:scale-95"
//                 aria-label="Toggle menu"
//                 aria-expanded={menuOpen}
//               >
//                 {menuOpen ? (
//                   <X className="w-6 h-6" />
//                 ) : (
//                   <Menu className="w-6 h-6" />
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>
//       </header>

//       {/* Mobile Menu Overlay */}
//       <div
//         className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${
//           menuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
//         }`}
//         onClick={() => setMenuOpen(false)}
//       />

//       {/* Mobile Menu Drawer */}
//       <div
//         className={`fixed top-16 md:top-20 right-0 bottom-0 w-full sm:w-80 bg-white dark:bg-[var(--color-surface)] z-40 lg:hidden transform transition-transform duration-300 ease-out shadow-2xl ${
//           menuOpen ? "translate-x-0" : "translate-x-full"
//         }`}
//       >
//         <nav className="flex flex-col p-6 gap-2 h-full overflow-y-auto">
//           {navLinks.map((link) => (
//             <Link
//               key={link.href}
//               href={link.href}
//               onClick={() => setMenuOpen(false)}
//               className="flex items-center gap-3 p-4 rounded-lg text-gray-700 dark:text-[var(--color-text-primary)] hover:bg-gray-100 dark:hover:bg-[var(--color-hover)] hover:text-green-600 dark:hover:text-[var(--color-accent)] transition-all font-medium"
//             >
//               <link.icon className="w-5 h-5" />
//               {link.label}
//             </Link>
//           ))}

//           <div className="mt-4 pt-4 border-t border-gray-200 dark:border-[var(--color-border)] space-y-2">
//             <Link
//               href="/login"
//               onClick={() => setMenuOpen(false)}
//               className="flex items-center justify-center gap-2 w-full p-4 rounded-lg border-2 border-green-600 dark:border-[var(--color-accent)] text-green-600 dark:text-[var(--color-accent)] font-semibold transition-all hover:bg-green-50 dark:hover:bg-[var(--color-accent)]/10"
//             >
//               <LogIn className="w-5 h-5" />
//               Login
//             </Link>

//             <Link
//               href="/signup"
//               onClick={() => setMenuOpen(false)}
//               className="flex items-center justify-center gap-2 w-full p-4 rounded-lg bg-green-600 dark:bg-[var(--color-accent)] hover:bg-green-700 dark:hover:bg-[var(--color-accent-secondary)] text-white font-semibold transition-all shadow-md hover:shadow-lg active:scale-95"
//             >
//               <UserPlus className="w-5 h-5" />
//               Sign Up
//             </Link>
//           </div>

//           {/* Mobile Menu Footer */}
//           <div className="mt-auto pt-6 text-center text-sm text-gray-500 dark:text-[var(--color-text-secondary)]">
//             © 2024 PokeQuest. Catch 'em all!
//           </div>
//         </nav>
//       </div>

//       {/* Spacer */}
//       <div className="h-16 md:h-20" />
//     </>
//   );
// }
