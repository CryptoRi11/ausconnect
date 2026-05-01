import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Search, SlidersHorizontal } from "lucide-react";

export const metadata = {
  title: "Coach Directory | AUS Connect",
  description: "Browse verified US college coaches seeking Australian basketball talent.",
};

export default function CoachesDirectoryPage() {
  return (
    <div className="min-h-screen bg-navy">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        <div className="mb-10">
          <div className="inline-flex items-center gap-1.5 text-gold text-xs font-semibold tracking-widest uppercase mb-4">
            <span className="w-5 h-px bg-gold/60" />
            Coach Directory
          </div>
          <h1 className="text-4xl font-bold text-white">US College Coaches</h1>
          <p className="text-white/50 mt-2">Connect with verified coaches from programs across the United States</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
            <input
              type="text"
              placeholder="Search by university, division, or state..."
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-gold/50 transition-all"
            />
          </div>
          <button className="btn-outline flex items-center gap-2 px-5">
            <SlidersHorizontal size={16} />
            Filters
          </button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-xl bg-white/10 flex-shrink-0" />
                <div className="flex-1">
                  <div className="h-4 bg-white/10 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-white/5 rounded w-1/2" />
                </div>
              </div>
              <div className="flex gap-2">
                <div className="h-6 bg-white/5 rounded-full w-16" />
                <div className="h-6 bg-white/5 rounded-full w-12" />
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-white/30 text-sm mt-12">
          Coach profiles will appear here once authentication is connected.
        </p>
      </div>
      <Footer />
    </div>
  );
}
