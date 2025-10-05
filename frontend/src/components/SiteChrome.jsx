import React, { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { Mail, FileDown, ArrowRight } from "lucide-react";
import { site } from "../mock/mock";

export const Header = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-colors duration-300 ${
        scrolled
          ? "bg-black/50 backdrop-blur-xl border-b border-[var(--border-light)]"
          : "bg-transparent"
      }`}
    >
      <div className="container flex items-center justify-between h-16">
        <a href="#home" className="nav-link font-semibold tracking-tight">
          <span className="text-[var(--text-primary)]">Benjamin</span>
          <span className="text-[var(--text-secondary)]"> Schwarz</span>
        </a>
        <nav className="hidden md:flex items-center gap-1">
          <a href="#about" className="nav-link">About</a>
          <a href="#services" className="nav-link">Services</a>
          <a href="#approach" className="nav-link">Method</a>
          <a href="#experience" className="nav-link">Experience</a>
          <a href="#cases" className="nav-link">Case Studies</a>
          <a href="#contact" className="nav-link">Contact</a>
        </nav>
        <div className="flex items-center gap-2">
          <a href={`mailto:${site.email}`} className="hidden sm:inline-flex">
            <Button className="btn-secondary btn-hover-scale" asChild>
              <span className="inline-flex items-center gap-2">
                <Mail size={16} /> Email
              </span>
            </Button>
          </a>
          <a href={site.cvUrl} target="_blank" rel="noreferrer" className="hidden lg:inline-flex">
            <Button className="btn-secondary btn-hover-scale" asChild>
              <span className="inline-flex items-center gap-2">
                <FileDown size={16} /> Download CV
              </span>
            </Button>
          </a>
          <a href="#contact">
            <Button className="btn-primary btn-hover-scale" asChild>
              <span className="inline-flex items-center gap-2">
                {site.stickyCtaText} <ArrowRight size={16} />
              </span>
            </Button>
          </a>
        </div>
      </div>
    </header>
  );
};

export const Footer = () => {
  return (
    <footer className="border-t border-[var(--border-light)] py-10 mt-20">
      <div className="container flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <p className="caption">© 2025 {site.name} — Process & Polymer Consulting</p>
          <p className="caption opacity-70">Privacy & Terms</p>
        </div>
        <div className="flex items-center gap-4">
          <a href={`mailto:${site.email}`} className="link-text">{site.email}</a>
          <a href={site.cvUrl} target="_blank" rel="noreferrer" className="link-text">Download CV</a>
        </div>
      </div>
    </footer>
  );
};