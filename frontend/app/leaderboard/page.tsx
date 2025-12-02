"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/app/utils/store/store";
import { api } from "@/app/utils/api/api";
import AppNavbar from "@/app/components/AppNavbar";
import {
  Trophy,
  Medal,
  Award,
  Crown,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Star,
  Zap,
  Users,
  Target,
  ArrowUp,
} from "lucide-react";
import LandingNavbar from "../components/LandingNavbar";

interface LeaderboardUser {
  _id: string;
  username: string;
  stats: {
    level: number;
    xp: number;
    totalCaptures: number;
  };
  rank: number;
}

interface LeaderboardResponse {
  users: LeaderboardUser[];
  currentUser: LeaderboardUser | null;
  totalUsers: number;
}

const USERS_PER_PAGE = 20;

export default function LeaderboardPage() {
  const router = useRouter();
  const { user, setUser } = useStore();

  const [leaderboard, setLeaderboard] = useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const checkUser = async () => {
        try {
            const response = await api.get("/api/user/get-user");

            setUser(response.data.data);
        } catch (e) {
            console.log(e);
        }
    }
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.get("/api/spawn/leaderboard");
        setLeaderboard(response.data);
      } catch (err: any) {
        console.error("Failed to fetch leaderboard:", err);
        setError(err?.response?.data?.message || "Failed to load leaderboard");
      } finally {
        setLoading(false);
      }
    };

    checkUser();
    fetchLeaderboard();
  }, []);

  // Paginate users
  const paginatedData = useMemo(() => {
    if (!leaderboard) return { users: [], totalPages: 0, currentPageUsers: [] };

    const totalPages = Math.ceil(leaderboard.users.length / USERS_PER_PAGE);
    const startIndex = (currentPage - 1) * USERS_PER_PAGE;
    const endIndex = startIndex + USERS_PER_PAGE;
    const currentPageUsers = leaderboard.users.slice(startIndex, endIndex);

    return {
      users: leaderboard.users,
      totalPages,
      currentPageUsers,
    };
  }, [leaderboard, currentPage]);

  // Check if current user is on current page
  const isCurrentUserOnPage = useMemo(() => {
    if (!leaderboard?.currentUser || !user) return false;
    
    return paginatedData.currentPageUsers.some(
      (u) => u._id === leaderboard.currentUser?._id
    );
  }, [leaderboard?.currentUser, paginatedData.currentPageUsers, user]);

  const showUserAtBottom = leaderboard?.currentUser && !isCurrentUserOnPage;

  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = () => setCurrentPage(paginatedData.totalPages);
  const goToNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, paginatedData.totalPages));
  const goToPrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const goToPage = (page: number) => setCurrentPage(page);

  const jumpToMyRank = () => {
    if (!leaderboard?.currentUser) return;
    const userPage = Math.ceil(leaderboard.currentUser.rank / USERS_PER_PAGE);
    setCurrentPage(userPage);
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="text-accent-tertiary" size={32} strokeWidth={2} />;
      case 2:
        return <Medal className="text-text-secondary" size={28} strokeWidth={2} />;
      case 3:
        return <Award className="text-warning" size={28} strokeWidth={2} />;
      default:
        return (
          <div className="w-10 h-10 rounded-full bg-hover flex items-center justify-center">
            <span className="font-accents font-bold text-text-primary text-sm">
              {rank}
            </span>
          </div>
        );
    }
  };

  const formatNumber = (num: number) => num.toLocaleString();

  if (loading) {
    return (
      <div className="min-h-screen bg-bg sky-gradient flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 animate-spin text-accent" size={48} />
          <p className="font-accents text-text-primary">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bg sky-gradient flex items-center justify-center p-4">
        <div className="bg-surface rounded-2xl border-4 border-accent-red p-8 max-w-md text-center">
          {user ? <AppNavbar user={user} /> : <LandingNavbar />}
          <AlertCircle className="mx-auto mb-4 text-accent-red" size={48} />
          <h2 className="font-accents text-xl text-text-primary mb-2">
            Error Loading Leaderboard
          </h2>
          <p className="font-body text-sm text-text-secondary mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-accent text-black font-accents rounded-xl hover:bg-accent/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  console.log(user)

  return (
    <div className="min-h-screen bg-bg sky-gradient p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <header className="max-w-7xl mx-auto mb-6 sm:mb-8 relative z-50">
        {user ? <AppNavbar user={user} /> : <LandingNavbar />}
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto">
        {/* Page Title */}
        <div className="mb-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Trophy className="text-accent-tertiary" size={40} />
            <h1 className="font-logo text-4xl sm:text-5xl text-text-primary text-center">
              Leaderboard
            </h1>
          </div>
          <p className="font-body text-sm sm:text-base text-text-secondary text-center">
            {formatNumber(leaderboard?.totalUsers || 0)} trainers competing worldwide
          </p>
        </div>

        {/* Current User Stats Card (if logged in) */}
        {user && leaderboard?.currentUser && (
          <div className="mb-6 bg-gradient-to-r from-accent/20 to-accent-secondary/20 rounded-2xl border-4 border-accent shadow-lg p-6 spawn-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-accents text-xl text-text-primary font-bold flex items-center gap-2">
                <Target className="text-accent" size={24} />
                Your Rank
              </h2>
              <div className="flex items-center gap-3">
                <div className="px-4 py-2 bg-surface rounded-xl border-2 border-border">
                  <span className="font-accents text-2xl font-bold text-accent">
                    #{leaderboard.currentUser.rank}
                  </span>
                </div>
                {!isCurrentUserOnPage && (
                  <button
                    onClick={jumpToMyRank}
                    className="px-4 py-2 bg-accent hover:bg-accent/90 text-text-primary font-accents text-sm rounded-xl border-2 border-text-primary transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                  >
                    <ArrowUp size={16} />
                    Jump to My Rank
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-surface/80 backdrop-blur-sm rounded-xl p-3 text-center">
                <div className="flex items-center justify-center mb-1">
                  <Zap className="text-accent-secondary" size={20} />
                </div>
                <div className="font-accents text-xs text-text-secondary mb-1">XP</div>
                <div className="font-accents text-lg font-bold text-text-primary">
                  {formatNumber(leaderboard.currentUser.stats.xp)}
                </div>
              </div>

              <div className="bg-surface/80 backdrop-blur-sm rounded-xl p-3 text-center">
                <div className="flex items-center justify-center mb-1">
                  <Star className="text-accent" size={20} />
                </div>
                <div className="font-accents text-xs text-text-secondary mb-1">Level</div>
                <div className="font-accents text-lg font-bold text-text-primary">
                  {leaderboard.currentUser.stats.level}
                </div>
              </div>

              <div className="bg-surface/80 backdrop-blur-sm rounded-xl p-3 text-center">
                <div className="flex items-center justify-center mb-1">
                  <Trophy className="text-accent-tertiary" size={20} />
                </div>
                <div className="font-accents text-xs text-text-secondary mb-1">Caught</div>
                <div className="font-accents text-lg font-bold text-text-primary">
                  {formatNumber(leaderboard.currentUser.stats.totalCaptures)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard List */}
        <div className="bg-surface rounded-2xl border-4 border-border shadow-lg overflow-hidden mb-6">
          {/* Header */}
          <div className="bg-hover/50 px-4 sm:px-6 py-4 border-b-2 border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="text-accent" size={20} />
                <span className="font-accents text-sm font-bold text-text-primary">
                  Rank {(currentPage - 1) * USERS_PER_PAGE + 1} -{" "}
                  {Math.min(currentPage * USERS_PER_PAGE, leaderboard?.totalUsers || 0)}
                </span>
              </div>
              <span className="font-body text-xs text-text-secondary">
                Page {currentPage} of {paginatedData.totalPages}
              </span>
            </div>
          </div>

          {/* User List */}
          <div className="divide-y-2 divide-border">
            {paginatedData.currentPageUsers.map((player) => {
              const isCurrentUser = user && player._id === user._id;
              return (
                <div
                  key={player._id}
                  className={`px-4 sm:px-6 py-4 flex items-center justify-between transition-all hover:bg-hover/30 ${
                    isCurrentUser ? "bg-accent/10" : ""
                  }`}
                >
                  {/* Rank & Username */}
                  <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                    <div className="flex-shrink-0">{getRankIcon(player.rank)}</div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`font-accents text-base sm:text-lg font-bold truncate ${
                            isCurrentUser ? "text-accent" : "text-text-primary"
                          }`}
                        >
                          {player.username}
                        </span>
                        {isCurrentUser && (
                          <span className="px-2 py-0.5 bg-accent text-text-primary rounded text-[10px] font-accents font-bold">
                            YOU
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 sm:gap-3 text-xs text-text-secondary">
                        <span className="flex items-center gap-1">
                          <Star size={12} className="text-accent" />
                          <span className="font-accents">Lv. {player.stats.level}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Trophy size={12} className="text-accent-tertiary" />
                          <span className="font-mono">
                            {formatNumber(player.stats.totalCaptures || 0)}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* XP */}
                  <div className="text-right flex-shrink-0">
                    <div className="font-accents text-lg sm:text-xl font-bold text-accent-secondary">
                      {formatNumber(player.stats.xp)}
                    </div>
                    <div className="font-body text-[10px] text-text-secondary">XP</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Current User Sticky Bottom (if not on page) */}
          {showUserAtBottom && leaderboard.currentUser && (
            <div className="border-t-4 border-accent bg-accent/20">
              <div className="px-4 sm:px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  <div className="flex-shrink-0">
                    {getRankIcon(leaderboard.currentUser.rank)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-accents text-base sm:text-lg font-bold text-accent truncate">
                        {leaderboard.currentUser.username}
                      </span>
                      <span className="px-2 py-0.5 bg-accent text-text-primary rounded text-[10px] font-accents font-bold">
                        YOU
                      </span>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 text-xs text-text-secondary">
                      <span className="flex items-center gap-1">
                        <Star size={12} className="text-accent" />
                        <span className="font-accents">
                          Lv. {leaderboard.currentUser.stats.level}
                        </span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Trophy size={12} className="text-accent-tertiary" />
                        <span className="font-mono">
                          {formatNumber(leaderboard.currentUser.stats.totalCaptures || 0)}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <div className="font-accents text-lg sm:text-xl font-bold text-accent-secondary">
                    {formatNumber(leaderboard.currentUser.stats.xp)}
                  </div>
                  <div className="font-body text-[10px] text-text-secondary">XP</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        <div className="bg-surface rounded-2xl border-4 border-border shadow-lg p-4">
          <div className="flex items-center justify-between gap-4">
            {/* Previous buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={goToFirstPage}
                disabled={currentPage === 1}
                className="p-2 rounded-lg bg-hover border-2 border-border hover:bg-accent hover:border-accent disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                aria-label="First page"
              >
                <ChevronsLeft size={20} className="text-text-primary" />
              </button>
              <button
                onClick={goToPrevPage}
                disabled={currentPage === 1}
                className="p-2 rounded-lg bg-hover border-2 border-border hover:bg-accent hover:border-accent disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                aria-label="Previous page"
              >
                <ChevronLeft size={20} className="text-text-primary" />
              </button>
            </div>

            {/* Page info */}
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <span className="font-accents text-sm text-text-secondary">Page</span>
              <div className="flex items-center gap-1">
                {/* Show max 7 page numbers */}
                {Array.from({ length: Math.min(7, paginatedData.totalPages) }, (_, i) => {
                  let pageNum;
                  if (paginatedData.totalPages <= 7) {
                    pageNum = i + 1;
                  } else if (currentPage <= 4) {
                    pageNum = i + 1;
                  } else if (currentPage >= paginatedData.totalPages - 3) {
                    pageNum = paginatedData.totalPages - 6 + i;
                  } else {
                    pageNum = currentPage - 3 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      className={`w-8 h-8 rounded-lg font-accents text-sm font-bold transition-all ${
                        currentPage === pageNum
                          ? "bg-accent text-text-primary border-2 border-text-primary"
                          : "bg-hover text-text-secondary hover:bg-accent/20"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <span className="font-accents text-sm text-text-secondary">
                of {paginatedData.totalPages}
              </span>
            </div>

            {/* Next buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={goToNextPage}
                disabled={currentPage === paginatedData.totalPages}
                className="p-2 rounded-lg bg-hover border-2 border-border hover:bg-accent hover:border-accent disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                aria-label="Next page"
              >
                <ChevronRight size={20} className="text-text-primary" />
              </button>
              <button
                onClick={goToLastPage}
                disabled={currentPage === paginatedData.totalPages}
                className="p-2 rounded-lg bg-hover border-2 border-border hover:bg-accent hover:border-accent disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                aria-label="Last page"
              >
                <ChevronsRight size={20} className="text-text-primary" />
              </button>
            </div>
          </div>
        </div>

        {/* Call to Action (if not logged in) */}
        {!user && (
          <div className="mt-6 bg-gradient-to-r from-accent/20 to-accent-secondary/20 rounded-2xl border-4 border-accent shadow-lg p-6 text-center">
            <Trophy className="mx-auto mb-3 text-accent-tertiary" size={48} />
            <h3 className="font-accents text-xl text-text-primary font-bold mb-2">
              Join the Competition!
            </h3>
            <p className="font-body text-sm text-text-secondary mb-4">
              Sign up to see your rank and compete with trainers worldwide
            </p>
            <button
              onClick={() => router.push("/login")}
              className="px-8 py-3 bg-gradient-to-r from-accent to-accent-secondary text-text-primary font-accents font-bold rounded-xl border-3 border-text-primary shadow-lg hover:scale-105 active:scale-95 transition-transform"
            >
              Sign Up / Login
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto mt-8 text-center">
        <p className="font-body text-xs sm:text-sm text-text-secondary">
          Rankings sorted by Total XP • Keep catching to climb higher!
        </p>
      </footer>
    </div>
  );
}