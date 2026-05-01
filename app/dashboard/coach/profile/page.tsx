"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Save, User, BookOpen, Phone, Mail,
  Globe, FileText, CheckCircle, AlertCircle, Loader2,
  ChevronDown, Lock,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

// ─── Constants ────────────────────────────────────────────────────────────────

const JOB_TITLES = [
  "Head Coach",
  "Assistant Coach",
  "Associate Head Coach",
  "Recruiting Coordinator",
  "Graduate Assistant",
];

const BIO_MAX = 300;

// ─── Shared UI primitives (mirror player profile conventions) ─────────────────

const inputClass =
  "w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-white/25 focus:outline-none focus:border-gold/50 focus:bg-white/[0.08] transition-all";

const selectClass =
  "w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-gold/50 focus:bg-white/[0.08] transition-all appearance-none cursor-pointer";

function SectionCard({
  icon: Icon, title, children,
}: {
  icon: React.ElementType; title: string; children: React.ReactNode;
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

// ─── Form state ───────────────────────────────────────────────────────────────

type FormState = {
  full_name:      string;
  university:     string;
  position_title: string;
  contact_email:  string;
  contact_phone:  string;
  website_url:    string;
  bio:            string;
};

const BLANK: FormState = {
  full_name: "", university: "", position_title: "",
  contact_email: "", contact_phone: "", website_url: "", bio: "",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CoachProfilePage() {
  const router = useRouter();

  const [form, setForm]       = useState<FormState>(BLANK);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [error, setError]     = useState("");
  const [subStatus, setSubStatus] = useState("free");

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/login"); return; }

      // Gate: coaches only
      const { data: uRow } = await supabase
        .from("users")
        .select("role, subscription_status")
        .eq("id", user.id)
        .single();

      if (uRow?.role !== "coach") { router.replace("/dashboard"); return; }
      setSubStatus(uRow?.subscription_status ?? "free");

      // Load existing profile
      const { data: prof } = await supabase
        .from("coach_profiles")
        .select("id, full_name, university, position_title, contact_email, contact_phone, website_url, bio")
        .eq("user_id", user.id)
        .single();

      if (prof) {
        setProfileId(prof.id ?? null);
        setForm({
          full_name:      prof.full_name      ?? "",
          university:     prof.university     ?? "",
          position_title: prof.position_title ?? "",
          contact_email:  prof.contact_email  ?? "",
          contact_phone:  (prof as Record<string, string | null>).contact_phone ?? "",
          website_url:    (prof as Record<string, string | null>).website_url   ?? "",
          bio:            (prof as Record<string, string | null>).bio           ?? "",
        });
      } else {
        setForm(prev => ({ ...prev, contact_email: user.email ?? "" }));
      }

      setLoading(false);
    }
    load();
  }, [router]);

  function set(field: keyof FormState, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }

    const payload = {
      user_id:        user.id,
      full_name:      form.full_name.trim()      || null,
      university:     form.university.trim()     || null,
      position_title: form.position_title        || null,
      contact_email:  form.contact_email.trim()  || null,
      contact_phone:  form.contact_phone.trim()  || null,
      website_url:    form.website_url.trim()    || null,
      bio:            form.bio.trim()            || null,
    };

    let err;
    if (profileId) {
      ({ error: err } = await supabase
        .from("coach_profiles")
        .update(payload)
        .eq("id", profileId));
    } else {
      const { data: inserted, error: insertErr } = await supabase
        .from("coach_profiles")
        .insert(payload)
        .select("id")
        .single();
      err = insertErr;
      if (inserted?.id) setProfileId(inserted.id);
    }

    if (err) {
      setError(err.message);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  }

  const isActive = subStatus !== "free";
  const initials = form.full_name
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? "")
    .join("") || "?";

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
          <p className="text-white/40 text-sm">Loading your profile…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy">

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-navy/90 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-white/50 hover:text-white text-sm font-medium transition-colors group"
          >
            <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
            Dashboard
          </Link>
          <span className="font-black text-sm tracking-tight">
            <span className="text-gold">A</span><span className="text-white">US CONNECT</span>
          </span>
          <div className="w-24" />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 pb-20">

        {/* Page heading */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gold/30 bg-gold/10 text-gold text-xs font-semibold mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-gold" />
            Coach Profile
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white">My Profile</h1>
          <p className="text-white/40 text-sm mt-1.5 max-w-md">
            Your details are visible to players browsing the AUS Connect network.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">

          {/* ── Subscription status ── */}
          {isActive ? (
            <div className="flex items-center gap-4 px-5 py-4 rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.06]">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center flex-shrink-0">
                <CheckCircle size={16} className="text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-emerald-300 font-bold text-sm">Active Subscription</p>
                <p className="text-emerald-400/60 text-xs mt-0.5">
                  Full access to player profiles, stats, contact details, and AUS rankings.
                </p>
              </div>
              <span className="flex-shrink-0 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-xs font-bold">
                Active
              </span>
            </div>
          ) : (
            <div className="relative overflow-hidden rounded-2xl border border-gold/25 bg-gold/[0.04]">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(201,168,76,0.1)_0%,transparent_65%)] pointer-events-none" />
              <div className="relative flex flex-col sm:flex-row sm:items-center gap-4 px-6 py-5">
                <div className="w-10 h-10 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center flex-shrink-0">
                  <Lock size={16} className="text-gold" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gold font-bold text-sm">Upgrade to Full Access</p>
                  <p className="text-white/45 text-xs mt-1 leading-relaxed">
                    Subscribe to unlock complete player profiles, physical stats, season averages,
                    contact information, and the AUS Composite Rank score.
                  </p>
                </div>
                <Link
                  href="/register"
                  className="flex-shrink-0 px-5 py-2.5 rounded-xl bg-gold text-navy font-bold text-sm hover:bg-amber-400 transition-colors"
                >
                  Upgrade now
                </Link>
              </div>
            </div>
          )}

          {/* ── Profile photo ── */}
          <SectionCard icon={User} title="Profile Photo">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-white/5 border-2 border-dashed border-white/15 flex flex-col items-center justify-center flex-shrink-0 select-none">
                {form.full_name.trim() ? (
                  <span className="text-white/40 font-black text-2xl">{initials}</span>
                ) : (
                  <>
                    <User size={22} className="text-white/15 mb-1" />
                    <span className="text-white/15 text-[10px]">Photo</span>
                  </>
                )}
              </div>
              <div>
                <p className="text-white font-semibold text-sm mb-1">Profile photo</p>
                <p className="text-white/35 text-xs leading-relaxed">
                  Photo upload coming soon. Your initials are shown to players in the meantime.
                </p>
              </div>
            </div>
          </SectionCard>

          {/* ── Personal details ── */}
          <SectionCard icon={Mail} title="Personal Details">
            <div className="space-y-5">
              <div>
                <FieldLabel>Full Name</FieldLabel>
                <input
                  type="text"
                  value={form.full_name}
                  onChange={e => set("full_name", e.target.value)}
                  placeholder="e.g. James Mitchell"
                  className={inputClass}
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <FieldLabel>Contact Email</FieldLabel>
                  <div className="relative">
                    <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
                    <input
                      type="email"
                      value={form.contact_email}
                      onChange={e => set("contact_email", e.target.value)}
                      placeholder="you@university.edu"
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </div>
                <div>
                  <FieldLabel>Phone Number</FieldLabel>
                  <div className="relative">
                    <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
                    <input
                      type="tel"
                      value={form.contact_phone}
                      onChange={e => set("contact_phone", e.target.value)}
                      placeholder="+61 4XX XXX XXX"
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* ── University details ── */}
          <SectionCard icon={BookOpen} title="University Details">
            <div className="space-y-5">
              <div>
                <FieldLabel>University / College Name</FieldLabel>
                <input
                  type="text"
                  value={form.university}
                  onChange={e => set("university", e.target.value)}
                  placeholder="e.g. University of Kentucky"
                  className={inputClass}
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <FieldLabel>Job Title</FieldLabel>
                  <div className="relative">
                    <select
                      value={form.position_title}
                      onChange={e => set("position_title", e.target.value)}
                      className={selectClass}
                    >
                      <option value="">Select title…</option>
                      {JOB_TITLES.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <FieldLabel>University Website</FieldLabel>
                  <div className="relative">
                    <Globe size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
                    <input
                      type="url"
                      value={form.website_url}
                      onChange={e => set("website_url", e.target.value)}
                      placeholder="https://athletics.university.edu"
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* ── Bio ── */}
          <SectionCard icon={FileText} title="Bio">
            <FieldLabel>Brief Description</FieldLabel>
            <div className="relative">
              <textarea
                value={form.bio}
                onChange={e => set("bio", e.target.value.slice(0, BIO_MAX))}
                rows={5}
                placeholder="Tell players about your program, coaching philosophy, and what you look for in recruits…"
                className={`${inputClass} resize-none pb-8`}
              />
              <span className={`absolute bottom-3 right-4 text-[10px] font-semibold tabular-nums pointer-events-none transition-colors ${
                form.bio.length >= BIO_MAX
                  ? "text-amber-400"
                  : form.bio.length >= BIO_MAX * 0.85
                  ? "text-white/40"
                  : "text-white/20"
              }`}>
                {form.bio.length}/{BIO_MAX}
              </span>
            </div>
          </SectionCard>

          {/* ── Error ── */}
          {error && (
            <div className="flex items-start gap-3 px-4 py-3 rounded-xl border border-red-500/20 bg-red-500/5">
              <AlertCircle size={15} className="text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* ── Save button ── */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gold text-navy font-bold text-sm hover:bg-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving
                ? <><Loader2 size={15} className="animate-spin" />Saving…</>
                : <><Save size={15} />Save profile</>
              }
            </button>
            {saved && (
              <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
                <CheckCircle size={15} />
                Saved successfully
              </div>
            )}
          </div>

        </form>
      </main>
    </div>
  );
}
