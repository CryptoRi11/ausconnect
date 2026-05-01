import Link from "next/link";
import { UserPlus, Search, MessageCircle, Trophy } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "How It Works | AUS Connect",
};

const steps = [
  {
    icon: UserPlus,
    step: "01",
    title: "Create Your Profile",
    body: "Sign up as a player or coach. Players build a comprehensive profile with stats, highlights, and academic info. Coaches set up their program details.",
  },
  {
    icon: Search,
    step: "02",
    title: "Get Discovered",
    body: "Our smart matching surfaces player profiles to coaches based on division fit, position needs, and academic requirements.",
  },
  {
    icon: MessageCircle,
    step: "03",
    title: "Connect Directly",
    body: "Coaches reach out directly — no agents, no middlemen. Players receive messages and can respond through the platform.",
  },
  {
    icon: Trophy,
    step: "04",
    title: "Land Your Opportunity",
    body: "Finalise your commitment and start your US college basketball journey. AUS Connect supports you at every step.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-navy">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">How AUS Connect Works</h1>
          <p className="text-white/50 text-lg">Four simple steps from profile to scholarship.</p>
        </div>

        <div className="space-y-6">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.step} className="card p-8 flex flex-col sm:flex-row gap-6 items-start">
                <div className="flex items-center gap-4 sm:flex-col sm:items-center sm:gap-2 flex-shrink-0">
                  <div className="w-14 h-14 rounded-2xl bg-gold/15 border border-gold/30 flex items-center justify-center">
                    <Icon className="text-gold" size={24} />
                  </div>
                  <span className="text-gold/40 font-black text-3xl">{step.step}</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white mb-2">{step.title}</h2>
                  <p className="text-white/60 leading-relaxed">{step.body}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-16">
          <Link href="/signup" className="btn-primary px-10 py-4 text-base">
            Get Started Today
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
