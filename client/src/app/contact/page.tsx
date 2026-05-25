import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/config/site";
import {
  Mail, Phone, MapPin, Send, MessageCircle,
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
      <section className="border-b border-[var(--border-subtle)] bg-navy-900/40 py-16 lg:py-20">
        <Container>
          <Badge variant="accent" icon={<Mail className="h-3 w-3" />} className="mb-4">
            Get in Touch
          </Badge>
          <h1 className="text-3xl font-bold text-navy-50 sm:text-4xl">
            Contact Our CRE Experts
          </h1>
          <p className="mt-3 max-w-2xl text-navy-400">
            Whether you&apos;re looking to invest, lease, or explore flexible workspace options — our team is here to help.
          </p>
        </Container>
      </section>

      <section className="py-16 lg:py-20">
        <Container>
          <div className="grid gap-8 lg:grid-cols-5">
            {/* Contact Form */}
            <div className="lg:col-span-3">
              <Card padding="lg">
                <h2 className="mb-6 text-xl font-semibold text-navy-50">
                  Send Us a Message
                </h2>
                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input label="Full Name" placeholder="John Doe" required id="contact-name" />
                    <Input label="Email" type="email" placeholder="john@company.com" required id="contact-email" />
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input label="Phone" type="tel" placeholder="+91 98765 43210" id="contact-phone" />
                    <Input label="Company" placeholder="Your Company" id="contact-company" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-navy-400">
                      Enquiry Type
                    </label>
                    <select className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-input)] px-3.5 py-2.5 text-sm text-navy-200 outline-none transition-all hover:border-[var(--border-hover)] focus:border-[var(--border-focus)]" id="contact-type">
                      <option>Investment Advisory</option>
                      <option>Office Leasing</option>
                      <option>Coworking</option>
                      <option>Partnership</option>
                      <option>General Enquiry</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-navy-400">
                      Message
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Tell us about your requirements..."
                      className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-input)] px-3.5 py-2.5 text-sm text-navy-100 placeholder:text-navy-500 outline-none resize-none transition-all hover:border-[var(--border-hover)] focus:border-[var(--border-focus)] focus:ring-1 focus:ring-accent-500/20"
                      id="contact-message"
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    icon={<Send className="h-4 w-4" />}
                  >
                    Send Message
                  </Button>
                </form>
              </Card>
            </div>

            {/* Contact Info Sidebar */}
            <div className="lg:col-span-2 space-y-6">
              <Card padding="md">
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

              <Card padding="md">
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
