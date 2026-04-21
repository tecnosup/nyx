"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { NAVIGATION, SITE_CONFIG } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
  }, [mobileOpen]);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          scrolled
            ? "bg-nyx-bg/90 backdrop-blur-md border-b border-nyx-line"
            : "bg-transparent"
        )}
      >
        <nav className="container-nyx flex items-center justify-between h-20">
          <Link href="/" className="font-serif text-2xl tracking-tight">
            {SITE_CONFIG.name}
          </Link>

          <ul className="hidden md:flex items-center gap-10">
            {NAVIGATION.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="label-mono link-underline text-nyx-ink hover:text-nyx-muted"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden text-nyx-ink"
            aria-label="Abrir menu"
          >
            <Menu size={24} />
          </button>
        </nav>
      </header>

      <div
        className={cn(
          "fixed inset-0 z-[60] bg-nyx-bg transition-transform duration-500 md:hidden",
          mobileOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="container-nyx flex items-center justify-between h-20">
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className="font-serif text-2xl tracking-tight"
          >
            {SITE_CONFIG.name}
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="text-nyx-ink"
            aria-label="Fechar menu"
          >
            <X size={24} />
          </button>
        </div>

        <ul className="container-nyx flex flex-col gap-8 pt-20">
          {NAVIGATION.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="font-serif text-4xl text-nyx-ink"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}