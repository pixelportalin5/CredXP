"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";
import authService from "@/services/auth.service";
import type { User } from "@/types/auth";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
const GSI_SRC = "https://accounts.google.com/gsi/client";

interface GoogleCredentialResponse {
  credential: string;
}

interface GoogleIdentity {
  accounts: {
    id: {
      initialize: (options: {
        client_id: string;
        callback: (response: GoogleCredentialResponse) => void;
        ux_mode?: "popup" | "redirect";
        auto_select?: boolean;
        cancel_on_tap_outside?: boolean;
        context?: "signin" | "signup" | "use";
      }) => void;
      renderButton: (element: HTMLElement, options: Record<string, unknown>) => void;
      prompt: () => void;
    };
  };
}

declare global {
  interface Window {
    google?: GoogleIdentity;
  }
}

let gsiPromise: Promise<void> | null = null;
function loadGoogleScript(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (!gsiPromise) {
    gsiPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = GSI_SRC;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => {
        gsiPromise = null;
        reject(new Error("Google sign-in couldn't load"));
      };
      document.head.appendChild(script);
    });
  }
  return gsiPromise;
}

interface GoogleSignInButtonProps {
  onSignedIn: (user: User, isNew: boolean) => void;
  /** Role for accounts created by this button. */
  role?: "buyer" | "seller";
  context?: "signin" | "signup";
}

/**
 * Google's own "Continue with Google" button: opens the account chooser,
 * people pick their Gmail account and are signed in.
 * Also shows Google One Tap on the page for returning visitors.
 */
export default function GoogleSignInButton({ onSignedIn, role = "buyer", context = "signin" }: GoogleSignInButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { startSession } = useAuth();
  const { showToast } = useToast();
  const [signingIn, setSigningIn] = useState(false);
  // Latest values for Google's callback, which is registered once.
  const latest = useRef({ onSignedIn, role, startSession, showToast });
  useEffect(() => {
    latest.current = { onSignedIn, role, startSession, showToast };
  });

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    let cancelled = false;

    loadGoogleScript()
      .then(() => {
        const google = window.google;
        if (cancelled || !google || !containerRef.current) return;
        google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          ux_mode: "popup",
          context,
          cancel_on_tap_outside: true,
          callback: async ({ credential }) => {
            const { onSignedIn: done, role: newRole, startSession: start, showToast: toast } = latest.current;
            setSigningIn(true);
            try {
              const { data } = await authService.googleSignIn({ credential, role: newRole });
              start(data.token, data.user);
              done(data.user, Boolean(data.isNew));
            } catch (error) {
              toast({ type: "error", title: "Google sign-in failed", message: error instanceof Error ? error.message : "Please try again." });
            } finally {
              setSigningIn(false);
            }
          },
        });
        const width = Math.min(400, containerRef.current.offsetWidth || 400);
        google.accounts.id.renderButton(containerRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          shape: "pill",
          text: context === "signup" ? "signup_with" : "continue_with",
          logo_alignment: "center",
          width,
        });
        google.accounts.id.prompt();
      })
      .catch(() => {
        if (!cancelled) latest.current.showToast({ type: "error", title: "Google sign-in couldn't load", message: "Please use WhatsApp or email instead." });
      });

    return () => {
      cancelled = true;
    };
  }, [context]);

  if (!GOOGLE_CLIENT_ID) return null;

  return (
    <div className="mb-6">
      <div ref={containerRef} className={`flex min-h-[44px] w-full justify-center ${signingIn ? "pointer-events-none opacity-60" : ""}`} />
      {signingIn && <p className="mt-2 text-center text-xs text-slate-500">Signing you in…</p>}
      <div className="mt-6 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
        <span className="h-px flex-1 bg-slate-200" />
        or
        <span className="h-px flex-1 bg-slate-200" />
      </div>
    </div>
  );
}
