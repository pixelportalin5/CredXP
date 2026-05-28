import Link from "next/link";
import { ArrowRight, Clock, Mail } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";

interface PlaceholderPageProps {
  eyebrow: string;
  title: string;
  description: string;
}

export default function PlaceholderPage({ eyebrow, title, description }: PlaceholderPageProps) {
  return (
    <>
      <section className="blue-hero-bg border-b border-white/10 py-16 text-white lg:py-24">
        <Container size="lg" className="text-center">
          <Badge variant="accent" icon={<Clock className="h-3 w-3" />} className="mb-4">
            {eyebrow}
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
            {title}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/72">
            {description}
          </p>
        </Container>
      </section>

      <section className="bg-slate-50 py-16 lg:py-20">
        <Container size="md">
          <Card padding="lg" className="border-slate-200 bg-white text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-500/10 text-accent-500">
              <Clock className="h-7 w-7" />
            </div>
            <h2 className="text-2xl font-semibold text-slate-900">This page is coming soon</h2>
            <p className="mx-auto mt-3 max-w-xl leading-relaxed text-slate-600">
              We are preparing this section. For now, you can explore available properties or contact the CredXP team directly.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/properties">
                <Button size="md" iconRight={<ArrowRight className="h-4 w-4" />}>
                  Explore Properties
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="md" icon={<Mail className="h-4 w-4" />} className="border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50">
                  Contact Us
                </Button>
              </Link>
            </div>
          </Card>
        </Container>
      </section>
    </>
  );
}
