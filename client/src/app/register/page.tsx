"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { EnterpriseInput, EnterpriseSelect, FormField } from "@/components/forms/EnterpriseForm";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password"));
    const confirmPassword = String(formData.get("confirmPassword"));

    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match.");
      showToast({ type: "error", title: "Passwords do not match", message: "Please make sure both password fields are identical." });
      return;
    }

    setConfirmPasswordError("");

    try {
      setLoading(true);
      await register({
        name: String(formData.get("name")),
        email: String(formData.get("email")),
        password,
        phone: String(formData.get("phone") || ""),
        role: String(formData.get("role") || "buyer") as "buyer" | "seller",
      });
      const role = String(formData.get("role") || "buyer");
      showToast({
        type: "success",
        title: role === "seller" ? "Seller account created" : "Buyer account created",
        message: role === "seller" ? "You can list your first property now." : "You can now save properties and track enquiries.",
      });
      router.push(role === "seller" ? "/list-property" : "/user/dashboard");
    } catch (error) {
      showToast({ type: "error", title: "Registration failed", message: error instanceof Error ? error.message : "Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size="sm" className="py-12 lg:py-16">
      <Card padding="lg" className="border-slate-200 bg-white/95 shadow-[0_22px_60px_rgba(15,23,42,0.08)]">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent-500">Account Registration</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900">Create your CredXP account</h1>
          <p className="mt-2 text-sm text-slate-600">Choose buyer to save and enquire, or seller to publish verified commercial listings.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <FormField label="Full Name">
            <EnterpriseInput name="name" placeholder="Your name" required />
          </FormField>
          <FormField label="Email">
            <EnterpriseInput name="email" type="email" placeholder="seller@example.com" required />
          </FormField>
          <FormField label="Phone">
            <EnterpriseInput name="phone" type="tel" placeholder="+91 98765 43210" />
          </FormField>
          <FormField label="Account Type">
            <EnterpriseSelect
              name="role"
              required
              defaultValue="buyer"
              options={[
                { label: "Buyer", value: "buyer" },
                { label: "Seller", value: "seller" },
              ]}
            />
          </FormField>
          <FormField label="Password" helper="Use at least 8 characters.">
            <div className="relative">
              <EnterpriseInput
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Minimum 8 characters"
                required
                minLength={8}
                className="pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-700"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </FormField>
          <FormField label="Confirm Password">
            <div className="relative">
              <EnterpriseInput
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Re-enter your password"
                required
                minLength={8}
                className="pr-12"
                onChange={() => setConfirmPasswordError("")}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((current) => !current)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-700"
                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {confirmPasswordError && (
              <p className="mt-1.5 text-xs font-medium text-red-600">{confirmPasswordError}</p>
            )}
          </FormField>
          <Button type="submit" size="lg" fullWidth loading={loading} icon={<UserPlus className="h-4 w-4" />} className="h-13 shadow-lg shadow-accent-500/20">
            Register
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600">
          Already registered?{" "}
          <Link href="/login" className="font-semibold text-accent-500 hover:text-accent-600">
            Login
          </Link>
        </p>
      </Card>
    </Container>
  );
}
