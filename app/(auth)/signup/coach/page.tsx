"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUpAndAutoLogin } from "@/lib/auth";

const divisions = ["Division I (D1)", "Division II (D2)", "Division III (D3)", "NAIA", "JUCO"];

export default function CoachSignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      setLoading(false);
      return;
    }

    const { data, error: signUpError } = await signUpAndAutoLogin(email, password, "coach");

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (data?.user) {
      router.push("/dashboard");
    } else {
      setSuccess(true);
    }
    setLoading(false);
  }

  if (success) {
    return (
      <div className="min-h-screen bg-navy flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-gold/10 border-2 border-gold flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-white mb-3">Check your email</h1>
          <p className="text-white/50 mb-6">
            We sent a confirmation link to <span className="text-gold">{email}</span>. Click it to activate your account.
          </p>
          <Link href="/login" className="btn-primary">Go to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy flex flex-col">
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
        <Link href="/">
          <span className="font-black text-lg tracking-tight"><span className="text-gold">A</span><span className="text-white">US CONNECT</span></span>
        </Link>
        <Link href="/login" className="text-white/60 hover:text-white text-sm transition-colors">
          Have an account? <span className="text-gold font-medium">Sign in</span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <Link href="/signup" className="inline-flex items-center gap-1.5 text-gold text-xs font-semibold tracking-widest uppercase mb-4 hover:opacity-80 transition-opacity">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Coach Sign Up
            </Link>
            <h1 className="text-3xl font-black text-white mb-2">Create your coach profile</h1>
            <p className="text-white/50 text-sm">Access Australia&apos;s top basketball talent</p>
          </div>

          <div className="card p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">First Name</label>
                  <input type="text" placeholder="David" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-gold/50 transition-all" />
                </div>
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">Last Name</label>
                  <input type="text" placeholder="Williams" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-gold/50 transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="coach@university.edu"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-gold/50 transition-all"
                />
              </div>

              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">University / College</label>
                <input type="text" placeholder="University of Colorado" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-gold/50 transition-all" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">Division</label>
                  <select className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-gold/50 transition-all appearance-none">
                    <option value="" className="bg-navy">Select division</option>
                    {divisions.map(d => <option key={d} value={d} className="bg-navy">{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">Title</label>
                  <input type="text" placeholder="Head Coach" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-gold/50 transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-gold/50 transition-all"
                />
              </div>

              {error && (
                <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3.5 text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating account…" : "Create Coach Profile"}
              </button>
            </form>
          </div>

          <p className="text-center text-white/40 text-sm mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-gold hover:text-amber-400 transition-colors">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
