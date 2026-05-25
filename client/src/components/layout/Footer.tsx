"use client";

import Link from "next/link";
import { Mail, Phone, ArrowRight } from "lucide-react";
import { siteConfig } from "@/config/site";
import { footerLinks } from "@/config/navigation";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

/* ============================================================
   Footer — Enterprise Footer with RERA & Trust Signals
   ============================================================ */

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-slate-200 bg-white">
      {/* Newsletter CTA Bar */}
      <div className="border-b border-slate-200 bg-slate-50">
        <Container className="flex flex-col items-center justify-between gap-4 py-6 sm:flex-row">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Subscribe to Newsletter
            </h3>
            <p className="text-xs text-slate-600">
              Stay updated with the latest CRE insights and opportunities.
            </p>
          </div>
          <form className="flex w-full max-w-sm gap-2 sm:w-auto" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-accent-500/50 focus:ring-1 focus:ring-accent-500/15"
              id="footer-newsletter-email"
            />
            <Button variant="primary" size="sm" iconRight={<ArrowRight className="h-3.5 w-3.5" />}>
              Subscribe
            </Button>
          </form>
        </Container>
      </div>

      {/* Main Footer Content */}
      <Container className="py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-6 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accent-500 text-xs font-black text-white shadow-sm shadow-accent-500/20">
                C
              </span>
              Cred<span className="text-accent-400">Xp</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-slate-600">
              {siteConfig.description.split("—")[0]}
            </p>

            {/* Contact Info */}
            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                <a href={`mailto:${siteConfig.contact.email}`} className="transition-colors hover:text-accent-400">
                  {siteConfig.contact.email}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-slate-400" />
                <a href={`tel:${siteConfig.contact.phone}`} className="transition-colors hover:text-accent-400">
                  {siteConfig.contact.phone}
                </a>
              </div>
            </div>

            {/* Social Links */}
            <div className="mt-4 flex gap-2">
              {[
                { href: siteConfig.social.linkedin, label: "Li" },
                { href: siteConfig.social.twitter, label: "X" },
                { href: siteConfig.social.instagram, label: "Ig" },
                { href: siteConfig.social.youtube, label: "Yt" },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-xs font-bold text-slate-500 transition-all hover:border-accent-500/30 hover:bg-accent-500/10 hover:text-accent-500"
                >
                  {social.label}
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-900">
              Explore
            </h4>
            <ul className="space-y-2 text-sm">
              {footerLinks.explore.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-slate-600 transition-colors hover:text-accent-500">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-900">
              Company
            </h4>
            <ul className="space-y-2 text-sm">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-slate-600 transition-colors hover:text-accent-500">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-900">
              Resources
            </h4>
            <ul className="space-y-2 text-sm">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-slate-600 transition-colors hover:text-accent-500">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-900">
              Help
            </h4>
            <ul className="space-y-2 text-sm">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-slate-600 transition-colors hover:text-accent-500">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>

      {/* Bottom Bar — RERA & Legal */}
      <div className="border-t border-slate-200">
        <Container className="flex flex-col items-center justify-between gap-3 py-5 text-xs text-slate-500 sm:flex-row">
          <p>
            © {currentYear} {siteConfig.legal.companyName}. All rights reserved.
          </p>
          <p className="text-slate-500">
            {siteConfig.legal.rera}
          </p>
        </Container>
      </div>
    </footer>
  );
}
