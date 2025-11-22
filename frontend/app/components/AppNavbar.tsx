// components/AppNavbar.tsx
"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
// import { redirect } from "next/navigation";
import {
  Menu,
  X,
  Map,
  Package,
  Trophy,
  User,
  Settings,
  LogOut,
  Bell,
  Home,
  Compass,
  Users,
  BarChart3,
  MessageSquare,
  Gamepad2,
  Gift,
  Award,
} from "lucide-react";
import Switcher from "./Switcher";
import { UserState } from "../utils/slices/userSlice";
import { useStore } from "../utils/store/store";
import { redirect } from "next/navigation";

interface AppNavbarProps {
  user: UserState | null;
}

export default function AppNavbar({ user }: AppNavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [notifications, setNotifications] = useState(3); // Mock notification count
  const { logout } = useStore();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menus on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setProfileOpen(false);
        setNotificationsOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  // Prevent scroll when mobile menu is open
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

  // Main navigation links
  const navLinks = [
    { href: "/app", label: "Dashboard", icon: Home, exact: true },
    { href: "/app/map", label: "Map", icon: Map },
    { href: "/app/inventory", label: "Inventory", icon: Package },
    { href: "/app/pokedex", label: "Pokédex", icon: Gamepad2 },
    { href: "/app/leaderboard", label: "Leaderboard", icon: Trophy },
    { href: "/app/friends", label: "Friends", icon: Users },
    { href: "/app/battles", label: "Battles", icon: Award },
  ];

  // Profile dropdown links
  const profileLinks = [
    { href: "/app/profile", label: "My Profile", icon: User },
    { href: "/app/stats", label: "Statistics", icon: BarChart3 },
    { href: "/app/rewards", label: "Rewards", icon: Gift },
    { href: "/app/settings", label: "Settings", icon: Settings },
  ];

  // Check if link is active
  const isActiveLink = (href: string, exact?: boolean) => {
    if (exact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (e) {
      console.error(e);
    }
  };

  // Mock notifications
  const mockNotifications = [
    {
      id: 1,
      type: "pokemon",
      message: "A rare Charizard appeared nearby!",
      time: "2 min ago",
      unread: true,
    },
    {
      id: 2,
      type: "battle",
      message: "You won a battle against Trainer Alex!",
      time: "1 hour ago",
      unread: true,
    },
    {
      id: 3,
      type: "friend",
      message: "Sarah sent you a friend request",
      time: "3 hours ago",
      unread: true,
    },
    {
      id: 4,
      type: "achievement",
      message: "Achievement unlocked: Catch 100 Pokémon",
      time: "1 day ago",
      unread: false,
    },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[var(--color-surface)]/95 backdrop-blur-lg shadow-xl border-b-2 border-[var(--color-border)]"
            : "bg-[var(--color-surface)]/90 backdrop-blur-md border-b border-[var(--color-border)]"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-18">
            {/* Logo */}
            <Link
              href="/app"
              className="flex items-center gap-2 font-logo text-base sm:text-lg md:text-xl text-[var(--color-accent)] hover:text-[var(--color-accent-secondary)] transition-colors group"
            >
              <span className="relative">
                PokeQuest
                <span className="absolute inset-0 bg-[var(--color-glow)] blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActiveLink(link.href, link.exact)
                      ? "bg-[var(--color-accent)] text-white shadow-md"
                      : "text-[var(--color-text-primary)] hover:bg-[var(--color-hover)] hover:text-[var(--color-accent)]"
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* User Level & XP (Desktop) */}
              <div className="hidden lg:flex items-center gap-3 px-3 py-2 rounded-lg bg-[var(--color-hover)] border border-[var(--color-border)]">
                <div className="font-accents-secondary text-xs">
                  <div className="text-[var(--color-accent)] font-bold">
                    LVL {user?.stats.level}
                  </div>
                  <div className="text-[var(--color-text-secondary)]">
                    {user?.stats.xp} XP
                  </div>
                </div>
              </div>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => {
                    setNotificationsOpen(!notificationsOpen);
                    setProfileOpen(false);
                  }}
                  className="relative p-2 rounded-lg text-[var(--color-text-primary)] hover:bg-[var(--color-hover)] transition-all border border-[var(--color-border)]"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {notifications > 0 && (
                    <span className="absolute top-0 right-0 w-4 h-4 bg-[var(--color-error)] text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {notifications}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {notificationsOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setNotificationsOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto bg-[var(--color-surface)] rounded-lg border-2 border-[var(--color-border)] shadow-2xl z-20">
                      <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between">
                        <h3 className="font-semibold text-[var(--color-text-primary)]">
                          Notifications
                        </h3>
                        <button className="text-xs text-[var(--color-accent)] hover:text-[var(--color-accent-secondary)]">
                          Mark all read
                        </button>
                      </div>
                      <div className="py-2">
                        {mockNotifications.map((notif) => (
                          <div
                            key={notif.id}
                            className={`px-4 py-3 hover:bg-[var(--color-hover)] transition-colors cursor-pointer border-l-4 ${
                              notif.unread
                                ? "border-[var(--color-accent)] bg-[var(--color-hover)]/30"
                                : "border-transparent"
                            }`}
                          >
                            <p className="text-sm text-[var(--color-text-primary)] mb-1">
                              {notif.message}
                            </p>
                            <p className="text-xs text-[var(--color-text-secondary)]">
                              {notif.time}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <Switcher />

              {/* Profile Dropdown (Desktop) */}
              <div className="hidden lg:block relative">
                <button
                  onClick={() => {
                    setProfileOpen(!profileOpen);
                    setNotificationsOpen(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[var(--color-hover)] transition-all border border-[var(--color-border)]"
                >
                  <div className="w-8 h-8 rounded-full bg-[var(--color-accent)] flex items-center justify-center text-white font-bold text-sm">
                    {user?.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-[var(--color-text-primary)] hidden xl:inline">
                    {user?.username}
                  </span>
                </button>

                {/* Profile Dropdown Menu */}
                {profileOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setProfileOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-56 bg-[var(--color-surface)] rounded-lg border-2 border-[var(--color-border)] shadow-2xl z-20 overflow-hidden">
                      <div className="p-4 border-b border-[var(--color-border)] bg-[var(--color-hover)]">
                        <p className="font-semibold text-[var(--color-text-primary)]">
                          {user?.username}
                        </p>
                        <p className="text-sm text-[var(--color-text-secondary)] truncate">
                          {user?.email}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="text-xs font-accents-secondary">
                            <span className="text-[var(--color-accent)] font-bold">
                              LVL {user?.stats.level}
                            </span>
                            <span className="text-[var(--color-text-secondary)] ml-2">
                              {user?.stats.xp} XP
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="py-2">
                        {profileLinks.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setProfileOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                              isActiveLink(link.href)
                                ? "bg-[var(--color-hover)] text-[var(--color-accent)]"
                                : "text-[var(--color-text-primary)] hover:bg-[var(--color-hover)]"
                            }`}
                          >
                            <link.icon className="w-4 h-4" />
                            <span className="text-sm">{link.label}</span>
                          </Link>
                        ))}
                      </div>

                      <div className="border-t border-[var(--color-border)]">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-3 w-full hover:bg-[var(--color-error)]/10 text-[var(--color-error)] transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span className="text-sm font-medium">Logout</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="lg:hidden p-2 rounded-lg text-[var(--color-text-primary)] hover:bg-[var(--color-hover)] transition-all border border-[var(--color-border)]"
                aria-label="Toggle menu"
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
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${
          menuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMenuOpen(false)}
      />

      {/* Mobile Menu Drawer */}
      <div
        className={`fixed top-16 md:top-18 right-0 bottom-0 w-full sm:w-80 bg-[var(--color-surface)] z-40 lg:hidden transform transition-transform duration-300 ease-out shadow-2xl overflow-y-auto ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* User Info */}
          <div className="p-6 border-b border-[var(--color-border)] bg-[var(--color-hover)]">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-[var(--color-accent)] flex items-center justify-center text-white font-bold text-2xl border-2 border-[var(--color-accent-secondary)]">
                {user?.username.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-lg text-[var(--color-text-primary)]">
                  {user?.username}
                </p>
                <p className="text-sm text-[var(--color-text-secondary)] truncate">
                  {user?.email}
                </p>
                <div className="flex items-center gap-2 mt-1 font-accents-secondary text-sm">
                  <span className="text-[var(--color-accent)] font-bold">
                    LVL {user?.stats.level}
                  </span>
                  <span className="text-[var(--color-text-secondary)]">
                    {user?.stats.xp} XP
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-4 space-y-1">
            <div className="mb-4">
              <p className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-2 px-2">
                Main Navigation
              </p>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 p-3 rounded-lg font-medium transition-all ${
                    isActiveLink(link.href, link.exact)
                      ? "bg-[var(--color-accent)] text-white shadow-md"
                      : "text-[var(--color-text-primary)] hover:bg-[var(--color-hover)] hover:text-[var(--color-accent)]"
                  }`}
                >
                  <link.icon className="w-5 h-5" />
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="pt-4 border-t border-[var(--color-border)]">
              <p className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-2 px-2">
                Account
              </p>
              {profileLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 p-3 rounded-lg font-medium transition-all ${
                    isActiveLink(link.href)
                      ? "bg-[var(--color-hover)] text-[var(--color-accent)]"
                      : "text-[var(--color-text-primary)] hover:bg-[var(--color-hover)]"
                  }`}
                >
                  <link.icon className="w-5 h-5" />
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-[var(--color-border)]">
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-3 w-full p-4 rounded-lg bg-[var(--color-error)]/10 text-[var(--color-error)] hover:bg-[var(--color-error)]/20 transition-all font-semibold"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Spacer */}
      <div className="h-16 md:h-18" />
    </>
  );
}
