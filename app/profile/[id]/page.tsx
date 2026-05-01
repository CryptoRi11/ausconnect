import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ProfilePage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-navy">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        <div className="card p-8 md:p-12 text-center">
          <div className="w-24 h-24 rounded-full bg-gold/20 border-2 border-gold/40 flex items-center justify-center mx-auto mb-6">
            <span className="text-gold font-black text-2xl">?</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Profile #{params.id}</h1>
          <p className="text-white/50">
            Full profile view will be available once authentication and database are connected.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
