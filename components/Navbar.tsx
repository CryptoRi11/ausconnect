"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/directory", label: "Directory" },
  { href: "/coaches", label: "Coaches" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/about", label: "About" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-navy/95 backdrop-blur-md border-b border-white/10 shadow-lg shadow-black/20"
          : "bg-transparent"
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div
              style={{
                width: 44, height: 44,
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
              <img src="/logo.png" alt="AUS Connect" style={{ height: 36, width: "auto" }} />
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="nav-link px-4 py-2 rounded-lg hover:bg-white/5">
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className="btn-ghost text-sm">
              Log in
            </Link>
            <Link href="/register" className="btn-primary text-sm">
              Get Started
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        className={cn(
          "md:hidden overflow-hidden transition-all duration-300 border-b border-white/10",
          isOpen ? "max-h-96 bg-navy/98 backdrop-blur-md" : "max-h-0"
        )}
      >
        <div className="px-4 py-4 flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="nav-link px-4 py-3 rounded-lg hover:bg-white/5 text-base"
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="divider my-2" />
          <Link href="/login" className="btn-ghost justify-start text-base" onClick={() => setIsOpen(false)}>
            Log in
          </Link>
          <Link href="/register" className="btn-primary mt-1" onClick={() => setIsOpen(false)}>
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
