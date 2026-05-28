"use client";

import { useState, useCallback } from "react";
import { Send, CheckCircle2, Phone, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EnterpriseInput, EnterpriseTextarea, FormField } from "@/components/forms/EnterpriseForm";
import { useToast } from "@/components/providers/ToastProvider";
import enquiryService from "@/services/enquiry.service";
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
  const { showToast } = useToast();

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);

      try {
        setLoading(true);
        await enquiryService.create({
          customerName: String(formData.get("customerName")),
          email: String(formData.get("email")),
          phone: String(formData.get("phone") || ""),
          message: String(formData.get("message") || ""),
          propertyId,
        });
        e.currentTarget.reset();
        setFormSubmitted(true);
        showToast({ type: "success", title: "Enquiry submitted", message: "The seller team will follow up shortly." });
        window.setTimeout(() => setFormSubmitted(false), 5000);
      } catch (error) {
        showToast({ type: "error", title: "Unable to submit enquiry", message: error instanceof Error ? error.message : "Please try again." });
      } finally {
        setLoading(false);
      }
    },
    [propertyId, showToast]
  );

  return (
    <Card padding="md" className="black-section-bg border-white/10 shadow-[0_18px_48px_rgba(15,23,42,0.16)]">
      <h3 className="mb-1 text-base font-semibold text-white">
        Enquire About This Property
      </h3>
      <p className="mb-5 text-xs text-white/58">
        Our advisors will get back to you within 2 hours.
      </p>

      {formSubmitted ? (
        <div className="flex flex-col items-center gap-2 py-8 text-center animate-fade-in">
          <CheckCircle2 className="h-12 w-12 text-emerald-400" />
          <p className="font-semibold text-emerald-300">Enquiry Submitted!</p>
          <p className="text-xs text-white/60">
            We&apos;ll connect you with the right advisor shortly.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Your Name" tone="dark">
            <EnterpriseInput tone="dark" type="text" name="customerName" placeholder="Your Name" required id={`enquiry-name-${propertyId}`} />
          </FormField>
          <FormField label="Email Address" tone="dark">
            <EnterpriseInput tone="dark" type="email" name="email" placeholder="Email Address" required id={`enquiry-email-${propertyId}`} />
          </FormField>
          <FormField label="Phone Number" tone="dark">
            <EnterpriseInput tone="dark" type="tel" name="phone" placeholder="Phone Number" id={`enquiry-phone-${propertyId}`} />
          </FormField>
          <FormField label="Message" tone="dark">
            <EnterpriseTextarea tone="dark" name="message" placeholder="I'm interested in this property..." rows={3} id={`enquiry-message-${propertyId}`} />
          </FormField>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
            icon={<Send className="h-4 w-4" />}
            className="h-13 shadow-lg shadow-accent-500/20"
          >
            Send Enquiry
          </Button>
        </form>
      )}

      {/* Quick Contact Options */}
      <div className="mt-5 flex gap-2 border-t border-white/10 pt-4">
        <a
          href={`tel:${siteConfig.contact.phone}`}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/8 py-2.5 text-xs font-medium text-white/82 transition-colors hover:bg-white/12 hover:text-white"
        >
          <Phone className="h-3.5 w-3.5" />
          Call Now
        </a>
        <a
          href={`https://wa.me/${siteConfig.contact.whatsapp}?text=Hi, I'm interested in: ${encodeURIComponent(propertyTitle)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/10 py-2.5 text-xs font-medium text-emerald-200 transition-colors hover:bg-emerald-400/15"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          WhatsApp
        </a>
      </div>
    </Card>
  );
}
