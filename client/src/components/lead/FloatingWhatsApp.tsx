"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { MessageCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/config/site";

export default function FloatingWhatsApp() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || pathname.startsWith("/admin")) {
    return null;
  }

  return createPortal(
    <a
      href={`https://wa.me/${siteConfig.contact.whatsapp}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="whatsapp-pulse pointer-events-auto fixed right-6 bottom-[max(1.5rem,env(safe-area-inset-bottom))] z-[var(--z-toast)] flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-[#25D366]/30 transition-transform active:scale-[0.97] hover:scale-105"
    >
      <MessageCircle className="h-7 w-7" />
    </a>,
    document.body
  );
}
