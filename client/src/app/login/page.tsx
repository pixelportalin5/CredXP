"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { EnterpriseInput, FormField } from "@/components/forms/EnterpriseForm";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    try {
      setLoading(true);
      await login(String(formData.get("email")), String(formData.get("password")));
      showToast({ type: "success", title: "Welcome back", message: "You are signed in as a seller." });
      router.push(searchParams.get("next") || "/seller/dashboard");
    } catch (error) {
      showToast({ type: "error", title: "Login failed", message: error instanceof Error ? error.message : "Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size="sm" className="py-12 lg:py-16">
      <Card padding="lg" className="border-slate-200 bg-white/95 shadow-[0_22px_60px_rgba(15,23,42,0.08)]">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent-500">Seller Login</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900">Access your seller workspace</h1>
          <p className="mt-2 text-sm text-slate-600">List properties, manage enquiries, and keep your listings up to date.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <FormField label="Email">
            <EnterpriseInput name="email" type="email" placeholder="seller@example.com" required />
          </FormField>
          <FormField label="Password">
            <EnterpriseInput name="password" type="password" placeholder="Minimum 8 characters" required minLength={8} />
          </FormField>
          <Button type="submit" size="lg" fullWidth loading={loading} icon={<LogIn className="h-4 w-4" />} className="h-13 shadow-lg shadow-accent-500/20">
            Login
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600">
          New to CredXP?{" "}
          <Link href="/register" className="font-semibold text-accent-500 hover:text-accent-600">
            Create seller account
          </Link>
        </p>
      </Card>
    </Container>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[40vh]" />}>
      <LoginContent />
    </Suspense>
  );
}
