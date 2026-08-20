import { Container } from "@/components/ui/Container";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | CredXP",
  description:
    "Learn how CredXp collects, uses, and protects your personal data across our website and digital marketing campaigns.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-white">
      <Container size="md" className="py-16 lg:py-20">
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-3 text-sm text-gray-500">Effective Date: July 4, 2026</p>
        <p className="text-sm text-gray-500">Last Updated: July 4, 2026</p>

        <div className="mt-10 space-y-6 text-base leading-relaxed text-gray-800">
          <p>
            Welcome to CredXp (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;). We respect your privacy
            and are committed to protecting the personal data you share with us. This Privacy Policy outlines how we
            collect, use, process, disclose, and safeguard your information when you visit our landing pages,
            websites, or interact with our digital marketing campaigns (including Google Search, Google Display,
            Meta Facebook, and Instagram advertisements).
          </p>
          <p>
            By accessing our website, filling out our lead forms, or engaging with our digital services, you
            explicitly consent to the collection, processing, and storage of your information as described in this
            policy.
          </p>

          <h2 className="pt-4 text-xl font-semibold text-gray-900">1. Information We Collect</h2>
          <p>
            We collect both information you actively provide to us and data that is automatically collected through
            your device&apos;s interaction with our platform.
          </p>

          <h3 className="text-lg font-semibold text-gray-900">A. Information You Voluntarily Provide</h3>
          <p>
            When you interact with our high-conversion lead capture forms, request a callback, or download property
            brochures for commercial real estate investments, we collect:
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <span className="font-semibold text-gray-900">Identity Data:</span> Full Name, title, and professional
              designation.
            </li>
            <li>
              <span className="font-semibold text-gray-900">Contact Data:</span> Mobile/Phone Number and Email
              Address.
            </li>
            <li>
              <span className="font-semibold text-gray-900">Qualification Data:</span> Your preferred investment
              timeline (e.g., immediate, 1–3 months), your explicit investment budget brackets (e.g., ₹50 Lakhs to
              ₹1 Cr, ₹1 Cr+), and your property preferences (e.g., bare shell vs. furnished commercial office
              spaces).
            </li>
          </ul>

          <h3 className="text-lg font-semibold text-gray-900">B. Information Automatically Collected</h3>
          <p>
            To maintain a high-performance web experience and measure ad relevance, our servers and third-party
            tracking tools automatically collect:
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <span className="font-semibold text-gray-900">Technical Data:</span> Internet Protocol (IP) address,
              browser type and version, time zone settings, operating system, and platform.
            </li>
            <li>
              <span className="font-semibold text-gray-900">Usage Data:</span> Information about how you use our
              website, including the exact ad creative clicked, time spent on specific sections of the landing
              page, scroll depth, and form abandonment metrics.
            </li>
          </ul>

          <h2 className="pt-4 text-xl font-semibold text-gray-900">2. How We Use Your Information</h2>
          <p>
            We process your personal data under legitimate business interests, primarily to fulfill your requests
            for commercial real estate information and to optimize our marketing returns. Specifically, we use it
            for:
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <span className="font-semibold text-gray-900">Lead Management:</span> Automatically processing your
              inquiries and routing them directly to our internal Customer Relationship Management (CRM) system for
              immediate sales assignment and follow-up.
            </li>
            <li>
              <span className="font-semibold text-gray-900">Communication:</span> Sending customized ROI
              breakdowns, commercial project brochures, site-visit schedules, and updates via Email, Phone calls,
              SMS, or WhatsApp.
            </li>
            <li>
              <span className="font-semibold text-gray-900">Ad Optimization &amp; Retargeting:</span> Feeding
              conversion data back into Meta and Google algorithms to train our AI-driven custom ad sets, refine
              lookalike audiences, and serve highly relevant retargeting ads to interested prospects.
            </li>
            <li>
              <span className="font-semibold text-gray-900">A/B Testing:</span> Analyzing user interactions to
              improve page layout speeds, form response design, and visual aesthetics.
            </li>
          </ul>

          <h2 className="pt-4 text-xl font-semibold text-gray-900">3. Data Sharing and Third-Party Disclosures</h2>
          <p>
            CredXp does not sell, rent, lease, or trade your personal identification details to third-party data
            brokers. We share your information only with verified partners under strict data-processing agreements:
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <span className="font-semibold text-gray-900">CRM and Automation Platforms:</span> Secure
              infrastructure providers used to house and track your lead status.
            </li>
            <li>
              <span className="font-semibold text-gray-900">Digital Advertising Networks:</span> Meta Platforms Inc.
              and Google LLC to measure campaign performance via the Meta Conversion API and Google Tag Manager.
            </li>
            <li>
              <span className="font-semibold text-gray-900">Authorized Developers and Brokers:</span> Fulfilling
              your explicit requests for property inspections or investment execution at specific commercial
              corridors (e.g., SPR Gurgaon).
            </li>
            <li>
              <span className="font-semibold text-gray-900">Legal Compliance:</span> When required by law,
              regulatory bodies, or Real Estate Regulatory Authority (RERA) frameworks to prevent fraud or protect
              our legal rights.
            </li>
          </ul>

          <h2 className="pt-4 text-xl font-semibold text-gray-900">4. Cookies, Pixels, and Tracking Technologies</h2>
          <p>We use cookies, web beacons, and tracking pixels to deliver an exceptional user experience.</p>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <span className="font-semibold text-gray-900">Meta Pixel &amp; Conversions API:</span> Tracks actions
              taken on our landing pages (such as successful form submissions) to match user behavior with Meta ad
              profiles.
            </li>
            <li>
              <span className="font-semibold text-gray-900">Google Tag Manager &amp; Google Analytics:</span>
              {" "}Collects granular performance traffic data to ensure our landing page meets Google&rsquo;s core
              web vitals and speed optimization standards.
            </li>
          </ul>
          <p>
            You can choose to disable cookies through your browser settings; however, doing so may impact certain
            dynamic components and scroll animations on our site.
          </p>

          <h2 className="pt-4 text-xl font-semibold text-gray-900">5. Data Retention</h2>
          <p>
            We retain your personal data only for as long as necessary to fulfill the purposes for which it was
            collected, including satisfying any legal, accounting, or reporting requirements. For commercial real
            estate inquiries, lead profiles are securely archived within our CRM unless an explicit deletion
            request is submitted.
          </p>

          <h2 className="pt-4 text-xl font-semibold text-gray-900">6. Data Security</h2>
          <p>
            We implement robust administrative, technical, and physical security measures designed to protect your
            personal data from unauthorized access, alteration, disclosure, or accidental destruction. Our frontend
            next-generation framework (Next.js) prevents client-side database exposures, and all data transiting to
            our API endpoints is heavily encrypted using Secure Socket Layer (SSL) technology.
          </p>

          <h2 className="pt-4 text-xl font-semibold text-gray-900">7. Your Legal Rights</h2>
          <p>
            Depending on your geographic location and applicable local frameworks (including India&apos;s Digital
            Personal Data Protection Act), you have the right to:
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <span className="font-semibold text-gray-900">Request Access:</span> Obtain a copy of the personal
              data we hold about you.
            </li>
            <li>
              <span className="font-semibold text-gray-900">Request Correction:</span> Correct any incomplete or
              inaccurate data in our records.
            </li>
            <li>
              <span className="font-semibold text-gray-900">Request Erasure:</span> Ask us to delete or remove your
              personal data from our active marketing lists and CRM pipelines.
            </li>
            <li>
              <span className="font-semibold text-gray-900">Withdraw Consent:</span> Revoke your consent for data
              processing at any time.
            </li>
          </ul>

          <h2 className="pt-4 text-xl font-semibold text-gray-900">8. Changes to This Privacy Policy</h2>
          <p>
            We reserve the right to update or modify this Privacy Policy at any time to align with shifting digital
            marketing regulations or operational workflow updates. Any changes will be posted immediately on this
            URL with a revised &ldquo;Last Updated&rdquo; timestamp.
          </p>

          <h2 className="pt-4 text-xl font-semibold text-gray-900">9. Contact Our Privacy Team</h2>
          <p>
            If you have any questions regarding this policy, wish to opt-out of future communications, or want to
            exercise your data rights, please contact our data team directly:
          </p>
          <p>
            Email:{" "}
            <a href="mailto:sales@credxp.com" className="font-medium text-accent-600 hover:underline">
              sales@credxp.com
            </a>
          </p>
        </div>
      </Container>
    </div>
  );
}
