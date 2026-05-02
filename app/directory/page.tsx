"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Search, Lock, ChevronDown, X, Users, MapPin,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const AU_STATES = ["ACT", "NSW", "NT", "QLD", "SA", "TAS", "VIC", "WA"];

const POSITIONS = [
  { value: "PG", label: "Point Guard" },
  { value: "SG", label: "Shooting Guard" },
  { value: "SF", label: "Small Forward" },
  { value: "PF", label: "Power Forward" },
  { value: "C",  label: "Centre" },
];

const AGE_RANGES = [
  { value: "16-17", label: "16–17" },
  { value: "18-19", label: "18–19" },
  { value: "20-22", label: "20–22" },
  { value: "23+",   label: "23+" },
];

const HEIGHT_RANGES = [
  { value: "under180", label: "Under 180cm" },
  { value: "180-190",  label: "180–190cm" },
  { value: "191-200",  label: "191–200cm" },
  { value: "201+",     label: "201cm+" },
];

type StatRow = {
  season: string; team: string; gp: string;
  ppg: string; rpg: string; apg: string;
  fg_pct: string; three_pt_pct: string;
};

type Player = {
  id: string;
  full_name: string | null;
  date_of_birth: string | null;
  position: string | null;
  current_team: string | null;
  location_city: string | null;
  location_state: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  season_stats: StatRow[] | null;
  avg_composite: number | null;
  profile_picture_url: string | null;
};

function getAge(dob: string): number | null {
  const birth = new Date(dob);
  if (isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function cmToFtIn(cm: number): string {
  const totalInches = cm / 2.54;
  const ft = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return `${ft}'${inches}"`;
}

function posLabel(pos: string | null): string {
  return POSITIONS.find(p => p.value === pos)?.label ?? pos ?? "—";
}

function initials(name: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return (parts[0]?.[0] ?? "?").toUpperCase();
}

function inAgeRange(dob: string | null, range: string): boolean {
  if (!dob) return false;
  const age = getAge(dob);
  if (age === null) return false;
  if (range === "16-17") return age >= 16 && age <= 17;
  if (range === "18-19") return age >= 18 && age <= 19;
  if (range === "20-22") return age >= 20 && age <= 22;
  if (range === "23+")   return age >= 23;
  return false;
}

function inHeightRange(cm: number | null, range: string): boolean {
  if (!cm) return false;
  if (range === "under180") return cm < 180;
  if (range === "180-190")  return cm >= 180 && cm <= 190;
  if (range === "191-200")  return cm >= 191 && cm <= 200;
  if (range === "201+")     return cm >= 201;
  return false;
}

function FilterSelect({
  value, onChange, placeholder, options,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`w-full pl-4 pr-9 py-2.5 rounded-xl border text-sm appearance-none cursor-pointer focus:outline-none focus:border-gold/50 transition-all ${
          value
            ? "border-gold/40 bg-gold/[0.08] text-white"
            : "border-white/10 bg-white/[0.03] text-white/50"
        }`}
      >
        <option value="">{placeholder}</option>
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
    </div>
  );
}

function PlayerAvatar({ name, photoUrl, dim = false }: {
  name: string | null;
  photoUrl?: string | null;
  dim?: boolean;
}) {
  if (photoUrl && !dim) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 border border-gold/30">
        <img src={photoUrl} alt={name ?? "Player"} className="w-full h-full object-cover" />
      </div>
    );
  }
  return (
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 text-lg ${dim ? "bg-white/5 border border-white/10" : "bg-gold/15 border border-gold/30"}`}>
      <span className={`font-black ${dim ? "text-white/25" : "text-gold"}`}>{initials(name)}</span>
    </div>
  );
}

function FullCard({ player }: { player: Player }) {
  const age = player.date_of_birth ? getAge(player.date_of_birth) : null;
  const latest = player.season_stats?.length
    ? player.season_stats[player.season_stats.length - 1]
    : null;

  return (
    <div className="group rounded-2xl border border-white/10 bg-white/[0.03] hover:border-gold/30 hover:bg-white/[0.05] transition-all duration-300 hover:-translate-y-0.5 overflow-hidden flex flex-col">
      <div className="p-5 pb-4">
        <div className="flex items-start gap-4">
          <PlayerAvatar name={player.full_name} photoUrl={player.profile_picture_url} />
          <div className="flex-1 min-w-0">
            <h3 className="font-black text-white text-base leading-tight truncate">
              {player.full_name ?? "—"}
            </h3>
            <div className="flex flex-wrap items-center gap-x-2 mt-0.5">
              <span className="text-gold text-xs font-semibold">{posLabel(player.position)}</span>
              {player.current_team && (
                <>
                  <span className="text-white/20 text-xs">·</span>
                  <span className="text-white/50 text-xs truncate">{player.current_team}</span>
                </>
              )}
            </div>
            {(player.location_city || player.location_state) && (
              <div className="flex items-center gap-1 mt-1.5">
                <MapPin size={10} className="text-white/30 flex-shrink-0" />
                <span className="text-white/40 text-xs">
                  {[player.location_city, player.location_state].filter(Boolean).join(", ")}
                </span>
              </div>
            )}
          </div>
          {player.avg_composite !== null && (
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gold/10 border border-gold/25 flex flex-col items-center justify-center">
              <span className="text-gold text-sm font-black leading-none">
                {player.avg_composite.toFixed(1)}
              </span>
              <span className="text-gold/50 text-[9px] font-bold mt-0.5">AUS</span>
            </div>
          )}
        </div>
      </div>

      <div className="h-px bg-white/5 mx-5" />

      <div className="px-5 py-4 flex-1 flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <p className="text-white/30 text-[10px] font-semibold uppercase tracking-wider mb-1">Height</p>
            {player.height_cm ? (
              <p className="text-white text-sm font-semibold">
                {player.height_cm}
                <span className="text-white/40 text-xs font-normal">cm</span>
                <span className="block text-white/40 text-xs font-normal">{cmToFtIn(player.height_cm)}</span>
              </p>
            ) : <p className="text-white/25 text-sm">—</p>}
          </div>
          <div>
            <p className="text-white/30 text-[10px] font-semibold uppercase tracking-wider mb-1">Weight</p>
            {player.weight_kg ? (
              <p className="text-white text-sm font-semibold">
                {player.weight_kg}
                <span className="text-white/40 text-xs font-normal">kg</span>
                <span className="block text-white/40 text-xs font-normal">{Math.round(player.weight_kg * 2.20462)} lbs</span>
              </p>
            ) : <p className="text-white/25 text-sm">—</p>}
          </div>
          <div>
            <p className="text-white/30 text-[10px] font-semibold uppercase tracking-wider mb-1">Age</p>
            <p className="text-white text-sm font-semibold">
              {age !== null ? age : "—"}
              {age !== null && <span className="text-white/40 text-xs font-normal block">yrs old</span>}
            </p>
          </div>
        </div>

        {latest ? (
          <div className="rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 mt-auto">
            <p className="text-white/30 text-[10px] font-semibold uppercase tracking-wider mb-2">
              {latest.season || "Latest Season"}
            </p>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { label: "PPG", val: latest.ppg },
                { label: "RPG", val: latest.rpg },
                { label: "APG", val: latest.apg },
              ].map(({ label, val }) => (
                <div key={label}>
                  <p className="text-gold text-sm font-black">{val || "—"}</p>
                  <p className="text-white/30 text-[10px] font-semibold">{label}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 mt-auto text-center">
            <p className="text-white/20 text-xs">No season stats added yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

function LockedCard({ player }: { player: Player }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden flex flex-col">
      <div className="p-5 pb-4">
        <div className="flex items-start gap-4">
          <PlayerAvatar name={player.full_name} dim />
          <div className="flex-1 min-w-0">
            <h3 className="font-black text-white text-base leading-tight truncate">
              {player.full_name ?? "—"}
            </h3>
            <span className="text-white/50 text-xs">{posLabel(player.position)}</span>
            {(player.location_city || player.location_state) && (
              <div className="flex items-center gap-1 mt-1.5">
                <MapPin size={10} className="text-white/30 flex-shrink-0" />
                <span className="text-white/40 text-xs">
                  {[player.location_city, player.location_state].filter(Boolean).join(", ")}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="h-px bg-white/5 mx-5" />

      {/* Locked section */}
      <div className="relative mx-5 my-5 flex-1">
        {/* Blurred dummy content */}
        <div
          className="rounded-xl border border-white/5 bg-white/[0.02] px-4 py-4 select-none pointer-events-none"
          style={{ filter: "blur(5px)" }}
          aria-hidden="true"
        >
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div>
              <p className="text-white/30 text-[10px] uppercase mb-1">Height</p>
              <p className="text-white text-sm font-semibold">193cm</p>
              <p className="text-white/40 text-xs">6&apos;4&quot;</p>
            </div>
            <div>
              <p className="text-white/30 text-[10px] uppercase mb-1">Weight</p>
              <p className="text-white text-sm font-semibold">88kg</p>
              <p className="text-white/40 text-xs">194 lbs</p>
            </div>
            <div>
              <p className="text-white/30 text-[10px] uppercase mb-1">Age</p>
              <p className="text-white text-sm font-semibold">19</p>
              <p className="text-white/40 text-xs">yrs old</p>
            </div>
          </div>
          <div className="rounded-xl bg-white/[0.03] px-4 py-3">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div><p className="text-gold text-sm font-black">18.5</p><p className="text-white/30 text-[10px]">PPG</p></div>
              <div><p className="text-gold text-sm font-black">4.2</p><p className="text-white/30 text-[10px]">RPG</p></div>
              <div><p className="text-gold text-sm font-black">6.1</p><p className="text-white/30 text-[10px]">APG</p></div>
            </div>
          </div>
        </div>

        {/* Lock overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-navy/75 backdrop-blur-[2px]">
          <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center mb-3">
            <Lock size={18} className="text-gold" />
          </div>
          <p className="text-white font-bold text-sm mb-1">Coach access only</p>
          <p className="text-white/40 text-xs text-center px-6 mb-4 leading-relaxed">
            Subscribe to view full stats, physical data &amp; contact info
          </p>
          <Link
            href="/register"
            className="px-4 py-2 rounded-lg bg-gold text-navy font-bold text-xs hover:bg-amber-400 transition-colors"
          >
            Subscribe to unlock
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function DirectoryPage() {
  const [players, setPlayers]             = useState<Player[]>([]);
  const [isSubscribedCoach, setIsSubscribedCoach] = useState(false);
  const [loading, setLoading]             = useState(true);

  const [search, setSearch]               = useState("");
  const [filterPosition, setFilterPosition] = useState("");
  const [filterState, setFilterState]       = useState("");
  const [filterAge, setFilterAge]           = useState("");
  const [filterHeight, setFilterHeight]     = useState("");

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      let isSubCoach = false;

      if (user) {
        const { data: uRow } = await supabase
          .from("users")
          .select("role, subscription_status")
          .eq("id", user.id)
          .single();
        isSubCoach = uRow?.role === "coach" && uRow?.subscription_status !== "free";
        setIsSubscribedCoach(isSubCoach);
      }

      // Primary query — filtered by is_visible = true (boolean)
      const { data: raw, error: rawError } = await supabase
        .from("player_profiles")
        .select(
          "id, full_name, date_of_birth, position, current_team, location_city, location_state, height_cm, weight_kg, season_stats, profile_picture_url"
        )
        .eq("is_visible", true)
        .order("created_at", { ascending: false });

      if (rawError) {
        setLoading(false);
        return;
      }
      if (!raw) { setLoading(false); return; }

      // Fetch evaluation averages (RLS restricts to coaches only)
      const evalMap: Record<string, number> = {};
      if (isSubCoach) {
        const { data: evals } = await supabase
          .from("evaluations")
          .select("player_id, composite_score");
        if (evals) {
          const grouped: Record<string, number[]> = {};
          for (const e of evals) {
            if (e.composite_score != null) {
              grouped[e.player_id] ??= [];
              grouped[e.player_id].push(e.composite_score);
            }
          }
          for (const [pid, scores] of Object.entries(grouped)) {
            evalMap[pid] = scores.reduce((a, b) => a + b, 0) / scores.length;
          }
        }
      }

      setPlayers(
        raw.map(r => ({
          ...r,
          season_stats: Array.isArray(r.season_stats) ? (r.season_stats as StatRow[]) : null,
          avg_composite: evalMap[r.id] ?? null,
          profile_picture_url: (r as Record<string, unknown>).profile_picture_url as string ?? null,
        }))
      );
      setLoading(false);
    }
    load();
  }, []);

  const activeFilters = [filterPosition, filterState, filterAge, filterHeight].filter(Boolean).length;

  const filtered = useMemo(() => {
    return players.filter(p => {
      if (search && !p.full_name?.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterPosition && p.position !== filterPosition) return false;
      if (filterState && p.location_state !== filterState) return false;
      if (filterAge && !inAgeRange(p.date_of_birth, filterAge)) return false;
      if (filterHeight && !inHeightRange(p.height_cm, filterHeight)) return false;
      return true;
    });
  }, [players, search, filterPosition, filterState, filterAge, filterHeight]);

  function clearFilters() {
    setSearch("");
    setFilterPosition("");
    setFilterState("");
    setFilterAge("");
    setFilterHeight("");
  }

  return (
    <div className="min-h-screen bg-navy flex flex-col">
      <Navbar />

      {/* Page hero */}
      <section className="pt-32 pb-12 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end gap-6 justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gold/30 bg-gold/10 text-gold text-xs font-semibold mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
                Player Directory
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
                Australian Talent
              </h1>
              <p className="text-white/50 mt-2 text-lg max-w-xl">
                Browse verified Australian basketball players ready for US college programs.
              </p>
            </div>

            {!isSubscribedCoach && (
              <div className="flex-shrink-0 px-5 py-4 rounded-2xl border border-gold/20 bg-gold/[0.05] max-w-xs">
                <div className="flex items-start gap-3">
                  <Lock size={16} className="text-gold mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-white font-bold text-sm">Coach Access</p>
                    <p className="text-white/50 text-xs mt-0.5 leading-relaxed">
                      Subscribe to see full profiles, stats, and contact information.
                    </p>
                    <Link
                      href="/register"
                      className="inline-flex mt-2.5 text-gold text-xs font-bold hover:text-amber-300 transition-colors"
                    >
                      Get started →
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Sticky search + filters */}
      <div className="sticky top-[64px] md:top-[80px] z-30 border-b border-white/10 bg-navy/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col gap-3">
          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search players by name…"
              className="w-full pl-10 pr-10 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-white/25 focus:outline-none focus:border-gold/50 focus:bg-white/[0.08] transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Filter dropdowns */}
          <div className="flex flex-wrap gap-2 items-center">
            <FilterSelect
              value={filterPosition}
              onChange={setFilterPosition}
              placeholder="Position"
              options={POSITIONS}
            />
            <FilterSelect
              value={filterState}
              onChange={setFilterState}
              placeholder="State"
              options={AU_STATES.map(s => ({ value: s, label: s }))}
            />
            <FilterSelect
              value={filterAge}
              onChange={setFilterAge}
              placeholder="Age range"
              options={AGE_RANGES}
            />
            <FilterSelect
              value={filterHeight}
              onChange={setFilterHeight}
              placeholder="Height"
              options={HEIGHT_RANGES}
            />
            {activeFilters > 0 && (
              <button
                type="button"
                onClick={clearFilters}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-white/40 hover:text-white text-sm transition-colors"
              >
                <X size={13} />
                Clear ({activeFilters})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">

        {/* Count */}
        {!loading && (
          <p className="text-white/40 text-sm mb-6">
            {filtered.length === players.length
              ? `${players.length} player${players.length !== 1 ? "s" : ""} in directory`
              : `${filtered.length} of ${players.length} player${players.length !== 1 ? "s" : ""} match your filters`
            }
          </p>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-10 h-10 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
            <p className="text-white/40 text-sm">Loading players…</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-5">
              <Users size={28} className="text-white/20" />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">No players found</h3>
            <p className="text-white/40 text-sm max-w-sm">
              {players.length === 0
                ? "No players have created visible profiles yet. Check back soon."
                : "No players match your current filters. Try adjusting your search."}
            </p>
            {activeFilters > 0 && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-6 px-5 py-2.5 rounded-xl border border-white/10 text-white/50 hover:text-white hover:border-white/25 text-sm transition-all"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Grid */}
        {!loading && filtered.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(player =>
              isSubscribedCoach
                ? <FullCard key={player.id} player={player} />
                : <LockedCard key={player.id} player={player} />
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
