"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, MessageCircle, ShieldCheck, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EnterpriseInput, EnterpriseSelect, FormField } from "@/components/forms/EnterpriseForm";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";
import authService from "@/services/auth.service";
import type { User } from "@/types/auth";

type Step = "phone" | "code" | "details";

interface WhatsAppOtpFormProps {
  /** Called once signed in. isNew is true for an account created just now. */
  onSignedIn: (user: User, isNew: boolean) => void;
  defaultRole?: "buyer" | "seller";
}

const errorMessage = (error: unknown) => (error instanceof Error ? error.message : "Please try again.");

/** Mobile number → 6-digit WhatsApp code → (new numbers) name and email. */
export default function WhatsAppOtpForm({ onSignedIn, defaultRole = "buyer" }: WhatsAppOtpFormProps) {
  const { startSession } = useAuth();
  const { showToast } = useToast();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [signupToken, setSignupToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendIn, setResendIn] = useState(0);

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = window.setTimeout(() => setResendIn((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [resendIn]);

  const sendCode = async () => {
    setLoading(true);
    try {
      const { data } = await authService.sendOtp(phone);
      setStep("code");
      setCode("");
      setResendIn(data.resendAfterSeconds || 30);
      showToast({ type: "success", title: "Code sent on WhatsApp", message: `Check WhatsApp on ${data.phone}.` });
    } catch (error) {
      showToast({ type: "error", title: "Couldn't send code", message: errorMessage(error) });
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    setLoading(true);
    try {
      const { data } = await authService.verifyOtp({ phone, code });
      if ("needsSignup" in data) {
        setSignupToken(data.signupToken);
        setStep("details");
        return;
      }
      startSession(data.token, data.user);
      onSignedIn(data.user, false);
    } catch (error) {
      showToast({ type: "error", title: "Verification failed", message: errorMessage(error) });
    } finally {
      setLoading(false);
    }
  };

  const completeSignup = async (formData: FormData) => {
    setLoading(true);
    try {
      const { data } = await authService.completeOtpSignup({
        signupToken,
        name: String(formData.get("name") || ""),
        email: String(formData.get("email") || ""),
        role: String(formData.get("role") || defaultRole) as "buyer" | "seller",
      });
      startSession(data.token, data.user);
      onSignedIn(data.user, true);
    } catch (error) {
      showToast({ type: "error", title: "Couldn't create account", message: errorMessage(error) });
      if (/verify your number again/i.test(errorMessage(error))) setStep("phone");
    } finally {
      setLoading(false);
    }
  };

  if (step === "phone") {
    return (
      <form
        className="space-y-5"
        onSubmit={(event) => {
          event.preventDefault();
          void sendCode();
        }}
      >
        <FormField label="Mobile number" helper="We'll send a 6-digit code on WhatsApp.">
          <div className="flex gap-2">
            <span className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-600">
              +91
            </span>
            <EnterpriseInput
              name="phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              placeholder="98765 43210"
              required
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="flex-1"
            />
          </div>
        </FormField>
        <Button type="submit" size="lg" fullWidth loading={loading} icon={<MessageCircle className="h-4 w-4" />} className="h-13 shadow-lg shadow-accent-500/20">
          Send code on WhatsApp
        </Button>
      </form>
    );
  }

  if (step === "code") {
    return (
      <form
        className="space-y-5"
        onSubmit={(event) => {
          event.preventDefault();
          void verifyCode();
        }}
      >
        <FormField label="Enter the 6-digit code" helper={`Sent on WhatsApp to +91 ${phone.replace(/\D/g, "").slice(-10)}. Valid for 5 minutes.`}>
          <EnterpriseInput
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="\d{6}"
            maxLength={6}
            placeholder="••••••"
            required
            autoFocus
            value={code}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
            className="text-center text-lg tracking-[0.5em]"
          />
        </FormField>
        <Button type="submit" size="lg" fullWidth loading={loading} disabled={code.length !== 6} icon={<ShieldCheck className="h-4 w-4" />} className="h-13 shadow-lg shadow-accent-500/20">
          Verify and continue
        </Button>
        <div className="flex items-center justify-between text-sm">
          <button type="button" onClick={() => setStep("phone")} className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800">
            <ArrowLeft className="h-3.5 w-3.5" /> Change number
          </button>
          <button
            type="button"
            disabled={resendIn > 0 || loading}
            onClick={() => void sendCode()}
            className="font-semibold text-accent-500 hover:text-accent-600 disabled:cursor-not-allowed disabled:text-slate-400"
          >
            {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend code"}
          </button>
        </div>
      </form>
    );
  }

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        void completeSignup(new FormData(event.currentTarget));
      }}
    >
      <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
        Number verified. A few details to create your account:
      </p>
      <FormField label="Full Name">
        <EnterpriseInput name="name" placeholder="Your name" required autoFocus />
      </FormField>
      <FormField label="Email">
        <EnterpriseInput name="email" type="email" placeholder="you@example.com" required />
      </FormField>
      <FormField label="Account Type">
        <EnterpriseSelect
          name="role"
          required
          defaultValue={defaultRole}
          options={[
            { label: "Buyer / Investor", value: "buyer" },
            { label: "Seller / Owner", value: "seller" },
          ]}
        />
      </FormField>
      <Button type="submit" size="lg" fullWidth loading={loading} icon={<UserPlus className="h-4 w-4" />} className="h-13 shadow-lg shadow-accent-500/20">
        Create account
      </Button>
    </form>
  );
}
