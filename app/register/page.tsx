"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, Trophy, Users, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { signUp, signIn } from "@/lib/auth";

type Step = "role" | "details";
type Role = "player" | "coach";
type FieldErrors = Record<string, string>;

const AU_STATES = ["ACT", "NSW", "NT", "QLD", "SA", "TAS", "VIC", "WA"];
const POSITIONS = [
  { value: "PG", label: "Point Guard (PG)" },
  { value: "SG", label: "Shooting Guard (SG)" },
  { value: "SF", label: "Small Forward (SF)" },
  { value: "PF", label: "Power Forward (PF)" },
  { value: "C",  label: "Centre (C)" },
];

const inputClass =
  "w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-white/25 focus:outline-none focus:border-gold/50 focus:bg-white/[0.08] transition-all";

const inputErrorClass =
  "w-full px-4 py-3.5 rounded-xl bg-white/5 border border-red-500/40 text-white text-sm placeholder-white/25 focus:outline-none focus:border-red-500/60 focus:bg-white/[0.08] transition-all";

export default function RegisterPage() {
  const router = useRouter();

  const [step, setStep]   = useState<Step>("role");
  const [role, setRole]   = useState<Role>("player");

  const [fullName, setFullName]               = useState("");
  const [email, setEmail]                     = useState("");
  const [password, setPassword]               = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPwd, setShowPwd]                 = useState(false);
  const [showConfirm, setShowConfirm]         = useState(false);

  // Player fields
  const [city, setCity]           = useState("");
  const [state, setState]         = useState("");
  const [currentTeam, setCurrentTeam] = useState("");
  const [position, setPosition]   = useState("");

  // Coach fields
  const [university, setUniversity] = useState("");
  const [jobTitle, setJobTitle]     = useState("");

  const [errors, setErrors]   = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    const e: FieldErrors = {};

    if (!fullName.trim())   e.fullName = "Full name is required";
    if (!email.trim())      e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid email address";
    if (!password)          e.password = "Password is required";
    else if (password.length < 8) e.password = "Must be at least 8 characters";
    if (!confirmPassword)   e.confirmPassword = "Please confirm your password";
    else if (password !== confirmPassword) e.confirmPassword = "Passwords do not match";

    if (role === "player") {
      if (!city.trim()) e.city = "City is required";
      if (!state)       e.state = "Please select your state";
      if (!position)    e.position = "Please select your position";
    } else {
      if (!university.trim()) e.university = "University is required";
      if (!jobTitle.trim())   e.jobTitle = "Job title is required";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    const normalizedEmail = email.trim().toLowerCase();

    const { data, error: signUpError } = await signUp(normalizedEmail, password, role);

    if (signUpError) {
      setErrors({ submit: signUpError.message });
      setLoading(false);
      return;
    }

    // Force sign-in immediately after sign-up regardless of session state
    const { data: signInData, error: signInError } = await signIn(normalizedEmail, password);

    if (signInError || !signInData.user) {
      setErrors({ submit: signInError?.message ?? "Sign-in after registration failed. Please log in manually." });
      setLoading(false);
      return;
    }

    const userId = signInData.user.id;

    if (role === "player") {
      await supabase.from("player_profiles").insert({
        user_id: userId,
        full_name: fullName.trim(),
        location_city: city.trim(),
        location_state: state,
        current_team: currentTeam.trim() || null,
        position,
        contact_email: normalizedEmail,
        is_visible: true,
      });
    } else {
      await supabase.from("coach_profiles").insert({
        user_id: userId,
        full_name: fullName.trim(),
        university: university.trim(),
        position_title: jobTitle.trim(),
        contact_email: normalizedEmail,
      });
    }

    router.push("/dashboard");
  }


  // ── Step 1: Role selection ───────────────────────────────────────────────────
  if (step === "role") {
    return (
      <div className="min-h-screen bg-navy flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <Link href="/" className="font-black text-xl tracking-tight">
            <span className="text-gold">A</span>
            <span className="text-white">US CONNECT</span>
          </Link>
          <Link href="/login" className="text-sm text-white/50 hover:text-white transition-colors">
            Have an account?{" "}
            <span className="text-gold font-semibold">Log in</span>
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="w-full max-w-2xl">
            {/* Progress */}
            <div className="flex items-center justify-center gap-3 mb-10">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gold text-navy text-xs font-black flex items-center justify-center">
                  1
                </div>
                <span className="text-white text-sm font-semibold">Choose role</span>
              </div>
              <div className="w-12 h-px bg-white/15" />
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-white/10 text-white/30 text-xs font-black flex items-center justify-center">
                  2
                </div>
                <span className="text-white/30 text-sm">Your details</span>
              </div>
            </div>

            <div className="text-center mb-10">
              <h1 className="text-4xl font-black text-white mb-3">Join AUS Connect</h1>
              <p className="text-white/50">Who are you? Choose your role to get started.</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              {/* Player */}
              <button
                type="button"
                onClick={() => { setRole("player"); setStep("details"); }}
                className="group text-left p-8 rounded-3xl border-2 border-white/10 bg-white/[0.03] hover:border-gold/50 hover:bg-white/[0.06] transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              >
                <div className="w-14 h-14 rounded-2xl bg-gold/10 border border-gold/25 flex items-center justify-center mb-5 group-hover:bg-gold/20 transition-colors">
                  <Trophy className="text-gold" size={24} />
                </div>
                <h2 className="text-xl font-black text-white mb-2">I&apos;m a Player</h2>
                <p className="text-white/50 text-sm leading-relaxed mb-5">
                  Build your profile, upload highlights, and get discovered by US college coaches.
                </p>
                <ul className="space-y-2 mb-6">
                  {["Free profile creation", "Highlight video uploads", "Coach visibility"].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-white/60 text-xs">
                      <span className="w-4 h-4 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center flex-shrink-0">
                        <Check size={9} className="text-gold" />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
                <span className="inline-flex items-center gap-1.5 text-gold text-sm font-bold group-hover:gap-3 transition-all">
                  Get recruited
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </button>

              {/* Coach */}
              <button
                type="button"
                onClick={() => { setRole("coach"); setStep("details"); }}
                className="group text-left p-8 rounded-3xl border-2 border-white/10 bg-white/[0.03] hover:border-gold/50 hover:bg-white/[0.06] transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              >
                <div className="w-14 h-14 rounded-2xl bg-gold/10 border border-gold/25 flex items-center justify-center mb-5 group-hover:bg-gold/20 transition-colors">
                  <Users className="text-gold" size={24} />
                </div>
                <h2 className="text-xl font-black text-white mb-2">I&apos;m a Coach</h2>
                <p className="text-white/50 text-sm leading-relaxed mb-5">
                  Browse verified Australian players and find the next star for your program.
                </p>
                <ul className="space-y-2 mb-6">
                  {["Searchable player database", "Advanced filtering", "Direct player contact"].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-white/60 text-xs">
                      <span className="w-4 h-4 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center flex-shrink-0">
                        <Check size={9} className="text-gold" />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
                <span className="inline-flex items-center gap-1.5 text-gold text-sm font-bold group-hover:gap-3 transition-all">
                  Find talent
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </button>
            </div>

            <p className="text-center text-white/30 text-sm mt-8">
              Already have an account?{" "}
              <Link href="/login" className="text-gold hover:text-amber-300 font-semibold transition-colors">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Step 2: Details form ─────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-navy flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
        <Link href="/" className="font-black text-xl tracking-tight">
          <span className="text-gold">A</span>
          <span className="text-white">US CONNECT</span>
        </Link>
        <Link href="/login" className="text-sm text-white/50 hover:text-white transition-colors">
          Have an account?{" "}
          <span className="text-gold font-semibold">Log in</span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          {/* Progress */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gold/20 border border-gold/40 text-gold text-xs font-black flex items-center justify-center">
                <Check size={12} />
              </div>
              <span className="text-white/40 text-sm">Choose role</span>
            </div>
            <div className="w-12 h-px bg-gold/30" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gold text-navy text-xs font-black flex items-center justify-center">
                2
              </div>
              <span className="text-white text-sm font-semibold">Your details</span>
            </div>
          </div>

          {/* Role badge */}
          <div className="flex items-center justify-between mb-6 px-4 py-3 rounded-xl border border-gold/20 bg-gold/[0.06]">
            <div className="flex items-center gap-2">
              {role === "player"
                ? <Trophy size={14} className="text-gold" />
                : <Users size={14} className="text-gold" />}
              <span className="text-gold text-sm font-semibold">
                Registering as a {role === "player" ? "Player" : "Coach"}
              </span>
            </div>
            <button
              type="button"
              onClick={() => { setStep("role"); setErrors({}); }}
              className="flex items-center gap-1 text-white/40 hover:text-white text-xs transition-colors"
            >
              <ArrowLeft size={12} />
              Change
            </button>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">

            {/* Full name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-white/60 mb-2">
                Full name <span className="text-gold">*</span>
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jake Morrison"
                autoComplete="name"
                className={errors.fullName ? inputErrorClass : inputClass}
              />
              {errors.fullName && <p className="mt-1.5 text-xs text-red-400">{errors.fullName}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white/60 mb-2">
                Email address <span className="text-gold">*</span>
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className={errors.email ? inputErrorClass : inputClass}
              />
              {errors.email && <p className="mt-1.5 text-xs text-red-400">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white/60 mb-2">
                Password <span className="text-gold">*</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
                  className={errors.password ? inputErrorClass : inputClass}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  tabIndex={-1}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p className="mt-1.5 text-xs text-red-400">{errors.password}</p>}
            </div>

            {/* Confirm password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-white/60 mb-2">
                Confirm password <span className="text-gold">*</span>
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  autoComplete="new-password"
                  className={errors.confirmPassword ? inputErrorClass : inputClass}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  tabIndex={-1}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1.5 text-xs text-red-400">{errors.confirmPassword}</p>}
            </div>

            {/* Section divider */}
            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-white/20 text-xs uppercase tracking-wider">
                {role === "player" ? "Basketball details" : "Program details"}
              </span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Player-specific fields */}
            {role === "player" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-white/60 mb-2">
                      City <span className="text-gold">*</span>
                    </label>
                    <input
                      id="city"
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Sydney"
                      className={errors.city ? inputErrorClass : inputClass}
                    />
                    {errors.city && <p className="mt-1.5 text-xs text-red-400">{errors.city}</p>}
                  </div>

                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-white/60 mb-2">
                      State <span className="text-gold">*</span>
                    </label>
                    <div className="relative">
                      <select
                        id="state"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className={`w-full px-4 py-3.5 rounded-xl bg-navy border text-sm appearance-none focus:outline-none focus:bg-white/[0.04] transition-all pr-10 ${
                          state ? "text-white" : "text-white/25"
                        } ${errors.state ? "border-red-500/40 focus:border-red-500/60" : "border-white/10 focus:border-gold/50"}`}
                      >
                        <option value="" disabled>Select state</option>
                        {AU_STATES.map((s) => (
                          <option key={s} value={s} className="bg-navy text-white">{s}</option>
                        ))}
                      </select>
                      <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                    {errors.state && <p className="mt-1.5 text-xs text-red-400">{errors.state}</p>}
                  </div>
                </div>

                <div>
                  <label htmlFor="currentTeam" className="block text-sm font-medium text-white/60 mb-2">
                    Current team <span className="text-white/30 text-xs font-normal">(optional)</span>
                  </label>
                  <input
                    id="currentTeam"
                    type="text"
                    value={currentTeam}
                    onChange={(e) => setCurrentTeam(e.target.value)}
                    placeholder="Sydney Kings U20"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="position" className="block text-sm font-medium text-white/60 mb-2">
                    Position <span className="text-gold">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="position"
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      className={`w-full px-4 py-3.5 rounded-xl bg-navy border text-sm appearance-none focus:outline-none focus:bg-white/[0.04] transition-all pr-10 ${
                        position ? "text-white" : "text-white/25"
                      } ${errors.position ? "border-red-500/40 focus:border-red-500/60" : "border-white/10 focus:border-gold/50"}`}
                    >
                      <option value="" disabled>Select position</option>
                      {POSITIONS.map((p) => (
                        <option key={p.value} value={p.value} className="bg-navy text-white">{p.label}</option>
                      ))}
                    </select>
                    <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  {errors.position && <p className="mt-1.5 text-xs text-red-400">{errors.position}</p>}
                </div>
              </>
            )}

            {/* Coach-specific fields */}
            {role === "coach" && (
              <>
                <div>
                  <label htmlFor="university" className="block text-sm font-medium text-white/60 mb-2">
                    University / College <span className="text-gold">*</span>
                  </label>
                  <input
                    id="university"
                    type="text"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    placeholder="University of Colorado"
                    className={errors.university ? inputErrorClass : inputClass}
                  />
                  {errors.university && <p className="mt-1.5 text-xs text-red-400">{errors.university}</p>}
                </div>

                <div>
                  <label htmlFor="jobTitle" className="block text-sm font-medium text-white/60 mb-2">
                    Job title <span className="text-gold">*</span>
                  </label>
                  <input
                    id="jobTitle"
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="Head Coach / Assistant Coach"
                    className={errors.jobTitle ? inputErrorClass : inputClass}
                  />
                  {errors.jobTitle && <p className="mt-1.5 text-xs text-red-400">{errors.jobTitle}</p>}
                </div>
              </>
            )}

            {/* Submit error */}
            {errors.submit && (
              <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                <p className="text-red-400 text-sm">{errors.submit}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-gold text-navy font-bold text-sm hover:bg-amber-400 active:scale-[0.98] transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-gold/20"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-navy/30 border-t-navy rounded-full animate-spin" />
                  Creating account…
                </span>
              ) : (
                `Create ${role === "player" ? "Player" : "Coach"} Account`
              )}
            </button>

            <p className="text-center text-white/25 text-xs pb-2">
              By signing up you agree to our{" "}
              <Link href="/terms" className="text-gold/50 hover:text-gold transition-colors">Terms</Link>
              {" "}and{" "}
              <Link href="/privacy" className="text-gold/50 hover:text-gold transition-colors">Privacy Policy</Link>.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
