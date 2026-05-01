import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

export const metadata = {
  title: "About | AUS Connect",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-navy">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-1.5 text-gold text-xs font-semibold tracking-widest uppercase mb-4">
            <span className="w-5 h-px bg-gold/60" />
            Our Mission
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Built by Australians, <br />
            <span className="gradient-text">For Australian Athletes</span>
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto leading-relaxed">
            AUS Connect was founded to solve a real problem — elite Australian basketball talent going unnoticed by US college programs simply because of geography and access.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-16">
          <div className="card p-8">
            <h2 className="text-xl font-bold text-white mb-3">The Problem</h2>
            <p className="text-white/60 leading-relaxed text-sm">
              Australian basketball players possess world-class potential, but the pathway to US college programs has historically been limited to those with personal connections or expensive recruitment agents.
            </p>
          </div>
          <div className="card p-8">
            <h2 className="text-xl font-bold text-white mb-3">Our Solution</h2>
            <p className="text-white/60 leading-relaxed text-sm">
              AUS Connect levels the playing field by giving every Australian player — regardless of their club or budget — direct access to verified US college coaches from D1 through JUCO.
            </p>
          </div>
        </div>

        <div className="text-center">
          <Link href="/signup" className="btn-primary px-10 py-4 text-base">
            Join the Platform
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
