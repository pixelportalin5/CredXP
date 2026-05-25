"use client";

import { useState, useCallback } from "react";
import { Send, CheckCircle2, Phone, MessageCircle } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { siteConfig } from "@/config/site";

/* ============================================================
   PropertyEnquiryForm — Lead Capture for Property Detail
   ============================================================ */

interface PropertyEnquiryFormProps {
  propertyTitle: string;
  propertyId: string;
}

export default function PropertyEnquiryForm({ propertyTitle, propertyId }: PropertyEnquiryFormProps) {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setLoading(true);
      // Simulated submission — will connect to lead API
      setTimeout(() => {
        setLoading(false);
        setFormSubmitted(true);
        setTimeout(() => setFormSubmitted(false), 5000);
      }, 1000);
    },
    []
  );

  return (
    <Card padding="md" className="border-slate-200 shadow-sm">
      <h3 className="mb-1 text-base font-semibold text-slate-900">
        Enquire About This Property
      </h3>
      <p className="mb-5 text-xs text-slate-500">
        Our advisors will get back to you within 2 hours.
      </p>

      {formSubmitted ? (
        <div className="flex flex-col items-center gap-2 py-8 text-center animate-fade-in">
          <CheckCircle2 className="h-12 w-12 text-emerald-400" />
          <p className="font-semibold text-emerald-300">Enquiry Submitted!</p>
          <p className="text-xs text-slate-500">
            We&apos;ll connect you with the right advisor shortly.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            type="text"
            placeholder="Your Name"
            required
            id={`enquiry-name-${propertyId}`}
          />
          <Input
            type="email"
            placeholder="Email Address"
            required
            id={`enquiry-email-${propertyId}`}
          />
          <Input
            type="tel"
            placeholder="Phone Number"
            id={`enquiry-phone-${propertyId}`}
          />
          <textarea
            placeholder="I'm interested in this property..."
            rows={3}
            className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all hover:border-slate-300 focus:border-accent-500/50 focus:ring-1 focus:ring-accent-500/15"
            id={`enquiry-message-${propertyId}`}
          />
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
            icon={<Send className="h-4 w-4" />}
          >
            Send Enquiry
          </Button>
        </form>
      )}

      {/* Quick Contact Options */}
      <div className="mt-4 flex gap-2 border-t border-slate-200 pt-4">
        <a
          href={`tel:${siteConfig.contact.phone}`}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 py-2.5 text-xs font-medium text-slate-700 transition-colors hover:bg-white hover:text-slate-900"
        >
          <Phone className="h-3.5 w-3.5" />
          Call Now
        </a>
        <a
          href={`https://wa.me/${siteConfig.contact.whatsapp}?text=Hi, I'm interested in: ${encodeURIComponent(propertyTitle)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 py-2.5 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-500/15"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          WhatsApp
        </a>
      </div>
    </Card>
  );
}
