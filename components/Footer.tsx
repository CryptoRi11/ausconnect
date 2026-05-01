import Link from "next/link";

const footerLinks = {
  Platform: [
    { label: "How It Works", href: "/how-it-works" },
    { label: "Player Directory", href: "/players" },
    { label: "Coach Directory", href: "/coaches" },
    { label: "Pricing", href: "/pricing" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Careers", href: "/careers" },
    { label: "Contact", href: "/contact" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-navy border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div
                style={{
                  width: 48, height: 48,
                  borderRadius: "50%",
                  background: "#fff",
                  border: "2px solid #C9A84C",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.png" alt="AUS Connect" style={{ height: 38, width: "auto" }} />
              </div>
            </div>
            <p className="text-white/50 text-sm leading-relaxed max-w-xs">
              Bridging elite Australian basketball talent with Division I, II, and III college programs across the United States.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-white font-semibold text-sm tracking-wide mb-4">{category}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-white/50 hover:text-white text-sm transition-colors duration-200">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="divider mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-sm">
            © {new Date().getFullYear()} AUS Connect. All rights reserved.
          </p>
          <p className="text-white/30 text-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Platform operational
          </p>
        </div>
      </div>
    </footer>
  );
}
