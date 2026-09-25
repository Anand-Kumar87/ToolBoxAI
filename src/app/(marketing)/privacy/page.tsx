import type { Metadata } from "next";
import Link from "next/link";
import { Shield, Lock, Eye, Database, Globe, UserCheck, Mail, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { 
  title: "Privacy Policy | ToolVerse AI",
  description: "Learn how ToolVerse AI collects, protects, and handles your personal information and uploaded files.",
};

const SECTIONS = [
  {
    id: "collection",
    title: "1. Information We Collect",
    icon: Eye,
    content: (
      <>
        <p className="mb-3">
          We collect only the minimum necessary personal data required to provide and operate our platform services effectively:
        </p>
        <ul className="list-disc pl-5 space-y-2 mb-3">
          <li>
            <strong>Account Details:</strong> When you register, we collect your name, email address, and encrypted authentication credentials (passwords hashed using bcrypt). If you authenticate using Google OAuth, we receive your verified Google profile email and display name.
          </li>
          <li>
            <strong>Billing & Transaction Records:</strong> When you purchase or upgrade a subscription, our payment processor (Razorpay) collects payment instrument details. We store only transaction identifiers, order IDs, amount, and subscription renewal timestamps. Raw credit card numbers or UPI MPINs are never received or stored on our servers.
          </li>
          <li>
            <strong>Usage & Execution Logs:</strong> We monitor tool usage counts, execution timestamps, processing success/failure statuses, and IP addresses to prevent abuse, enforce tier quotas, and optimize cluster capacity.
          </li>
          <li>
            <strong>Uploaded Files & Input Data:</strong> Content, images, videos, or documents uploaded to our tools are handled strictly as transient processing workloads under your unique authenticated user identifier.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "use",
    title: "2. How We Use Your Data",
    icon: Database,
    content: (
      <>
        <p className="mb-3">
          ToolVerse AI adheres to a strict data-minimization philosophy. We use collected information exclusively to:
        </p>
        <ul className="list-disc pl-5 space-y-2 mb-3">
          <li>Deliver, execute, and render the outputs of our 50+ AI, Image, Video, PDF, and Developer tools.</li>
          <li>Manage user authentication sessions, role-based permissions, and 7-day trial eligibility.</li>
          <li>Process monthly subscription billing, invoice generation, and refund verifications via Razorpay.</li>
          <li>Communicate vital platform announcements, security alerts, and customer support resolutions.</li>
          <li>Detect and mitigate malicious activities, automated scraping, API flooding, and fraudulent chargebacks.</li>
        </ul>
        <p className="font-bold text-foreground">
          We do not sell, rent, monetize, or trade your personal information or uploaded assets to third-party data brokers or advertisers under any circumstances.
        </p>
      </>
    ),
  },
  {
    id: "ai-training",
    title: "3. AI Models & Content Ownership",
    icon: Lock,
    content: (
      <>
        <p className="mb-3">
          A fundamental principle of ToolVerse AI is that <strong>you retain 100% full intellectual property ownership</strong> of all files, text, images, code, and prompts you input into our tools, as well as the resulting generated outputs.
        </p>
        <p className="mb-3">
          <strong>No Training on Customer Data:</strong> We do NOT use your private inputs, uploaded documents, generated media, or proprietary scripts to train, fine-tune, or calibrate public AI foundation models. All third-party AI requests (such as OpenAI or Anthropic APIs) are dispatched via zero-retention enterprise API endpoints.
        </p>
      </>
    ),
  },
  {
    id: "storage",
    title: "4. File Storage, Security & Retention",
    icon: Shield,
    content: (
      <>
        <p className="mb-3">
          We employ multi-layered enterprise defense strategies to safeguard your data at all times:
        </p>
        <ul className="list-disc pl-5 space-y-2 mb-3">
          <li>
            <strong>Encryption in Transit & At Rest:</strong> All data transmissions between your browser and our servers are encrypted using TLS 1.3. Stored database records and cloud storage buckets are encrypted using AES-256 standards.
          </li>
          <li>
            <strong>Ephemeral Tool Processing:</strong> Temporary intermediate files generated during video rendering, PDF splitting, or image compression are automatically purged from server temp storage immediately following task completion.
          </li>
          <li>
            <strong>User-Controlled Deletion:</strong> You can delete any saved project, file, or asset from your workspace at any time. Account deletion triggers a complete permanent erasure of all associated database entries within 30 days.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "compliance",
    title: "5. Compliance & Your Legal Rights (GDPR & DPDP Act)",
    icon: Globe,
    content: (
      <>
        <p className="mb-3">
          Regardless of your jurisdiction, we uphold universal privacy standards adhering to the Digital Personal Data Protection (DPDP) Act of India and the EU General Data Protection Regulation (GDPR):
        </p>
        <ul className="list-disc pl-5 space-y-2 mb-3">
          <li><strong>Right to Access:</strong> You can request a copy of all personal data held in association with your profile.</li>
          <li><strong>Right to Rectification:</strong> You can update inaccurate profile information directly via Dashboard &gt; Profile.</li>
          <li><strong>Right to Erasure (&quot;Right to be Forgotten&quot;):</strong> You have the absolute right to have your entire account, usage logs, and billing references permanently deleted upon written request or via Settings.</li>
          <li><strong>Right to Data Portability:</strong> You can export your saved projects, files, and generation history in standard machine-readable formats.</li>
        </ul>
      </>
    ),
  },
  {
    id: "cookies",
    title: "6. Cookies & Tracking Technologies",
    icon: UserCheck,
    content: (
      <>
        <p className="mb-3">
          ToolVerse AI uses strictly necessary first-party cookies to manage active authentication tokens (NextAuth JWT session cookies) and store your interface preferences (such as Light/Dark mode state).
        </p>
        <p>
          We do NOT employ invasive cross-site tracking cookies, behavioral tracking pixels, or third-party fingerprinting scripts.
        </p>
      </>
    ),
  },
  {
    id: "contact",
    title: "7. Contact Our Data Protection Team",
    icon: Mail,
    content: (
      <>
        <p className="mb-3">
          If you have questions, feedback, or requests regarding this Privacy Policy or your data rights, please contact our dedicated Data Protection Officer:
        </p>
        <div className="neu-pressed p-4 rounded-2xl space-y-1 text-sm">
          <p><strong>Email:</strong> <a href="mailto:privacy@toolverse.ai" className="text-primary hover:underline">privacy@toolverse.ai</a></p>
          <p><strong>Support Desk:</strong> <Link href="/contact" className="text-primary hover:underline">toolverse.ai/contact</Link></p>
          <p><strong>Response SLA:</strong> We respond to all formal data inquiries within 48 business hours.</p>
        </div>
      </>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <section className="pt-24 pb-14 md:pt-32 md:pb-16 text-center border-b border-border/20">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Badge variant="outline" className="mb-4 text-xs uppercase tracking-wider neu-convex px-4 py-1.5 border-0">
            <Shield className="h-3.5 w-3.5 mr-1.5 text-emerald-500" /> Trust & Compliance
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-foreground mb-4">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground text-base max-w-2xl mx-auto font-medium">
            Your trust is our highest priority. Learn how we respect your privacy, secure your intellectual property, and handle your information.
          </p>
          <div className="mt-4 text-xs text-muted-foreground font-semibold">
            Effective Date: September 2026 • Version 2.4 (Enterprise Edition)
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {SECTIONS.map((section) => {
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

          {/* Bottom Callout */}
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
