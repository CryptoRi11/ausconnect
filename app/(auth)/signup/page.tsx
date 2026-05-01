import Link from "next/link";
import { Trophy, Users, ArrowRight } from "lucide-react";

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-navy flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
        <Link href="/">
          <span className="font-black text-lg tracking-tight"><span className="text-gold">A</span><span className="text-white">US CONNECT</span></span>
        </Link>
        <Link href="/login" className="text-white/60 hover:text-white text-sm transition-colors">
          Have an account? <span className="text-gold font-medium">Sign in</span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-black text-white mb-3">Join AUS Connect</h1>
            <p className="text-white/50">Choose how you want to use the platform</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <Link
              href="/signup/player"
              className="group card p-8 hover:border-gold/50 hover:-translate-y-1 transition-all duration-300 block"
            >
              <div className="w-12 h-12 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center mb-5 group-hover:bg-gold/25 transition-colors">
                <Trophy className="text-gold" size={22} />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">I&apos;m a Player</h2>
              <p className="text-white/50 text-sm leading-relaxed mb-6">
                Create your profile, showcase your highlights, and connect with US college coaches.
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                {["Free profile", "Video uploads", "Coach visibility"].map((tag) => (
                  <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-gold/10 text-gold/80 border border-gold/20">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2 text-gold font-semibold text-sm group-hover:gap-3 transition-all">
                Get recruited <ArrowRight size={16} />
              </div>
            </Link>

            <Link
              href="/signup/coach"
              className="group card p-8 hover:border-gold/50 hover:-translate-y-1 transition-all duration-300 block"
            >
              <div className="w-12 h-12 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center mb-5 group-hover:bg-gold/25 transition-colors">
                <Users className="text-gold" size={22} />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">I&apos;m a Coach</h2>
              <p className="text-white/50 text-sm leading-relaxed mb-6">
                Browse verified Australian players and find the next star for your program.
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                {["Player database", "Evaluations", "Direct contact"].map((tag) => (
                  <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-gold/10 text-gold/80 border border-gold/20">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2 text-gold font-semibold text-sm group-hover:gap-3 transition-all">
                Find talent <ArrowRight size={16} />
              </div>
            </Link>
          </div>

          <p className="text-center text-white/40 text-sm mt-8">
            Already have an account?{" "}
            <Link href="/login" className="text-gold hover:text-amber-400 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
