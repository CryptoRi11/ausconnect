"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  LogOut, Users, ClipboardList, UserCheck,
  Eye, EyeOff, ChevronRight, X, Check, AlertCircle, RefreshCw,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type AdminPlayer = {
  id: string;
  user_id: string;
  full_name: string | null;
  location_city: string | null;
  location_state: string | null;
  position: string | null;
  is_visible: boolean;
  created_at: string;
  users: { email: string; subscription_status: string } | null;
};

type AdminCoach = {
  id: string;
  user_id: string;
  full_name: string | null;
  university: string | null;
  position_title: string | null;
  created_at: string;
  users: { email: string; subscription_status: string } | null;
};

type EvalForm = {
  offensive_ability: number;
  defensive_skills: number;
  overall_iq: number;
  physical_ability: number;
  culture_rating: number;
  notes: string;
};

const BLANK_EVAL: EvalForm = {
  offensive_ability: 0, defensive_skills: 0, overall_iq: 0,
  physical_ability: 0, culture_rating: 0, notes: "",
};

const EVAL_FIELDS: { key: keyof Omit<EvalForm, "notes">; label: string }[] = [
  { key: "offensive_ability", label: "Offensive Ability" },
  { key: "defensive_skills",  label: "Defensive Skills"  },
  { key: "overall_iq",        label: "Overall IQ"        },
  { key: "physical_ability",  label: "Physical Ability"  },
  { key: "culture_rating",    label: "Culture Rating"    },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-AU", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function initial(name: string | null) {
  return (name ?? "?")[0]?.toUpperCase() ?? "?";
}

function adminHeaders(token: string) {
  return { "Content-Type": "application/json", "x-admin-token": token };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SubBadge({ status, onClick }: { status: string; onClick?: () => void }) {
  const active = status !== "free";
  return (
    <button
      onClick={onClick}
      title="Click to toggle"
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
        active
          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25 hover:bg-emerald-500/20"
          : "bg-white/5 text-white/40 border-white/10 hover:bg-white/10 hover:text-white/60"
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-emerald-400" : "bg-white/20"}`} />
      {active ? "Active" : "Free"}
    </button>
  );
}

function Spinner() {
  return (
    <div className="flex justify-center py-24">
      <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
    </div>
  );
}

function EvalSlider({
  label, value, onChange,
}: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="text-white/70 text-sm font-medium">{label}</label>
        <span className="text-gold font-black text-base tabular-nums">
          {value}<span className="text-white/25 font-normal text-xs">/20</span>
        </span>
      </div>
      <div className="relative h-2 bg-white/10 rounded-full">
        <div
          className="absolute left-0 top-0 h-2 bg-gradient-to-r from-gold/70 to-gold rounded-full transition-all pointer-events-none"
          style={{ width: `${(value / 20) * 100}%` }}
        />
        <input
          type="range" min={0} max={20} step={1} value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer"
        />
      </div>
    </div>
  );
}

// ─── Login Gate ───────────────────────────────────────────────────────────────

function LoginGate({ onLogin }: { onLogin: (tok: string) => void }) {
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res  = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const json = await res.json();
      if (json.ok) {
        onLogin(password);
      } else {
        setError("Incorrect password. Access denied.");
      }
    } catch {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <span className="font-black text-2xl tracking-tight">
            <span className="text-gold">A</span><span className="text-white">US CONNECT</span>
          </span>
          <p className="text-white/30 text-sm mt-2 tracking-widest uppercase text-xs">Admin Panel</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 space-y-5"
        >
          <h1 className="text-white font-bold text-lg">Staff Sign In</h1>

          <div>
            <label className="block text-white/50 text-xs font-semibold uppercase tracking-wider mb-2">
              Admin Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter admin password"
              autoFocus
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/25 focus:outline-none focus:border-gold/50 focus:bg-white/[0.07] transition-all"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle size={14} className="flex-shrink-0" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-3 rounded-xl bg-gold text-navy font-bold text-sm hover:bg-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Verifying…" : "Access Admin Panel"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Player Detail Side-Panel ─────────────────────────────────────────────────

function PlayerPanel({
  player, onClose, onToggleVisibility, onToggleSub,
}: {
  player: AdminPlayer;
  onClose: () => void;
  onToggleVisibility: (id: string) => void;
  onToggleSub: (id: string) => void;
}) {
  const rows = [
    { label: "Email",        value: player.users?.email },
    { label: "Position",     value: player.position },
    { label: "Location",     value: [player.location_city, player.location_state].filter(Boolean).join(", ") || null },
    { label: "Subscription", value: player.users?.subscription_status },
    { label: "Visibility",   value: player.is_visible ? "Public" : "Hidden" },
    { label: "Joined",       value: fmtDate(player.created_at) },
    { label: "User ID",      value: player.user_id },
    { label: "Profile ID",   value: player.id },
  ];

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="flex-1 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="w-full max-w-sm bg-navy border-l border-white/10 overflow-y-auto flex flex-col">
        <div className="sticky top-0 bg-navy/95 backdrop-blur-md border-b border-white/10 px-5 py-4 flex items-center justify-between">
          <h3 className="text-white font-bold">Player Details</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-5 flex-1 space-y-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gold/15 border border-gold/30 flex items-center justify-center flex-shrink-0">
              <span className="text-gold font-black text-xl">{initial(player.full_name)}</span>
            </div>
            <div>
              <h4 className="text-white font-bold text-lg leading-tight">{player.full_name ?? "—"}</h4>
              <p className="text-gold/80 text-sm">{player.position ?? "No position"}</p>
            </div>
          </div>

          <div className="rounded-xl border border-white/5 divide-y divide-white/5">
            {rows.map(({ label, value }) => (
              <div key={label} className="flex justify-between items-start gap-4 px-4 py-3">
                <span className="text-white/35 text-xs font-semibold uppercase tracking-wider flex-shrink-0 mt-0.5">{label}</span>
                <span className="text-white text-sm font-medium text-right break-all">{value ?? "—"}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onToggleVisibility(player.id)}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/10 text-white/60 hover:text-white hover:border-white/20 text-sm font-semibold transition-all"
            >
              {player.is_visible ? <EyeOff size={14} /> : <Eye size={14} />}
              {player.is_visible ? "Hide" : "Show"}
            </button>
            <button
              onClick={() => onToggleSub(player.user_id)}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gold/10 border border-gold/25 text-gold hover:bg-gold/20 text-sm font-semibold transition-all"
            >
              Toggle Sub
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Admin Page ──────────────────────────────────────────────────────────

type Tab = "players" | "evaluations" | "coaches";

export default function AdminPage() {
  const [authed, setAuthed]       = useState(false);
  const [token, setToken]         = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("players");

  const [players, setPlayers]           = useState<AdminPlayer[]>([]);
  const [playersLoaded, setPlayersLoaded] = useState(false);
  const [playersLoading, setPlayersLoading] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<AdminPlayer | null>(null);

  const [coaches, setCoaches]           = useState<AdminCoach[]>([]);
  const [coachesLoaded, setCoachesLoaded] = useState(false);
  const [coachesLoading, setCoachesLoading] = useState(false);

  const [evalPlayer, setEvalPlayer] = useState<AdminPlayer | null>(null);
  const [evalId, setEvalId]         = useState<string | null>(null);
  const [evalForm, setEvalForm]     = useState<EvalForm>(BLANK_EVAL);
  const [evalSaving, setEvalSaving] = useState(false);
  const [evalSaved, setEvalSaved]   = useState(false);
  const [evalError, setEvalError]   = useState("");

  // Restore session from sessionStorage
  useEffect(() => {
    const tok = sessionStorage.getItem("admin_token");
    if (tok) { setToken(tok); setAuthed(true); }
  }, []);

  const fetchPlayers = useCallback(async (tok: string) => {
    setPlayersLoading(true);
    const res  = await fetch("/api/admin/players", { headers: adminHeaders(tok) });
    const data = await res.json();
    setPlayers(Array.isArray(data) ? data : []);
    setPlayersLoaded(true);
    setPlayersLoading(false);
  }, []);

  const fetchCoaches = useCallback(async (tok: string) => {
    setCoachesLoading(true);
    const res  = await fetch("/api/admin/coaches", { headers: adminHeaders(tok) });
    const data = await res.json();
    setCoaches(Array.isArray(data) ? data : []);
    setCoachesLoaded(true);
    setCoachesLoading(false);
  }, []);

  // Lazy-load data per tab
  useEffect(() => {
    if (!authed || !token) return;
    if ((activeTab === "players" || activeTab === "evaluations") && !playersLoaded) {
      fetchPlayers(token);
    }
    if (activeTab === "coaches" && !coachesLoaded) {
      fetchCoaches(token);
    }
  }, [authed, token, activeTab, playersLoaded, coachesLoaded, fetchPlayers, fetchCoaches]);

  function handleLogin(tok: string) {
    sessionStorage.setItem("admin_token", tok);
    setToken(tok);
    setAuthed(true);
    fetchPlayers(tok);
  }

  function handleSignOut() {
    sessionStorage.removeItem("admin_token");
    setAuthed(false);
    setToken("");
    setPlayers([]);
    setCoaches([]);
    setPlayersLoaded(false);
    setCoachesLoaded(false);
    setSelectedPlayer(null);
    setEvalPlayer(null);
  }

  // ── Mutations ──

  async function toggleVisibility(playerId: string) {
    const player = players.find(p => p.id === playerId);
    if (!player) return;
    const newVal = !player.is_visible;
    const update = (p: AdminPlayer) => p.id === playerId ? { ...p, is_visible: newVal } : p;
    setPlayers(prev => prev.map(update));
    setSelectedPlayer(prev => prev?.id === playerId ? { ...prev, is_visible: newVal } : prev);
    await fetch("/api/admin/players", {
      method: "PATCH",
      headers: adminHeaders(token),
      body: JSON.stringify({ id: playerId, updates: { is_visible: newVal } }),
    });
  }

  async function togglePlayerSub(userId: string) {
    const player = players.find(p => p.user_id === userId);
    if (!player) return;
    const current  = player.users?.subscription_status ?? "free";
    const newStatus = current === "free" ? "active" : "free";
    const patch = (p: AdminPlayer) =>
      p.user_id === userId ? { ...p, users: p.users ? { ...p.users, subscription_status: newStatus } : null } : p;
    setPlayers(prev => prev.map(patch));
    setSelectedPlayer(prev => prev?.user_id === userId && prev.users
      ? { ...prev, users: { ...prev.users, subscription_status: newStatus } }
      : prev);
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: adminHeaders(token),
      body: JSON.stringify({ id: userId, updates: { subscription_status: newStatus } }),
    });
  }

  async function toggleCoachSub(coach: AdminCoach) {
    const current   = coach.users?.subscription_status ?? "free";
    const newStatus = current === "free" ? "active" : "free";
    setCoaches(prev =>
      prev.map(c => c.id === coach.id ? { ...c, users: c.users ? { ...c.users, subscription_status: newStatus } : null } : c)
    );
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: adminHeaders(token),
      body: JSON.stringify({ id: coach.user_id, updates: { subscription_status: newStatus } }),
    });
  }

  async function selectEvalPlayer(player: AdminPlayer) {
    setEvalPlayer(player);
    setEvalId(null);
    setEvalForm(BLANK_EVAL);
    setEvalSaved(false);
    setEvalError("");

    const res      = await fetch(`/api/admin/evaluations?player_id=${player.id}`, { headers: adminHeaders(token) });
    const existing = await res.json();
    if (existing?.id) {
      setEvalId(existing.id);
      setEvalForm({
        offensive_ability: existing.offensive_ability ?? 0,
        defensive_skills:  existing.defensive_skills  ?? 0,
        overall_iq:        existing.overall_iq        ?? 0,
        physical_ability:  existing.physical_ability  ?? 0,
        culture_rating:    existing.culture_rating    ?? 0,
        notes:             existing.notes             ?? "",
      });
    }
  }

  async function saveEval() {
    if (!evalPlayer) return;
    setEvalSaving(true);
    setEvalSaved(false);
    setEvalError("");

    const payload = {
      player_id:         evalPlayer.id,
      offensive_ability: evalForm.offensive_ability,
      defensive_skills:  evalForm.defensive_skills,
      overall_iq:        evalForm.overall_iq,
      physical_ability:  evalForm.physical_ability,
      culture_rating:    evalForm.culture_rating,
      notes:             evalForm.notes,
    };

    let res: Response;
    if (evalId) {
      res = await fetch("/api/admin/evaluations", {
        method: "PATCH",
        headers: adminHeaders(token),
        body: JSON.stringify({ id: evalId, ...payload }),
      });
    } else {
      res = await fetch("/api/admin/evaluations", {
        method: "POST",
        headers: adminHeaders(token),
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.id) setEvalId(json.id);
    }

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setEvalError(json.error ?? "Save failed. Check DB constraints (0–10 per field).");
    } else {
      setEvalSaved(true);
      setTimeout(() => setEvalSaved(false), 3000);
    }
    setEvalSaving(false);
  }

  const composite = EVAL_FIELDS.reduce((sum, f) => sum + evalForm[f.key], 0);

  // ── Not logged in ──
  if (!authed) return <LoginGate onLogin={handleLogin} />;

  const TABS: { id: Tab; label: string; Icon: React.ElementType }[] = [
    { id: "players",    label: "Player Management", Icon: Users        },
    { id: "evaluations", label: "Evaluation Input",  Icon: ClipboardList },
    { id: "coaches",    label: "Coach Management",  Icon: UserCheck    },
  ];

  return (
    <div className="min-h-screen bg-navy flex flex-col">

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-navy/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-gold/15 border border-gold/30 flex items-center justify-center">
                <span className="text-gold font-black text-xs">A</span>
              </div>
              <span className="font-black text-sm tracking-tight">
                <span className="text-white">AUS Connect </span>
                <span className="text-gold">Admin</span>
              </span>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 text-xs font-semibold transition-colors"
            >
              <LogOut size={13} />
              Sign out
            </button>
          </div>

          {/* Tab bar */}
          <div className="flex overflow-x-auto scrollbar-hide -mb-px">
            {TABS.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-all ${
                  activeTab === id
                    ? "border-gold text-gold"
                    : "border-transparent text-white/40 hover:text-white/70"
                }`}
              >
                <Icon size={13} />
                {label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">

        {/* ══════════════ PLAYER MANAGEMENT ══════════════ */}
        {activeTab === "players" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-white font-bold text-xl">Player Management</h2>
                <p className="text-white/35 text-sm mt-0.5">
                  {playersLoaded ? `${players.length} player${players.length !== 1 ? "s" : ""} registered` : "Loading…"}
                </p>
              </div>
              <button
                onClick={() => fetchPlayers(token)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 text-white/40 hover:text-white hover:border-white/20 text-xs font-semibold transition-colors"
              >
                <RefreshCw size={12} />
                Refresh
              </button>
            </div>

            {playersLoading && <Spinner />}

            {!playersLoading && (
              <div className="rounded-2xl border border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/[0.02]">
                        {["Player", "Location", "Position", "Subscription", "Visibility", "Joined", ""].map(h => (
                          <th key={h} className={`text-left px-4 py-3 text-white/35 text-[10px] font-semibold uppercase tracking-wider ${
                            h === "Location" ? "hidden sm:table-cell" :
                            h === "Position" ? "hidden md:table-cell" :
                            h === "Joined"   ? "hidden lg:table-cell" : ""
                          }`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {players.map(player => (
                        <tr
                          key={player.id}
                          className="hover:bg-white/[0.025] transition-colors group"
                        >
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0">
                                <span className="text-gold text-xs font-bold">{initial(player.full_name)}</span>
                              </div>
                              <div className="min-w-0">
                                <p className="text-white font-semibold text-sm truncate">{player.full_name ?? "—"}</p>
                                <p className="text-white/30 text-xs truncate">{player.users?.email ?? "—"}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 hidden sm:table-cell">
                            <span className="text-white/55 text-sm">
                              {[player.location_city, player.location_state].filter(Boolean).join(", ") || "—"}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 hidden md:table-cell">
                            <span className="text-white/55 text-sm">{player.position ?? "—"}</span>
                          </td>
                          <td className="px-4 py-3.5">
                            <SubBadge
                              status={player.users?.subscription_status ?? "free"}
                              onClick={() => togglePlayerSub(player.user_id)}
                            />
                          </td>
                          <td className="px-4 py-3.5">
                            <button
                              onClick={() => toggleVisibility(player.id)}
                              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                                player.is_visible
                                  ? "bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20"
                                  : "bg-white/5 text-white/30 border-white/10 hover:bg-white/10"
                              }`}
                            >
                              {player.is_visible ? <Eye size={11} /> : <EyeOff size={11} />}
                              {player.is_visible ? "Visible" : "Hidden"}
                            </button>
                          </td>
                          <td className="px-4 py-3.5 hidden lg:table-cell">
                            <span className="text-white/35 text-sm">{fmtDate(player.created_at)}</span>
                          </td>
                          <td className="px-4 py-3.5">
                            <button
                              onClick={() => setSelectedPlayer(player)}
                              className="p-1.5 rounded-lg text-white/20 hover:text-gold hover:bg-gold/10 transition-all opacity-0 group-hover:opacity-100"
                            >
                              <ChevronRight size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {playersLoaded && players.length === 0 && (
                        <tr>
                          <td colSpan={7} className="px-4 py-16 text-center text-white/25 text-sm">
                            No players registered yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════ EVALUATION INPUT ══════════════ */}
        {activeTab === "evaluations" && (
          <div className="flex flex-col lg:flex-row gap-6">

            {/* Player list */}
            <aside className="lg:w-64 flex-shrink-0">
              <h2 className="text-white font-bold text-xl mb-4">Evaluation Input</h2>
              {playersLoading && <Spinner />}
              <div className="space-y-1">
                {players.map(player => (
                  <button
                    key={player.id}
                    onClick={() => selectEvalPlayer(player)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                      evalPlayer?.id === player.id
                        ? "bg-gold/10 border border-gold/30"
                        : "border border-transparent hover:bg-white/5 hover:border-white/10"
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                      evalPlayer?.id === player.id ? "bg-gold/20 text-gold" : "bg-white/5 text-white/35"
                    }`}>
                      {initial(player.full_name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`font-semibold text-sm truncate ${evalPlayer?.id === player.id ? "text-white" : "text-white/70"}`}>
                        {player.full_name ?? "—"}
                      </p>
                      <p className="text-white/30 text-xs truncate">
                        {[player.position, player.location_state].filter(Boolean).join(" · ") || "—"}
                      </p>
                    </div>
                    <ChevronRight size={12} className="flex-shrink-0 text-white/20" />
                  </button>
                ))}
                {playersLoaded && players.length === 0 && (
                  <p className="text-white/25 text-sm text-center py-8">No players found.</p>
                )}
              </div>
            </aside>

            {/* Form */}
            <div className="flex-1 min-w-0">
              {!evalPlayer ? (
                <div className="flex flex-col items-center justify-center h-64 rounded-2xl border border-white/10 bg-white/[0.02]">
                  <ClipboardList size={32} className="text-white/15 mb-3" />
                  <p className="text-white/40 font-semibold text-sm">Select a player to evaluate</p>
                  <p className="text-white/20 text-xs mt-1">Choose from the list on the left</p>
                </div>
              ) : (
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                  <div className="flex items-start justify-between gap-4 mb-7">
                    <div>
                      <h3 className="text-white font-bold text-lg leading-tight">{evalPlayer.full_name ?? "—"}</h3>
                      <p className="text-white/40 text-sm mt-0.5">
                        {[evalPlayer.position, evalPlayer.location_state].filter(Boolean).join(" · ") || "—"}
                      </p>
                    </div>
                    {evalId && (
                      <span className="flex-shrink-0 text-[10px] text-white/25 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                        Editing saved eval
                      </span>
                    )}
                  </div>

                  {/* Sliders */}
                  <div className="space-y-5 mb-7">
                    {EVAL_FIELDS.map(({ key, label }) => (
                      <EvalSlider
                        key={key}
                        label={label}
                        value={evalForm[key]}
                        onChange={v => setEvalForm(prev => ({ ...prev, [key]: v }))}
                      />
                    ))}
                  </div>

                  {/* Composite */}
                  <div className="flex items-center justify-between rounded-xl border border-gold/20 bg-gold/[0.05] px-5 py-4 mb-7">
                    <div>
                      <p className="text-white/40 text-[10px] font-semibold uppercase tracking-wider mb-0.5">Composite Score</p>
                      <p className="text-white/25 text-xs">Sum of all 5 criteria</p>
                    </div>
                    <div className="text-right">
                      <span className="text-gold font-black text-4xl tabular-nums">{composite}</span>
                      <span className="text-gold/35 text-sm">/100</span>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="mb-6">
                    <label className="block text-white/50 text-xs font-semibold uppercase tracking-wider mb-2">
                      Scouting Notes
                    </label>
                    <textarea
                      value={evalForm.notes}
                      onChange={e => setEvalForm(prev => ({ ...prev, notes: e.target.value }))}
                      rows={4}
                      placeholder="Written scouting observations…"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-white/20 focus:outline-none focus:border-gold/50 resize-none transition-all"
                    />
                  </div>

                  {/* Save */}
                  <div className="flex items-center gap-4">
                    <button
                      onClick={saveEval}
                      disabled={evalSaving}
                      className="flex-1 py-3 rounded-xl bg-gold text-navy font-bold text-sm hover:bg-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {evalSaving ? "Saving…" : evalId ? "Update Evaluation" : "Save Evaluation"}
                    </button>
                    {evalSaved && (
                      <div className="flex items-center gap-1.5 text-emerald-400 text-sm font-semibold">
                        <Check size={14} /> Saved
                      </div>
                    )}
                  </div>

                  {evalError && (
                    <div className="mt-3 flex items-start gap-2 text-red-400 text-xs">
                      <AlertCircle size={13} className="flex-shrink-0 mt-0.5" />
                      {evalError}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════ COACH MANAGEMENT ══════════════ */}
        {activeTab === "coaches" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-white font-bold text-xl">Coach Management</h2>
                <p className="text-white/35 text-sm mt-0.5">
                  {coachesLoaded ? `${coaches.length} coach${coaches.length !== 1 ? "es" : ""} registered` : "Loading…"}
                </p>
              </div>
              <button
                onClick={() => fetchCoaches(token)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 text-white/40 hover:text-white hover:border-white/20 text-xs font-semibold transition-colors"
              >
                <RefreshCw size={12} />
                Refresh
              </button>
            </div>

            {coachesLoading && <Spinner />}

            {!coachesLoading && (
              <div className="rounded-2xl border border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[500px]">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/[0.02]">
                        {["Coach", "University", "Title", "Subscription", "Joined"].map(h => (
                          <th key={h} className={`text-left px-4 py-3 text-white/35 text-[10px] font-semibold uppercase tracking-wider ${
                            h === "University" ? "hidden sm:table-cell" :
                            h === "Title"      ? "hidden md:table-cell" :
                            h === "Joined"     ? "hidden lg:table-cell" : ""
                          }`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {coaches.map(coach => (
                        <tr key={coach.id} className="hover:bg-white/[0.025] transition-colors">
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                                <span className="text-white/45 text-xs font-bold">{initial(coach.full_name)}</span>
                              </div>
                              <div className="min-w-0">
                                <p className="text-white font-semibold text-sm truncate">{coach.full_name ?? "—"}</p>
                                <p className="text-white/30 text-xs truncate">{coach.users?.email ?? "—"}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 hidden sm:table-cell">
                            <span className="text-white/55 text-sm">{coach.university ?? "—"}</span>
                          </td>
                          <td className="px-4 py-3.5 hidden md:table-cell">
                            <span className="text-white/55 text-sm">{coach.position_title ?? "—"}</span>
                          </td>
                          <td className="px-4 py-3.5">
                            <SubBadge
                              status={coach.users?.subscription_status ?? "free"}
                              onClick={() => toggleCoachSub(coach)}
                            />
                          </td>
                          <td className="px-4 py-3.5 hidden lg:table-cell">
                            <span className="text-white/35 text-sm">{fmtDate(coach.created_at)}</span>
                          </td>
                        </tr>
                      ))}
                      {coachesLoaded && coaches.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-4 py-16 text-center text-white/25 text-sm">
                            No coaches registered yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── Player Detail Panel ── */}
      {selectedPlayer && (
        <PlayerPanel
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
          onToggleVisibility={toggleVisibility}
          onToggleSub={togglePlayerSub}
        />
      )}
    </div>
  );
}
