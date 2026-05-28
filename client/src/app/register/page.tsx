"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { EnterpriseInput, FormField } from "@/components/forms/EnterpriseForm";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    try {
      setLoading(true);
      await register({
        name: String(formData.get("name")),
        email: String(formData.get("email")),
        password: String(formData.get("password")),
        phone: String(formData.get("phone") || ""),
      });
      showToast({ type: "success", title: "Seller account created", message: "You can list your first property now." });
      router.push("/list-property");
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
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent-500">Seller Registration</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900">Create your seller account</h1>
          <p className="mt-2 text-sm text-slate-600">Start publishing verified commercial listings on CredXP.</p>
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
          <FormField label="Password" helper="Use at least 8 characters.">
            <EnterpriseInput name="password" type="password" placeholder="Minimum 8 characters" required minLength={8} />
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
