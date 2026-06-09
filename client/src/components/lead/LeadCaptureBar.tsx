import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ArrowRight, MessageCircle } from "lucide-react";
import Link from "next/link";
import { siteConfig } from "@/config/site";

/* ============================================================
   LeadCaptureBar — Premium CTA Banner
   ============================================================ */

interface LeadCaptureBarProps {
  title?: string;
  subtitle?: string;
  variant?: "default" | "compact";
}

export default function LeadCaptureBar({
  title = "Let's Help You Find the Right Space or Investment",
  subtitle = "Connect with our experts for personalized assistance.",
  variant = "default",
}: LeadCaptureBarProps) {
  return (
    <section className="relative overflow-hidden border-y border-slate-200 bg-white">
      <div className="absolute inset-0 enterprise-gradient" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(220,38,38,0.16),transparent_34%),radial-gradient(circle_at_right,rgba(59,130,246,0.12),transparent_30%)]" />

      <Container
        className={`relative flex flex-col items-center justify-between gap-6 sm:flex-row ${variant === "compact" ? "py-6" : "py-10"
          }`}
      >
        <div>
          <h2 className="text-xl font-bold text-white sm:text-2xl">
            {title}
          </h2>
          <p className="mt-1 text-sm text-white/70">{subtitle}</p>
        </div>

        <div className="flex gap-3">
          <Link href="/contact">
            <Button variant="primary" size="lg" iconRight={<ArrowRight className="h-4 w-4" />}>
              Connect Now
            </Button>
          </Link>
          <a
            href={`https://wa.me/${siteConfig.contact.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="lg" className="border-white/20 bg-white/5 text-white hover:bg-white/10" icon={<MessageCircle className="h-4 w-4" />}>
              WhatsApp
            </Button>
          </a>
        </div>
      </Container>
    </section>
  );
}
