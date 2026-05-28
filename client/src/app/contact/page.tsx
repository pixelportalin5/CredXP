import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import ContactMessageForm from "@/components/contact/ContactMessageForm";
import { siteConfig } from "@/config/site";
import {
  Mail, Phone, MapPin, MessageCircle,
  Clock, Shield, Users,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us – Get Expert CRE Guidance",
  description:
    "Connect with CredXP's commercial real estate experts for personalized investment advice, leasing support, and coworking solutions.",
};

export default function ContactPage() {
  return (
    <>
      <section className="blue-hero-bg border-b border-white/10 py-16 text-white lg:py-20">
        <Container>
          <Badge variant="accent" icon={<Mail className="h-3 w-3" />} className="mb-4">
            Get in Touch
          </Badge>
          <h1 className="text-3xl font-bold text-white sm:text-4xl">
            Contact Our CRE Experts
          </h1>
          <p className="mt-3 max-w-2xl text-white/72">
            Whether you&apos;re looking to invest, lease, or explore flexible workspace options — our team is here to help.
          </p>
        </Container>
      </section>

      <section className="bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.10),transparent_32%),linear-gradient(180deg,#f8fbff_0%,#eef5ff_100%)] py-16 lg:py-20">
        <Container>
          <div className="grid gap-8 lg:grid-cols-5">
            {/* Contact Form */}
            <div className="lg:col-span-3">
              <Card padding="lg" className="black-section-bg border-white/10 shadow-[0_22px_60px_rgba(15,23,42,0.16)]">
                <h2 className="mb-6 text-xl font-semibold text-white">
                  Send Us a Message
                </h2>
                <ContactMessageForm />
              </Card>
            </div>

            {/* Contact Info Sidebar */}
            <div className="lg:col-span-2 space-y-6">
              <Card padding="md" className="border-blue-100/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(240,247,255,0.94))] shadow-sm">
                <h3 className="mb-4 text-base font-semibold text-navy-50">Contact Information</h3>
                <div className="space-y-4 text-sm">
                  <div className="flex items-start gap-3 text-navy-400">
                    <Mail className="mt-0.5 h-4 w-4 shrink-0 text-accent-400" />
                    <div>
                      <p className="font-medium text-navy-200">Email</p>
                      <a href={`mailto:${siteConfig.contact.email}`} className="hover:text-accent-400 transition-colors">
                        {siteConfig.contact.email}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 text-navy-400">
                    <Phone className="mt-0.5 h-4 w-4 shrink-0 text-accent-400" />
                    <div>
                      <p className="font-medium text-navy-200">Phone</p>
                      <a href={`tel:${siteConfig.contact.phone}`} className="hover:text-accent-400 transition-colors">
                        {siteConfig.contact.phone}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 text-navy-400">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent-400" />
                    <div>
                      <p className="font-medium text-navy-200">Office</p>
                      <p>{siteConfig.contact.address}</p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card padding="md" className="border-blue-100/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(240,247,255,0.94))] shadow-sm">
                <h3 className="mb-4 text-base font-semibold text-navy-50">Why CredXP?</h3>
                <div className="space-y-3">
                  {[
                    { icon: <Clock className="h-4 w-4" />, text: "Response within 2 hours" },
                    { icon: <Shield className="h-4 w-4" />, text: "RERA verified properties" },
                    { icon: <Users className="h-4 w-4" />, text: "Dedicated relationship manager" },
                  ].map((item) => (
                    <div key={item.text} className="flex items-center gap-3 text-sm text-navy-300">
                      <span className="text-accent-400">{item.icon}</span>
                      {item.text}
                    </div>
                  ))}
                </div>
              </Card>

              <a
                href={`https://wa.me/${siteConfig.contact.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button variant="outline" size="lg" fullWidth icon={<MessageCircle className="h-4 w-4" />}>
                  Chat on WhatsApp
                </Button>
              </a>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
