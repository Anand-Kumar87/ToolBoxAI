import type { Metadata } from "next";
import Link from "next/link";
import { FileText, CheckCircle2, AlertTriangle, CreditCard, ShieldCheck, Scale, RefreshCw, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { 
  title: "Terms & Conditions | ToolVerse AI",
  description: "Read the terms of service governing access to and usage of ToolVerse AI platform and tools.",
};

const TERMS_SECTIONS = [
  {
    id: "acceptance",
    title: "1. Acceptance of Terms & Eligibility",
    icon: CheckCircle2,
    content: (
      <>
        <p className="mb-3">
          By registering for an account, accessing, browsing, or utilizing any portion of the ToolVerse AI platform, application programming interfaces (APIs), or associated digital utilities (collectively, the &quot;Service&quot;), you enter into a legally binding agreement with ToolVerse AI (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;).
        </p>
        <p className="mb-3">
          To use the Service, you must be at least 18 years of age or possess legal parental/guardian consent, and have the legal capacity to enter into binding agreements. If you are accessing the Service on behalf of an enterprise or legal entity, you represent and warrant that you possess full authority to bind that entity to these Terms.
        </p>
      </>
    ),
  },
  {
    id: "account",
    title: "2. Account Security & Responsibilities",
    icon: ShieldCheck,
    content: (
      <>
        <p className="mb-3">
          When creating an account, you must provide accurate, current, and complete registration information. You are solely responsible for:
        </p>
        <ul className="list-disc pl-5 space-y-2 mb-3">
          <li>Maintaining the confidentiality of your account credentials and passwords.</li>
          <li>All activities, data transfers, and tool executions initiated through your account.</li>
          <li>Immediately notifying our security team at security@toolverse.ai if you suspect any unauthorized access or breach of security.</li>
        </ul>
        <p>
          We reserve the right to suspend or terminate accounts with false registration details or those compromised due to client credential negligence.
        </p>
      </>
    ),
  },
  {
    id: "acceptable-use",
    title: "3. Acceptable Use Policy & Prohibitions",
    icon: AlertTriangle,
    content: (
      <>
        <p className="mb-3">
          ToolVerse AI provides high-performance computing and generative tools intended for lawful creative, technical, and commercial endeavors. You agree NOT to use the platform to:
        </p>
        <ul className="list-disc pl-5 space-y-2 mb-3">
          <li>Generate, upload, process, or disseminate hate speech, harassment, sexually explicit content, non-consensual imagery, or material that promotes violence or self-harm.</li>
          <li>Engage in deceptive practices, including generating unauthorized deepfakes, phishing scams, spam campaigns, or malicious executable payloads.</li>
          <li>Reverse-engineer, decompile, disassemble, or attempt to derive the source code of our proprietary processing pipelines or client applications.</li>
          <li>Execute automated denial-of-service (DoS) attacks, brute-force requests, or exploit system rate limits beyond authorized plan capacities.</li>
          <li>Violate third-party copyrights, trademark rights, patents, or trade secret rights.</li>
        </ul>
        <p className="font-bold text-foreground">
          Violations of this Acceptable Use Policy will result in immediate termination of service without entitlement to refund.
        </p>
      </>
    ),
  },
  {
    id: "billing",
    title: "4. Subscription, Pricing & Payment Terms",
    icon: CreditCard,
    content: (
      <>
        <p className="mb-3">
          <strong>Pricing Structure:</strong> Subscriptions are billed in advance on a recurring monthly or annual basis as selected during checkout. The listed pricing includes all applicable platform taxes.
        </p>
        <p className="mb-3">
          <strong>Payment Gateway:</strong> All financial transactions are securely processed via Razorpay. By initiating a purchase, you authorize Razorpay to bill your designated payment instrument (UPI, Debit/Credit Card, NetBanking).
        </p>
        <p className="mb-3">
          <strong>Trial Period:</strong> New accounts receive an initial 7-day complimentary trial with no upfront payment requirement. Upon conclusion of the trial, access to premium tools requires an active paid tier.
        </p>
        <p>
          <strong>Cancellations:</strong> You can cancel your subscription at any time via Dashboard &gt; Billing. Upon cancellation, your account retains access to paid features until the expiration of the current billing cycle.
        </p>
      </>
    ),
  },
  {
    id: "ip",
    title: "5. Intellectual Property Rights & Licensing",
    icon: FileText,
    content: (
      <>
        <p className="mb-3">
          <strong>Your Content:</strong> You retain complete, unrestricted ownership of all inputs, source documents, raw images, videos, and texts you upload, as well as the resulting rendered outputs generated by our tools. You grant ToolVerse AI a worldwide, non-exclusive, royalty-free license solely to host, store, and process your content to the extent necessary to deliver the requested service.
        </p>
        <p>
          <strong>Our Platform:</strong> All platform interfaces, graphic designs, logos, software architectures, algorithms, and documentation are the exclusive property of ToolVerse AI and protected by applicable copyright and trademark laws.
        </p>
      </>
    ),
  },
  {
    id: "disclaimer",
    title: "6. Service Availability & Warranties",
    icon: RefreshCw,
    content: (
      <>
        <p className="mb-3">
          The Service is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis. While we strive to maintain a 99.9% uptime track record, we do not warrant that tool execution will be uninterrupted, error-free, or entirely bug-free during scheduled maintenance windows or upstream provider outages.
        </p>
        <p>
          AI-generated outputs (such as synthesized texts, summaries, code, or translated documents) should be reviewed for factual accuracy and context before relying on them for critical legal, medical, or production purposes.
        </p>
      </>
    ),
  },
  {
    id: "liability",
    title: "7. Limitation of Liability",
    icon: Scale,
    content: (
      <>
        <p className="mb-3">
          To the maximum extent permitted by applicable law, in no event shall ToolVerse AI, its officers, directors, employees, or affiliates be liable for any indirect, incidental, punitive, special, or consequential damages (including loss of profits, data corruption, or business interruption) arising out of or related to your use of the Service.
        </p>
        <p>
          Our aggregate cumulative liability for any and all claims arising under these Terms shall not exceed the total subscription fees actually paid by you to ToolVerse AI during the three (3) calendar months preceding the claim event.
        </p>
      </>
    ),
  },
  {
    id: "governing-law",
    title: "8. Governing Law & Dispute Resolution",
    icon: Scale,
    content: (
      <>
        <p className="mb-3">
          These Terms and Conditions shall be governed by and construed in accordance with the substantive laws of India, without giving effect to any principles of conflicts of law.
        </p>
        <p className="mb-3">
          Any legal dispute, controversy, or claim arising out of or relating to these Terms or breach thereof shall be subject to the exclusive jurisdiction of the competent courts situated in India.
        </p>
        <div className="neu-pressed p-4 rounded-2xl space-y-1 text-sm mt-4">
          <p><strong>Legal Inquiries:</strong> <a href="mailto:legal@toolverse.ai" className="text-primary hover:underline">legal@toolverse.ai</a></p>
          <p><strong>Official Correspondence:</strong> ToolVerse AI Technologies, Legal &amp; Compliance Cell, India</p>
        </div>
      </>
    ),
  },
];

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <section className="pt-24 pb-14 md:pt-32 md:pb-16 text-center border-b border-border/20">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Badge variant="outline" className="mb-4 text-xs uppercase tracking-wider neu-convex px-4 py-1.5 border-0">
            <Scale className="h-3.5 w-3.5 mr-1.5 text-primary" /> Legal Framework
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-foreground mb-4">
            Terms & Conditions
          </h1>
          <p className="text-muted-foreground text-base max-w-2xl mx-auto font-medium">
            Please review these terms carefully. They outline your rights, responsibilities, and licensing agreements when using ToolVerse AI.
          </p>
          <div className="mt-4 text-xs text-muted-foreground font-semibold">
            Last Updated: September 2026 • Effective Immediately
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {TERMS_SECTIONS.map((section) => {
              const Icon = section.icon;
              return (
                <div key={section.id} id={section.id} className="neu-flat rounded-[2rem] p-8 md:p-10">
                  <div className="flex items-center gap-3.5 mb-6 pb-4 border-b border-border/20">
                    <div className="h-12 w-12 rounded-2xl neu-convex flex items-center justify-center text-primary shrink-0">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-foreground">
                      {section.title}
                    </h2>
                  </div>
                  <div className="text-sm md:text-base text-muted-foreground leading-relaxed font-medium">
                    {section.content}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Back Button */}
          <div className="mt-12 text-center">
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline">
              <ArrowLeft className="h-4 w-4" /> Back to Homepage
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
