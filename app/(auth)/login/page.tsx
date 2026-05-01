"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { signIn } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

type Role = "player" | "coach";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("player");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError(null);

    const { data, error: signInError } = await signIn(email, password);

    if (signInError) {
      setError(
        signInError.message === "Invalid login credentials"
          ? "Incorrect email or password. Please try again."
          : signInError.message
      );
      setLoading(false);
      return;
    }

    if (data.user) {
      // Verify the account role matches the selected tab
      const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("id", data.user.id)
        .single();

      const accountRole = userData?.role ?? data.user.user_metadata?.role;

      if (accountRole && accountRole !== role) {
        setError(
          `This account is registered as a ${accountRole}. Please select the ${accountRole} tab.`
        );
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      router.push("/dashboard");
    }
  }

  return (
    <div className="min-h-screen bg-navy flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
        <Link href="/" className="font-black text-xl tracking-tight">
          <span className="text-gold">A</span>
          <span className="text-white">US CONNECT</span>
        </Link>
        <Link href="/register" className="text-sm text-white/50 hover:text-white transition-colors">
          No account?{" "}
          <span className="text-gold font-semibold">Register</span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-[440px]">

          {/* Heading */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-black text-white mb-2">Welcome back</h1>
            <p className="text-white/50 text-sm">Sign in to your AUS Connect account</p>
          </div>

          {/* Role toggle */}
          <div className="flex rounded-2xl border border-white/10 p-1.5 mb-8 bg-white/[0.03]">
            {(["player", "coach"] as Role[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => { setRole(r); setError(null); }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                  role === r
                    ? "bg-gold text-navy shadow-lg"
                    : "text-white/40 hover:text-white/70"
                }`}
              >
                {r === "player" ? "Player Login" : "Coach Login"}
              </button>
            ))}
          </div>

          {/* Role hint */}
          <div className="flex items-start gap-3 px-4 py-3 rounded-xl border border-gold/20 bg-gold/[0.06] mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 flex-shrink-0" />
            <p className="text-gold/80 text-sm leading-relaxed">
              {role === "player"
                ? "Signing in as a player — manage your profile and get discovered by coaches."
                : "Signing in as a coach — browse Australian talent and manage your recruitment pipeline."}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/25 focus:outline-none focus:border-gold/50 focus:bg-white/[0.08] transition-all text-sm"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-white/60">Password</label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-gold/60 hover:text-gold transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full px-4 py-3.5 pr-12 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/25 focus:outline-none focus:border-gold/50 focus:bg-white/[0.08] transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full py-4 rounded-xl bg-gold text-navy font-bold text-sm hover:bg-amber-400 active:scale-[0.98] transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-gold/20 mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-navy/30 border-t-navy rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : (
                `Sign in as ${role === "player" ? "Player" : "Coach"}`
              )}
            </button>
          </form>

          <p className="text-center text-white/30 text-sm mt-8">
            New to AUS Connect?{" "}
            <Link href="/register" className="text-gold hover:text-amber-300 font-semibold transition-colors">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
