"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EnterpriseInput, EnterpriseSelect, EnterpriseTextarea, FormField } from "@/components/forms/EnterpriseForm";
import { useToast } from "@/components/providers/ToastProvider";
import contactService from "@/services/contact.service";

const enquiryTypeOptions = [
  { label: "Investment Advisory", value: "Investment Advisory" },
  { label: "Office Leasing", value: "Office Leasing" },
  { label: "Coworking", value: "Coworking" },
  { label: "Partnership", value: "Partnership" },
  { label: "General Enquiry", value: "General Enquiry" },
];

export default function ContactMessageForm() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const phone = String(formData.get("phone") || "");
    const email = String(formData.get("email") || "");

    if (!email.includes("@")) {
      showToast({ type: "error", title: "Invalid email", message: "Email must contain @." });
      return;
    }

    if (!/^\d{8,15}$/.test(phone)) {
      showToast({ type: "error", title: "Invalid phone", message: "Phone must contain only numbers and be 8 to 15 digits." });
      return;
    }

    try {
      setLoading(true);
      await contactService.create({
        fullName: String(formData.get("fullName") || ""),
        email,
        phone,
        company: String(formData.get("company") || ""),
        enquiryType: String(formData.get("enquiryType") || ""),
        message: String(formData.get("message") || ""),
      });
      form.reset();
      showToast({
        type: "success",
        title: "Message sent",
        message: "Your details were saved. Our team will contact you shortly.",
      });
    } catch (error) {
      showToast({
        type: "error",
        title: "Unable to send message",
        message: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField label="Full Name" tone="dark">
          <EnterpriseInput tone="dark" name="fullName" placeholder="Enter your full name here" required id="contact-name" />
        </FormField>
        <FormField label="Email" tone="dark">
          <EnterpriseInput tone="dark" name="email" type="email" placeholder="Enter your email here" required id="contact-email" />
        </FormField>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField label="Phone" tone="dark" helper="Numbers only, 8 to 15 digits.">
          <EnterpriseInput
            tone="dark"
            name="phone"
            type="tel"
            inputMode="numeric"
            pattern="[0-9]{8,15}"
            minLength={8}
            maxLength={15}
            placeholder="Enter your phone number here"
            required
            id="contact-phone"
            onInput={(event) => {
              event.currentTarget.value = event.currentTarget.value.replace(/\D/g, "").slice(0, 15);
            }}
          />
        </FormField>
        <FormField label="Company" tone="dark">
          <EnterpriseInput tone="dark" name="company" placeholder="Enter your company here" required id="contact-company" />
        </FormField>
      </div>
      <FormField label="Enquiry Type" tone="dark">
        <EnterpriseSelect
          tone="dark"
          id="contact-type"
          name="enquiryType"
          required
          placeholder="Select enquiry type"
          options={enquiryTypeOptions}
        />
      </FormField>
      <FormField label="Message" tone="dark">
        <EnterpriseTextarea
          tone="dark"
          name="message"
          rows={4}
          required
          placeholder="Enter your message here"
          id="contact-message"
        />
      </FormField>
      <Button
        type="submit"
        variant="primary"
        size="lg"
        icon={<Send className="h-4 w-4" />}
        loading={loading}
        className="h-13 px-7 shadow-lg shadow-accent-500/20"
      >
        Send Message
      </Button>
    </form>
  );
}
