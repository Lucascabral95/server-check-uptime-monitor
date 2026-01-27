"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Logo } from "./Logo";
import { NAV_LINKS } from "@/infraestructure/constants";

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <nav className={`landing-nav ${scrolled ? "scrolled" : ""}`}>
      <div className="nav-container">
        <Link href="/" className="nav-logo">
          <Logo />
        </Link>

        <ul className="nav-links">
          {NAV_LINKS.map(link => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={e => {
                  e.preventDefault();
                  scrollTo(link.href.slice(1));
                }}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="nav-cta">
          <Link href="/auth/login" className="btn btn-ghost btn-sm">
            Iniciar sesión
          </Link>
          <Link href="/auth/register" className="btn btn-primary btn-sm">
            Comenzar gratis
          </Link>
        </div>
      </div>
    </nav>
  );
};
