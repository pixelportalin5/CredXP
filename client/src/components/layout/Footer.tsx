"use client";

import Image from "next/image";
import Link from "next/link";
import { Mail, Phone, ArrowRight } from "lucide-react";
import { siteConfig } from "@/config/site";
import { footerLinks } from "@/config/navigation";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { InstagramIcon, LinkedInIcon, XIcon, YouTubeIcon } from "@/components/layout/SocialIcons";

const socialLinks = [
  { href: siteConfig.social.linkedin, label: "LinkedIn", icon: LinkedInIcon },
  { href: siteConfig.social.twitter, label: "X", icon: XIcon },
  { href: siteConfig.social.instagram, label: "Instagram", icon: InstagramIcon },
  { href: siteConfig.social.youtube, label: "YouTube", icon: YouTubeIcon },
] as const;

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto">
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

      {/* Main Footer — enterprise gradient */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 enterprise-gradient" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(220,38,38,0.16),transparent_34%),radial-gradient(circle_at_right,rgba(59,130,246,0.12),transparent_30%)]" />

        <Container className="relative py-12">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-6 lg:gap-12">
            {/* Brand Column */}
            <div className="col-span-2">
              <Link href="/" className="inline-flex rounded-xl bg-white/95 px-3 py-1.5 shadow-sm">
                <Image
                  src="/logos/Credxp.webp"
                  alt="CredXP"
                  width={220}
                  height={62}
                  className="h-10 w-auto object-contain sm:h-11"
                />
              </Link>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/70">
                {siteConfig.description.split("—")[0]}
              </p>

              <div className="mt-4 space-y-2 text-sm text-white/75">
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-white/50" />
                  <a href={`mailto:${siteConfig.contact.email}`} className="transition-colors hover:text-white">
                    {siteConfig.contact.email}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-white/50" />
                  <a href={`tel:${siteConfig.contact.phone}`} className="transition-colors hover:text-white">
                    {siteConfig.contact.phone}
                  </a>
                </div>
              </div>

              <div className="mt-5 flex gap-2.5">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-all hover:border-white/40 hover:bg-white/20"
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  );
                })}
              </div>
            </div>

            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-white">
                Explore
              </h4>
              <ul className="space-y-2 text-sm">
                {footerLinks.explore.map((link) => (
                  <li key={link.href + link.label}>
                    <Link href={link.href} className="text-white/70 transition-colors hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-white">
                Company
              </h4>
              <ul className="space-y-2 text-sm">
                {footerLinks.company.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-white/70 transition-colors hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-white">
                Resources
              </h4>
              <ul className="space-y-2 text-sm">
                {footerLinks.resources.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-white/70 transition-colors hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-white">
                Help
              </h4>
              <ul className="space-y-2 text-sm">
                {footerLinks.legal.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-white/70 transition-colors hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>

        <div className="relative border-t border-white/10">
          <Container className="flex flex-col items-center justify-between gap-3 py-5 text-xs text-white/55 sm:flex-row">
            <p>
              © {currentYear} {siteConfig.legal.companyName}. All rights reserved.
            </p>
            <p>{siteConfig.legal.rera}</p>
          </Container>
        </div>
      </div>
    </footer>
  );
}
