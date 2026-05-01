import Link from "next/link";
import {
  ArrowRight,
  Users,
  Trophy,
  Globe,
  Star,
  ChevronRight,
  TrendingUp,
  Shield,
  Video,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const stats = [
  { value: "500+", label: "Australian Players" },
  { value: "200+", label: "College Programs" },
  { value: "48", label: "US States Covered" },
  { value: "85%", label: "Placement Rate" },
];

const features = [
  {
    icon: Video,
    title: "Highlight Reels",
    description:
      "Upload and showcase your best moments directly to verified college coaches browsing the platform.",
  },
  {
    icon: Shield,
    title: "Verified Coaches",
    description:
      "Every coach profile is verified. No gatekeepers — communicate directly with the staff that matter.",
  },
  {
    icon: TrendingUp,
    title: "Smart Matching",
    description:
      "Our algorithm surfaces the right players for each program based on division, position, and academic fit.",
  },
  {
    icon: Globe,
    title: "Global Network",
    description:
      "From D1 powerhouses to D3 programs with full rides — we cover the full spectrum of US college basketball.",
  },
];

const testimonials = [
  {
    quote:
      "AUS Connect is the reason I'm playing D1 ball in the States. My profile was viewed by 14 coaches within the first week.",
    name: "Lachlan M.",
    detail: "Point Guard · Sydney, NSW → Ohio State",
    initials: "LM",
  },
  {
    quote:
      "We signed two Australian guards this cycle through AUS Connect. The quality of talent coming out of Australia is exceptional.",
    name: "Coach D. Williams",
    detail: "Head Coach · University of Colorado",
    initials: "DW",
  },
  {
    quote:
      "The platform is seamless. I created my profile on Monday and had three coach messages by Wednesday. Incredible reach.",
    name: "Isabelle T.",
    detail: "Shooting Guard · Melbourne, VIC → Duke",
    initials: "IT",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-navy">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0 bg-hero-pattern" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_50%,rgba(201,168,76,0.08)_0%,transparent_60%)]" />
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        {/* Gold orb */}
        <div className="absolute right-0 top-1/4 w-[600px] h-[600px] rounded-full bg-gold/5 blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
          <div className="max-w-4xl">
            {/* Hero logo */}
            <div className="flex justify-center mb-10 animate-fade-in">
              <div
                style={{
                  width: 200, height: 200,
                  borderRadius: "50%",
                  background: "#fff",
                  border: "3px solid #C9A84C",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.35)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.png" alt="AUS Connect" style={{ height: 165, width: "auto" }} />
              </div>
            </div>

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gold/30 bg-gold/10 text-gold text-sm font-medium mb-8 animate-fade-in">
              <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
              Australia's Premier Basketball Recruitment Platform
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight text-white animate-slide-up">
              Your Game.
              <br />
              <span className="gradient-text">Their Campus.</span>
            </h1>

            <p className="mt-6 text-xl sm:text-2xl text-white/60 leading-relaxed max-w-2xl animate-slide-up-delay opacity-0">
              AUS Connect bridges elite Australian basketball talent with US college programs.{" "}
              <span className="text-white/80">Get seen. Get recruited. Get there.</span>
            </p>

            {/* CTA row */}
            <div className="mt-10 flex flex-wrap gap-4 animate-slide-up-delay-2 opacity-0">
              <Link href="/register" className="btn-primary px-8 py-4 text-base group">
                I&apos;m a Player
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/register" className="btn-outline px-8 py-4 text-base group">
                I&apos;m a Coach
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30 text-xs">
          <span>Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-white/30 to-transparent" />
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="border-y border-white/10 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-black text-gold">{stat.value}</div>
                <div className="text-white/50 text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Sign-up paths ── */}
      <section className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-heading">Join AUS Connect</h2>
            <p className="section-subheading mx-auto">
              Whether you&apos;re chasing a scholarship or searching for the next great talent — we&apos;ve built this for you.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Player card */}
            <Link href="/register" className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 hover:border-gold/50 hover:bg-white/8 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-gold/10 p-8 md:p-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-gold/10 transition-colors duration-300" />
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gold/15 border border-gold/30 flex items-center justify-center mb-6 group-hover:bg-gold/25 transition-colors">
                  <Trophy className="text-gold" size={26} />
                </div>
                <div className="inline-flex items-center gap-1.5 text-gold text-xs font-semibold tracking-widest uppercase mb-3">
                  <span className="w-5 h-px bg-gold/60" />
                  For Players
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
                  Get Recruited
                </h3>
                <p className="text-white/60 leading-relaxed mb-8">
                  Build your profile, upload your highlights, and get in front of 200+ verified college coaches. Your path to a US scholarship starts here.
                </p>
                <ul className="space-y-2 mb-8">
                  {["Free profile creation", "Highlight video uploads", "Direct coach messaging", "Scholarship tracking"].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-white/70 text-sm">
                      <span className="w-4 h-4 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center flex-shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="flex items-center gap-2 text-gold font-semibold group-hover:gap-3 transition-all">
                  Create Player Profile
                  <ChevronRight size={18} />
                </div>
              </div>
            </Link>

            {/* Coach card */}
            <Link href="/register" className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 hover:border-gold/50 hover:bg-white/8 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-gold/10 p-8 md:p-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-gold/10 transition-colors duration-300" />
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gold/15 border border-gold/30 flex items-center justify-center mb-6 group-hover:bg-gold/25 transition-colors">
                  <Users className="text-gold" size={26} />
                </div>
                <div className="inline-flex items-center gap-1.5 text-gold text-xs font-semibold tracking-widest uppercase mb-3">
                  <span className="w-5 h-px bg-gold/60" />
                  For Coaches
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
                  Find Talent
                </h3>
                <p className="text-white/60 leading-relaxed mb-8">
                  Access a curated database of verified Australian players. Filter by position, division fit, academics, and more. Sign your next star.
                </p>
                <ul className="space-y-2 mb-8">
                  {["Searchable player database", "Advanced filters & stats", "Video highlight access", "Verified player profiles"].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-white/70 text-sm">
                      <span className="w-4 h-4 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center flex-shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="flex items-center gap-2 text-gold font-semibold group-hover:gap-3 transition-all">
                  Create Coach Profile
                  <ChevronRight size={18} />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-24 border-t border-white/10 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-heading">Everything you need to get recruited</h2>
            <p className="section-subheading mx-auto">
              Purpose-built tools for the Australian basketball recruitment process.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="card p-6 hover:border-gold/30 transition-all duration-300 hover:-translate-y-1">
                  <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center mb-4">
                    <Icon className="text-gold" size={22} />
                  </div>
                  <h3 className="font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-heading">Success stories</h2>
            <p className="section-subheading mx-auto">
              Real players. Real coaches. Real results.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="card p-8 hover:border-gold/30 transition-all duration-300">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className="fill-gold text-gold" />
                  ))}
                </div>
                <p className="text-white/70 text-sm leading-relaxed mb-6 italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-gold text-xs font-bold">{t.initials}</span>
                  </div>
                  <div>
                    <div className="text-white font-semibold text-sm">{t.name}</div>
                    <div className="text-white/40 text-xs">{t.detail}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-24 border-t border-white/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="relative rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-gold/20 via-gold/5 to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,168,76,0.12)_0%,transparent_70%)]" />
            <div className="relative px-8 py-16 md:py-20 border border-gold/20 rounded-3xl">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                Ready to make your move?
              </h2>
              <p className="text-white/60 text-lg mb-10 max-w-xl mx-auto">
                Join hundreds of Australian players who have used AUS Connect to land their college opportunity.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register" className="btn-primary px-8 py-4 text-base group">
                  Sign Up as a Player
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/register" className="btn-outline px-8 py-4 text-base group">
                  Sign Up as a Coach
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
