"use client";

import { Mail, MessageCircle } from "lucide-react";

export type AuthMethod = "whatsapp" | "email";

/** Switch between WhatsApp OTP and email + password. */
export default function AuthMethodTabs({ value, onChange }: { value: AuthMethod; onChange: (method: AuthMethod) => void }) {
  const tabs: { key: AuthMethod; label: string; icon: React.ReactNode }[] = [
    { key: "whatsapp", label: "WhatsApp OTP", icon: <MessageCircle className="h-4 w-4" /> },
    { key: "email", label: "Email & password", icon: <Mail className="h-4 w-4" /> },
  ];
  return (
    <div role="tablist" aria-label="Sign-in method" className="mb-6 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          role="tab"
          aria-selected={value === tab.key}
          onClick={() => onChange(tab.key)}
          className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
            value === tab.key ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );
}
