"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Save, Eye, EyeOff, Plus, Trash2,
  User, MapPin, Activity, Phone, AtSign,
  Target, Video, BarChart2, ChevronDown,
  AlertCircle, CheckCircle, Loader2, Camera, Upload,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const AU_STATES = ["ACT", "NSW", "NT", "QLD", "SA", "TAS", "VIC", "WA"];
const POSITIONS = [
  { value: "PG", label: "Point Guard (PG)" },
  { value: "SG", label: "Shooting Guard (SG)" },
  { value: "SF", label: "Small Forward (SF)" },
  { value: "PF", label: "Power Forward (PF)" },
  { value: "C",  label: "Centre (C)" },
];

type StatRow = {
  id: string;
  season: string;
  team: string;
  gp: string;
  ppg: string;
  rpg: string;
  apg: string;
  fg_pct: string;
  three_pt_pct: string;
};

function cmToFtIn(cm: number): string {
  const totalInches = cm / 2.54;
  const ft = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return `${ft}'${inches}"`;
}

function kgToLbs(kg: number): string {
  return `${Math.round(kg * 2.20462)} lbs`;
}

const inputClass =
  "w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-white/25 focus:outline-none focus:border-gold/50 focus:bg-white/[0.08] transition-all";

const selectClass =
  "w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-gold/50 focus:bg-white/[0.08] transition-all appearance-none cursor-pointer";

function SectionCard({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-white/10 bg-white/[0.02]">
        <div className="w-8 h-8 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0">
          <Icon size={15} className="text-gold" />
        </div>
        <h2 className="font-bold text-white text-sm">{title}</h2>
      </div>
      <div className="px-6 py-6">{children}</div>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
      {children}
    </label>
  );
}

export default function PlayerProfilePage() {
  const router = useRouter();

  const [userId, setUserId]       = useState<string | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [saveMsg, setSaveMsg]     = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Photo
  const [photoUrl, setPhotoUrl]             = useState<string | null>(null);
  const [photoPreview, setPhotoPreview]     = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError]         = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Basic Info
  const [fullName, setFullName]       = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [position, setPosition]       = useState("");
  const [currentTeam, setCurrentTeam] = useState("");

  // Location
  const [city, setCity]   = useState("");
  const [state, setState] = useState("");

  // Physical
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");

  // Contact
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  // Social
  const [instagram, setInstagram] = useState("");
  const [twitter, setTwitter]     = useState("");

  // Goals
  const [goals, setGoals] = useState("");

  // Videos
  const [video1, setVideo1] = useState("");
  const [video2, setVideo2] = useState("");
  const [video3, setVideo3] = useState("");

  // Season stats
  const [stats, setStats] = useState<StatRow[]>([]);

  // Visibility
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/login"); return; }

      const { data: uRow } = await supabase
        .from("users").select("role").eq("id", user.id).single();
      if (uRow?.role !== "player") { router.replace("/dashboard"); return; }

      setUserId(user.id);

      const { data: prof } = await supabase
        .from("player_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (prof) {
        setProfileId(prof.id);
        setFullName(prof.full_name ?? "");
        setDateOfBirth((prof as Record<string, unknown>).date_of_birth as string ?? "");
        setPosition(prof.position ?? "");
        setCurrentTeam(prof.current_team ?? "");
        setCity(prof.location_city ?? "");
        setState(prof.location_state ?? "");
        setHeightCm(prof.height_cm?.toString() ?? "");
        setWeightKg(prof.weight_kg?.toString() ?? "");
        setContactEmail(prof.contact_email ?? "");
        setContactPhone(prof.contact_phone ?? "");
        setInstagram(prof.instagram ?? "");
        setTwitter(prof.twitter ?? "");
        setGoals(prof.goals ?? "");
        setVideo1(prof.video_link_1 ?? "");
        setVideo2(prof.video_link_2 ?? "");
        setVideo3(prof.video_link_3 ?? "");
        setIsVisible(prof.is_visible ?? true);
        setPhotoUrl((prof as Record<string, unknown>).profile_picture_url as string ?? null);
        const rawStats = (prof as Record<string, unknown>).season_stats;
        if (Array.isArray(rawStats)) {
          setStats(
            rawStats.map((s: Omit<StatRow, "id">, i: number) => ({ ...s, id: String(i) }))
          );
        }
      } else {
        setContactEmail(user.email ?? "");
      }

      setLoading(false);
    }
    load();
  }, [router]);

  // Computed conversions
  const cmNum = Number(heightCm);
  const kgNum = Number(weightKg);
  const heightDisplay = heightCm && !isNaN(cmNum) && cmNum > 0 ? cmToFtIn(cmNum) : null;
  const weightDisplay = weightKg && !isNaN(kgNum) && kgNum > 0 ? kgToLbs(kgNum) : null;
  const heightFt  = cmNum > 0 ? Math.floor(cmNum / 2.54 / 12) : null;
  const heightIn  = cmNum > 0 ? Math.round((cmNum / 2.54) % 12) : null;
  const weightLbs = kgNum > 0 ? Math.round(kgNum * 2.20462) : null;

  // Stats helpers
  function addStatRow() {
    setStats(prev => [
      ...prev,
      { id: Date.now().toString(), season: "", team: "", gp: "", ppg: "", rpg: "", apg: "", fg_pct: "", three_pt_pct: "" },
    ]);
  }

  function removeStatRow(id: string) {
    setStats(prev => prev.filter(r => r.id !== id));
  }

  function updateStat(id: string, field: keyof Omit<StatRow, "id">, value: string) {
    setStats(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  }

  async function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setPhotoError("Please upload a JPG, PNG, or WebP image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError("Image must be under 5MB.");
      return;
    }

    setPhotoError(null);
    setPhotoPreview(URL.createObjectURL(file));
    setUploadingPhoto(true);

    const ext = file.type === "image/jpeg" ? "jpg" : file.type === "image/png" ? "png" : "webp";
    const filePath = `${userId}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("player-avatars")
      .upload(filePath, file, { upsert: true, contentType: file.type });

    if (uploadError) {
      setPhotoError(`Upload failed: ${uploadError.message}`);
      setPhotoPreview(null);
      setUploadingPhoto(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("player-avatars")
      .getPublicUrl(filePath);

    setPhotoUrl(urlData.publicUrl);
    setUploadingPhoto(false);
    e.target.value = "";
  }

  async function handleSave() {
    if (!userId) return;
    setSaving(true);
    setSaveMsg(null);

    const payload: Record<string, unknown> = {
      user_id: userId,
      full_name:      fullName      || null,
      position:       position      || null,
      current_team:   currentTeam   || null,
      location_city:  city          || null,
      location_state: state         || null,
      height_cm:  heightCm ? cmNum  : null,
      height_ft:  heightFt,
      height_in:  heightIn,
      weight_kg:  weightKg ? kgNum  : null,
      weight_lbs: weightLbs,
      contact_email: contactEmail || null,
      contact_phone: contactPhone || null,
      instagram: instagram || null,
      twitter:   twitter   || null,
      goals:     goals     || null,
      video_link_1: video1 || null,
      video_link_2: video2 || null,
      video_link_3: video3 || null,
      is_visible: isVisible,
      season_stats: stats.map(({ id: _id, ...rest }) => rest),
      profile_picture_url: photoUrl || null,
    };

    if (dateOfBirth) payload.date_of_birth = dateOfBirth;

    let error: { message: string } | null = null;

    if (profileId) {
      const { error: e } = await supabase
        .from("player_profiles").update(payload).eq("id", profileId);
      error = e;
    } else {
      const { data, error: e } = await supabase
        .from("player_profiles").insert(payload).select("id").single();
      error = e;
      if (data) setProfileId((data as { id: string }).id);
    }

    // If new columns don't exist yet, retry without them
    if (error?.message?.includes("column") &&
        (error.message.includes("date_of_birth") || error.message.includes("season_stats") || error.message.includes("profile_picture_url"))) {
      delete payload.date_of_birth;
      delete payload.season_stats;
      delete payload.profile_picture_url;
      const { error: e2 } = profileId
        ? await supabase.from("player_profiles").update(payload).eq("id", profileId)
        : await supabase.from("player_profiles").insert(payload);
      error = e2;
      if (!e2) {
        setSaving(false);
        setSaveMsg({
          type: "success",
          text: "Profile saved! Run lib/supabase-migration-v2.sql in Supabase to enable date of birth & season stats.",
        });
        setTimeout(() => setSaveMsg(null), 6000);
        return;
      }
    }

    setSaving(false);
    if (error) {
      setSaveMsg({ type: "error", text: error.message });
    } else {
      setSaveMsg({ type: "success", text: "Profile saved successfully!" });
      setTimeout(() => setSaveMsg(null), 3000);
    }
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
          <p className="text-white/40 text-sm">Loading profile…</p>
        </div>
      </div>
    );
  }

  const positionLabel = POSITIONS.find(p => p.value === position)?.label ?? position;

  // ── Page ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-navy">

      {/* Sticky header */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-navy/90 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 text-white/40 hover:text-white transition-colors text-sm"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
            <div className="w-px h-4 bg-white/10" />
            <span className="text-white font-bold text-sm">My Profile</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/15 text-white/60 hover:text-white hover:border-white/30 text-sm transition-all"
            >
              <Eye size={15} />
              <span className="hidden sm:inline">Preview</span>
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gold text-navy font-bold text-sm hover:bg-amber-400 transition-all disabled:opacity-50 shadow-lg shadow-gold/20"
            >
              {saving ? (
                <><Loader2 size={15} className="animate-spin" /> Saving…</>
              ) : (
                <><Save size={15} /> Save</>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Save status banner */}
      {saveMsg && (
        <div className={`sticky top-16 z-30 border-b ${
          saveMsg.type === "success"
            ? "bg-emerald-500/10 border-emerald-500/20"
            : "bg-red-500/10 border-red-500/20"
        }`}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2.5">
            {saveMsg.type === "success"
              ? <CheckCircle size={15} className="text-emerald-400 flex-shrink-0" />
              : <AlertCircle  size={15} className="text-red-400 flex-shrink-0" />
            }
            <p className={`text-sm ${saveMsg.type === "success" ? "text-emerald-400" : "text-red-400"}`}>
              {saveMsg.text}
            </p>
          </div>
        </div>
      )}

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">

        {/* Page heading + visibility toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between pb-2">
          <div>
            <h1 className="text-2xl font-black text-white">Player Profile</h1>
            <p className="text-white/40 text-sm mt-0.5">Fill in your details so coaches can discover you.</p>
          </div>

          {/* Visibility toggle */}
          <button
            type="button"
            onClick={() => setIsVisible(v => !v)}
            className={`flex items-center gap-3 px-5 py-3 rounded-2xl border transition-all ${
              isVisible
                ? "border-gold/30 bg-gold/[0.06] text-gold"
                : "border-white/10 bg-white/[0.03] text-white/40"
            }`}
          >
            {isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
            <div className="text-left">
              <p className="text-xs font-bold">{isVisible ? "Profile Visible" : "Profile Hidden"}</p>
              <p className="text-xs opacity-60">{isVisible ? "Coaches can find you" : "Hidden from coaches"}</p>
            </div>
            <div className={`ml-2 w-10 h-6 rounded-full border relative flex-shrink-0 transition-all ${
              isVisible ? "bg-gold/20 border-gold/40" : "bg-white/5 border-white/15"
            }`}>
              <div className={`absolute top-0.5 w-5 h-5 rounded-full transition-all ${
                isVisible ? "left-[calc(100%-1.375rem)] bg-gold" : "left-0.5 bg-white/30"
              }`} />
            </div>
          </button>
        </div>

        {/* ── 0. Profile Photo ── */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-white/10 bg-white/[0.02]">
            <div className="w-8 h-8 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0">
              <Camera size={15} className="text-gold" />
            </div>
            <h2 className="font-bold text-white text-sm">Profile Photo</h2>
          </div>
          <div className="px-6 py-6">
            <div className="flex items-center gap-6">
              {/* Avatar preview */}
              <div className="relative flex-shrink-0">
                <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-white/10 flex items-center justify-center bg-gold/10">
                  {uploadingPhoto ? (
                    <Loader2 size={28} className="text-gold animate-spin" />
                  ) : (photoPreview || photoUrl) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={photoPreview ?? photoUrl ?? ""}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl font-black text-gold">
                      {fullName ? fullName.charAt(0).toUpperCase() : "?"}
                    </span>
                  )}
                </div>
                {(photoPreview || photoUrl) && !uploadingPhoto && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-navy flex items-center justify-center">
                    <CheckCircle size={12} className="text-white" />
                  </div>
                )}
              </div>

              {/* Upload controls */}
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm mb-1">
                  {photoUrl || photoPreview ? "Change profile photo" : "Upload a profile photo"}
                </p>
                <p className="text-white/40 text-xs mb-3">
                  JPG, PNG or WebP · Max 5MB · Square crops work best
                </p>
                {photoError && (
                  <p className="text-red-400 text-xs mb-3 flex items-center gap-1.5">
                    <AlertCircle size={12} />
                    {photoError}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gold/30 bg-gold/[0.06] text-gold text-sm font-semibold hover:bg-gold/[0.12] transition-all disabled:opacity-50"
                >
                  <Upload size={14} />
                  {uploadingPhoto ? "Uploading…" : (photoUrl || photoPreview) ? "Change Photo" : "Upload Photo"}
                </button>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handlePhotoSelect}
            />
          </div>
        </div>

        {/* ── 1. Basic Info ── */}
        <SectionCard icon={User} title="Basic Information">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <FieldLabel>Full Name</FieldLabel>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="e.g. Lachlan Mitchell"
                className={inputClass}
              />
            </div>
            <div>
              <FieldLabel>Date of Birth</FieldLabel>
              <input
                type="date"
                value={dateOfBirth}
                onChange={e => setDateOfBirth(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <FieldLabel>Position</FieldLabel>
              <div className="relative">
                <select
                  value={position}
                  onChange={e => setPosition(e.target.value)}
                  className={selectClass}
                >
                  <option value="" disabled>Select position</option>
                  {POSITIONS.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
              </div>
            </div>
            <div>
              <FieldLabel>Current Team</FieldLabel>
              <input
                type="text"
                value={currentTeam}
                onChange={e => setCurrentTeam(e.target.value)}
                placeholder="e.g. Sydney Kings Academy"
                className={inputClass}
              />
            </div>
          </div>
        </SectionCard>

        {/* ── 2. Location ── */}
        <SectionCard icon={MapPin} title="Location">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <FieldLabel>City / Suburb</FieldLabel>
              <input
                type="text"
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder="e.g. Sydney"
                className={inputClass}
              />
            </div>
            <div>
              <FieldLabel>State / Territory</FieldLabel>
              <div className="relative">
                <select
                  value={state}
                  onChange={e => setState(e.target.value)}
                  className={selectClass}
                >
                  <option value="" disabled>Select state</option>
                  {AU_STATES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
              </div>
            </div>
          </div>
        </SectionCard>

        {/* ── 3. Physical Stats ── */}
        <SectionCard icon={Activity} title="Physical Stats">
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <FieldLabel>Height</FieldLabel>
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <input
                    type="number"
                    value={heightCm}
                    onChange={e => setHeightCm(e.target.value)}
                    placeholder="e.g. 193"
                    min={100}
                    max={250}
                    className={`${inputClass} pr-10`}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 text-xs font-semibold pointer-events-none">
                    cm
                  </span>
                </div>
                <div className={`flex-shrink-0 px-4 py-3 rounded-xl border text-sm font-bold min-w-[84px] text-center transition-all ${
                  heightDisplay
                    ? "border-gold/30 bg-gold/[0.06] text-gold"
                    : "border-white/10 bg-white/[0.02] text-white/20"
                }`}>
                  {heightDisplay ?? "—"}
                </div>
              </div>
            </div>
            <div>
              <FieldLabel>Weight</FieldLabel>
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <input
                    type="number"
                    value={weightKg}
                    onChange={e => setWeightKg(e.target.value)}
                    placeholder="e.g. 88"
                    min={40}
                    max={200}
                    className={`${inputClass} pr-10`}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 text-xs font-semibold pointer-events-none">
                    kg
                  </span>
                </div>
                <div className={`flex-shrink-0 px-4 py-3 rounded-xl border text-sm font-bold min-w-[84px] text-center transition-all ${
                  weightDisplay
                    ? "border-gold/30 bg-gold/[0.06] text-gold"
                    : "border-white/10 bg-white/[0.02] text-white/20"
                }`}>
                  {weightDisplay ?? "—"}
                </div>
              </div>
            </div>
          </div>
          <p className="text-white/25 text-xs mt-4">
            Type in centimetres and kilograms — imperial equivalents update instantly.
          </p>
        </SectionCard>

        {/* ── 4. Contact ── */}
        <SectionCard icon={Phone} title="Contact Information">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <FieldLabel>Email Address</FieldLabel>
              <input
                type="email"
                value={contactEmail}
                onChange={e => setContactEmail(e.target.value)}
                placeholder="you@example.com"
                className={inputClass}
              />
            </div>
            <div>
              <FieldLabel>Phone Number</FieldLabel>
              <input
                type="tel"
                value={contactPhone}
                onChange={e => setContactPhone(e.target.value)}
                placeholder="+61 4XX XXX XXX"
                className={inputClass}
              />
            </div>
          </div>
        </SectionCard>

        {/* ── 5. Social Media ── */}
        <SectionCard icon={AtSign} title="Social Media">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <FieldLabel>Instagram Handle</FieldLabel>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-sm select-none">@</span>
                <input
                  type="text"
                  value={instagram}
                  onChange={e => setInstagram(e.target.value.replace(/^@/, ""))}
                  placeholder="yourhandle"
                  className={`${inputClass} pl-8`}
                />
              </div>
            </div>
            <div>
              <FieldLabel>Twitter / X Handle</FieldLabel>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-sm select-none">@</span>
                <input
                  type="text"
                  value={twitter}
                  onChange={e => setTwitter(e.target.value.replace(/^@/, ""))}
                  placeholder="yourhandle"
                  className={`${inputClass} pl-8`}
                />
              </div>
            </div>
          </div>
        </SectionCard>

        {/* ── 6. Goals & Aspirations ── */}
        <SectionCard icon={Target} title="Goals & Aspirations">
          <FieldLabel>Tell coaches about your goals</FieldLabel>
          <textarea
            value={goals}
            onChange={e => setGoals(e.target.value.slice(0, 500))}
            rows={5}
            placeholder="Describe your aspirations, what you bring to a program, and why you want to play college basketball in the US…"
            className={`${inputClass} resize-none`}
          />
          <div className={`text-right text-xs mt-1.5 ${goals.length >= 480 ? "text-amber-400" : "text-white/25"}`}>
            {goals.length} / 500
          </div>
        </SectionCard>

        {/* ── 7. Highlight Tapes ── */}
        <SectionCard icon={Video} title="Highlight Tapes">
          <div className="space-y-4">
            {([
              { label: "Highlight 1", val: video1, set: setVideo1 },
              { label: "Highlight 2", val: video2, set: setVideo2 },
              { label: "Highlight 3", val: video3, set: setVideo3 },
            ] as const).map(({ label, val, set }) => (
              <div key={label}>
                <FieldLabel>{label}</FieldLabel>
                <input
                  type="url"
                  value={val}
                  onChange={e => set(e.target.value)}
                  placeholder="https://youtube.com/watch?v=... or https://hudl.com/..."
                  className={inputClass}
                />
              </div>
            ))}
            <p className="text-white/25 text-xs">
              Paste YouTube, Vimeo, or Hudl links. Coaches can play these directly from your profile.
            </p>
          </div>
        </SectionCard>

        {/* ── 8. Season Stats ── */}
        <SectionCard icon={BarChart2} title="Season Statistics">
          {stats.length > 0 && (
            <div className="overflow-x-auto mb-5 rounded-xl border border-white/10">
              <table className="w-full text-xs min-w-[640px]">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.03]">
                    {["Season", "Team", "GP", "PPG", "RPG", "APG", "FG%", "3PT%", ""].map(h => (
                      <th
                        key={h}
                        className="px-3 py-2.5 text-left text-white/40 font-semibold uppercase tracking-wider whitespace-nowrap first:pl-4 last:pr-4"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stats.map(row => (
                    <tr key={row.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                      {(["season", "team", "gp", "ppg", "rpg", "apg", "fg_pct", "three_pt_pct"] as const).map(field => (
                        <td key={field} className="px-2 py-2 first:pl-4">
                          <input
                            type="text"
                            value={row[field]}
                            onChange={e => updateStat(row.id, field, e.target.value)}
                            placeholder={
                              field === "season" ? "2024-25" :
                              field === "team"   ? "Team" :
                              field === "gp"     ? "0" : "0.0"
                            }
                            className="w-full bg-transparent text-white placeholder-white/20 text-xs focus:outline-none py-1"
                            style={{ minWidth: field === "season" || field === "team" ? "80px" : "48px" }}
                          />
                        </td>
                      ))}
                      <td className="px-2 py-2 pr-4">
                        <button
                          type="button"
                          onClick={() => removeStatRow(row.id)}
                          className="text-white/20 hover:text-red-400 transition-colors p-1"
                          aria-label="Remove row"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <button
            type="button"
            onClick={addStatRow}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 text-white/50 hover:text-white hover:border-white/25 text-sm transition-all"
          >
            <Plus size={15} />
            Add Season
          </button>
          <p className="text-white/25 text-xs mt-3">
            Add your stats season by season. Use figures from your official league records.
          </p>
        </SectionCard>

        {/* Bottom save row */}
        <div className="flex items-center justify-between pt-2 pb-8">
          <p className="text-white/25 text-xs">Changes are not saved automatically.</p>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-7 py-3 rounded-xl bg-gold text-navy font-bold text-sm hover:bg-amber-400 transition-all disabled:opacity-50 shadow-lg shadow-gold/20"
          >
            {saving ? (
              <><Loader2 size={15} className="animate-spin" /> Saving…</>
            ) : (
              <><Save size={15} /> Save Profile</>
            )}
          </button>
        </div>
      </main>

      {/* ── Preview Modal ── */}
      {showPreview && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 backdrop-blur-sm p-4 py-10"
          onClick={e => { if (e.target === e.currentTarget) setShowPreview(false); }}
        >
          <div className="w-full max-w-2xl bg-[#0D1B3E] border border-white/15 rounded-3xl overflow-hidden shadow-2xl shadow-black/50">

            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <Eye size={15} className="text-gold" />
                <span className="text-white font-bold text-sm">Coach Preview</span>
                <span className="text-white/30 text-xs">— how your profile appears to coaches</span>
              </div>
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors text-lg leading-none"
              >
                ✕
              </button>
            </div>

            <div className="px-6 py-8 space-y-7">

              {/* Identity block */}
              <div className="flex items-start gap-5">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border border-gold/30 flex items-center justify-center flex-shrink-0 bg-gold/15">
                  {(photoPreview || photoUrl) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photoPreview ?? photoUrl ?? ""} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-black text-gold">
                      {fullName ? fullName.charAt(0).toUpperCase() : "?"}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-black text-white">{fullName || "No name set"}</h2>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-sm text-white/50">
                    {positionLabel && (
                      <span className="text-gold font-semibold">{positionLabel}</span>
                    )}
                    {currentTeam && (
                      <><span className="text-white/20">·</span><span>{currentTeam}</span></>
                    )}
                    {city && state && (
                      <><span className="text-white/20">·</span><span>{city}, {state}</span></>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {heightDisplay && (
                      <span className="px-3 py-1 rounded-full border border-white/10 bg-white/5 text-white/60 text-xs">
                        {heightCm} cm · {heightDisplay}
                      </span>
                    )}
                    {weightDisplay && (
                      <span className="px-3 py-1 rounded-full border border-white/10 bg-white/5 text-white/60 text-xs">
                        {weightKg} kg · {weightDisplay}
                      </span>
                    )}
                    {!isVisible && (
                      <span className="px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs">
                        Profile currently hidden
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Goals */}
              {goals && (
                <div>
                  <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2.5">
                    Goals & Aspirations
                  </h3>
                  <p className="text-white/70 text-sm leading-relaxed">{goals}</p>
                </div>
              )}

              {/* Videos */}
              {(video1 || video2 || video3) && (
                <div>
                  <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">
                    Highlight Tapes
                  </h3>
                  <div className="space-y-2">
                    {[video1, video2, video3].filter(Boolean).map((url, i) => (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.03] text-gold text-sm hover:bg-white/[0.07] transition-colors"
                      >
                        <Video size={14} className="flex-shrink-0" />
                        <span className="truncate text-xs">{url}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Season stats */}
              {stats.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">
                    Season Statistics
                  </h3>
                  <div className="overflow-x-auto rounded-xl border border-white/10">
                    <table className="w-full text-xs min-w-[500px]">
                      <thead>
                        <tr className="border-b border-white/10 bg-white/[0.03]">
                          {["Season", "Team", "GP", "PPG", "RPG", "APG", "FG%", "3PT%"].map(h => (
                            <th key={h} className="px-3 py-2.5 text-left text-white/40 font-semibold uppercase tracking-wider whitespace-nowrap">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {stats.map(row => (
                          <tr key={row.id} className="border-b border-white/5 last:border-0">
                            <td className="px-3 py-2.5 text-white font-semibold">{row.season || "—"}</td>
                            <td className="px-3 py-2.5 text-white/60">{row.team || "—"}</td>
                            <td className="px-3 py-2.5 text-white/60">{row.gp || "—"}</td>
                            <td className="px-3 py-2.5 text-gold font-bold">{row.ppg || "—"}</td>
                            <td className="px-3 py-2.5 text-white/60">{row.rpg || "—"}</td>
                            <td className="px-3 py-2.5 text-white/60">{row.apg || "—"}</td>
                            <td className="px-3 py-2.5 text-white/60">{row.fg_pct || "—"}</td>
                            <td className="px-3 py-2.5 text-white/60">{row.three_pt_pct || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Contact & socials */}
              {(contactEmail || contactPhone || instagram || twitter) && (
                <div>
                  <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">
                    Contact & Socials
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {contactEmail && (
                      <span className="px-3 py-1.5 rounded-xl border border-white/10 bg-white/[0.03] text-white/60 text-xs">
                        {contactEmail}
                      </span>
                    )}
                    {contactPhone && (
                      <span className="px-3 py-1.5 rounded-xl border border-white/10 bg-white/[0.03] text-white/60 text-xs">
                        {contactPhone}
                      </span>
                    )}
                    {instagram && (
                      <span className="px-3 py-1.5 rounded-xl border border-white/10 bg-white/[0.03] text-white/60 text-xs">
                        @{instagram} · Instagram
                      </span>
                    )}
                    {twitter && (
                      <span className="px-3 py-1.5 rounded-xl border border-white/10 bg-white/[0.03] text-white/60 text-xs">
                        @{twitter} · 𝕏
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Empty state */}
              {!fullName && !goals && !video1 && stats.length === 0 && (
                <div className="text-center py-8 text-white/30 text-sm">
                  Fill in your profile details above to see them here.
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div className="px-6 py-4 border-t border-white/10 flex justify-end">
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:border-white/20 text-sm transition-all"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
