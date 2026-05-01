"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User, Users, ArrowRight, LogOut, ChevronRight,
  Shield, Video, Star, TrendingUp,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { signOut } from "@/lib/auth";
import type { UserRole } from "@/lib/supabase";

type UserData = {
  role: UserRole;
  email: string;
};

type Profile = {
  full_name: string | null;
};

export default function DashboardPage() {
  const router = useRouter();
  const [userData, setUserData]   = useState<UserData | null>(null);
  const [profile, setProfile]     = useState<Profile | null>(null);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/login"); return; }

      // Get role from users table, fall back to auth metadata
      const { data: uRow } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      const role: UserRole = uRow?.role ?? user.user_metadata?.role ?? "player";
      setUserData({ role, email: user.email ?? "" });

      // Fetch profile name
      const table = role === "player" ? "player_profiles" : "coach_profiles";
      const { data: prof } = await supabase
        .from(table)
        .select("full_name")
        .eq("user_id", user.id)
        .single();

      setProfile(prof ?? null);
      setLoading(false);
    }
    init();
  }, [router]);

  async function handleSignOut() {
    await signOut();
    router.push("/login");
  }

  const firstName = profile?.full_name?.split(" ")[0] ?? userData?.email?.split("@")[0] ?? "there";

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
          <p className="text-white/40 text-sm">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  const isPlayer = userData?.role === "player";

  // ── Player dashboard ───────────────────────────────────────────────────────
  const playerActions = [
    { icon: User,      label: "Complete my profile",    sub: "Add your stats, bio and contact info",    href: "/dashboard/player/profile", primary: true },
    { icon: Video,     label: "Upload highlight reel",  sub: "Add YouTube or Vimeo video links",         href: "/dashboard/player/profile" },
    { icon: Shield,    label: "Set profile visibility", sub: "Control who can see your profile",         href: "/dashboard/player/profile" },
    { icon: Star,      label: "View my evaluations",   sub: "See ratings from coaches",                 href: "/evaluations" },
  ];

  const coachActions = [
    { icon: Users,     label: "Browse player directory", sub: "Search and filter Australian players", href: "/directory",    primary: true },
    { icon: TrendingUp,label: "My saved players",        sub: "Players you've bookmarked",            href: "/saved" },
    { icon: Shield,    label: "Evaluations submitted",   sub: "Players you've rated",                 href: "/evaluations" },
    { icon: User,      label: "My coach profile",        sub: "Update your university details",       href: "/dashboard/coach/profile" },
  ];

  const actions = isPlayer ? playerActions : coachActions;

  return (
    <div className="min-h-screen bg-navy">
      {/* Header */}
      <header className="border-b border-white/10 bg-navy/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="font-black text-xl tracking-tight">
            <span className="text-gold">A</span>
            <span className="text-white">US CONNECT</span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
              <span className={`w-2 h-2 rounded-full ${isPlayer ? "bg-gold" : "bg-blue-400"}`} />
              <span className="text-white/60 text-xs font-medium capitalize">{userData?.role}</span>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 text-white/40 hover:text-white text-sm transition-colors"
            >
              <LogOut size={15} />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Welcome banner */}
        <div className="relative rounded-3xl overflow-hidden mb-10">
          <div className="absolute inset-0 bg-gradient-to-br from-gold/20 via-gold/5 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(201,168,76,0.15)_0%,transparent_60%)]" />
          <div className="relative border border-gold/20 rounded-3xl px-8 py-10 md:px-12 md:py-12">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gold/15 border border-gold/30 flex items-center justify-center flex-shrink-0">
                {isPlayer
                  ? <User className="text-gold" size={24} />
                  : <Users className="text-gold" size={24} />}
              </div>
              <div className="flex-1">
                <p className="text-gold/70 text-sm font-semibold uppercase tracking-widest mb-1">
                  {isPlayer ? "Player Dashboard" : "Coach Dashboard"}
                </p>
                <h1 className="text-3xl md:text-4xl font-black text-white">
                  Welcome back, {firstName}
                </h1>
                <p className="text-white/50 mt-1.5 text-sm">
                  {isPlayer
                    ? "Complete your profile so coaches can find and evaluate you."
                    : "Browse the player directory and discover Australian talent."}
                </p>
              </div>
              <Link
                href={isPlayer ? "/dashboard/player/profile" : "/directory"}
                className="btn-primary whitespace-nowrap self-start sm:self-center"
              >
                {isPlayer ? "Complete profile" : "Browse players"}
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>

        {/* Profile completion notice for players */}
        {isPlayer && !profile?.full_name && (
          <div className="flex items-start gap-4 px-6 py-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 mb-8">
            <span className="w-2 h-2 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
            <div>
              <p className="text-amber-300 font-semibold text-sm">Your profile is incomplete</p>
              <p className="text-amber-300/60 text-xs mt-0.5">
                Add your details so coaches can discover and contact you.{" "}
                <Link href="/dashboard/player/profile" className="underline hover:text-amber-300 transition-colors">
                  Complete profile →
                </Link>
              </p>
            </div>
          </div>
        )}

        {/* Quick actions grid */}
        <div className="mb-8">
          <h2 className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-4">
            Quick actions
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {actions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.label}
                  href={action.href}
                  className={`group flex items-center gap-4 p-5 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 ${
                    action.primary
                      ? "border-gold/30 bg-gold/[0.06] hover:bg-gold/[0.1] hover:border-gold/50"
                      : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20"
                  }`}
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                    action.primary
                      ? "bg-gold/15 border border-gold/25 group-hover:bg-gold/25"
                      : "bg-white/5 border border-white/10 group-hover:bg-white/10"
                  }`}>
                    <Icon size={18} className={action.primary ? "text-gold" : "text-white/50"} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-sm ${action.primary ? "text-gold" : "text-white"}`}>
                      {action.label}
                    </p>
                    <p className="text-white/40 text-xs mt-0.5 truncate">{action.sub}</p>
                  </div>
                  <ChevronRight
                    size={16}
                    className={`flex-shrink-0 transition-transform group-hover:translate-x-0.5 ${
                      action.primary ? "text-gold/50" : "text-white/20"
                    }`}
                  />
                </Link>
              );
            })}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4">
          {(isPlayer
            ? [
                { label: "Profile views",    value: "—", sub: "in the last 30 days" },
                { label: "Coach messages",   value: "—", sub: "unread" },
                { label: "Evaluations",      value: "—", sub: "submitted by coaches" },
              ]
            : [
                { label: "Players browsed",  value: "—", sub: "in the last 30 days" },
                { label: "Evaluations sent", value: "—", sub: "total" },
                { label: "Saved players",    value: "—", sub: "in your shortlist" },
              ]
          ).map((stat) => (
            <div key={stat.label} className="card p-5 text-center">
              <div className="text-2xl font-black text-gold mb-1">{stat.value}</div>
              <div className="text-white text-xs font-semibold">{stat.label}</div>
              <div className="text-white/30 text-xs mt-0.5">{stat.sub}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
