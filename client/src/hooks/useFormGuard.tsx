"use client";

import { useEffect, useRef } from "react";

/**
 * Bot protection for public forms. Bots fill the hidden "website" field and
 * submit within a second or two; the server drops those submissions quietly.
 */
export function useFormGuard() {
  const startedAt = useRef(0);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  /** Extra fields to send with the form: honeypot value and when the form was opened. */
  const guardFields = (formData: FormData) => ({
    _hp: String(formData.get("website") || ""),
    _t: startedAt.current || undefined,
  });

  /** Call after a successful submit so the next one is timed from now. */
  const restart = () => {
    startedAt.current = Date.now();
  };

  return { guardFields, restart };
}

/** Invisible to people and screen readers; bots that fill every input fill this too. */
export function HoneypotField() {
  return (
    <div aria-hidden="true" style={{ position: "absolute", left: "-10000px", top: "auto", width: 1, height: 1, overflow: "hidden" }}>
      <label>
        Website
        <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
      </label>
    </div>
  );
}
