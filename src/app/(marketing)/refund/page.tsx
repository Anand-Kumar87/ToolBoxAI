import type { Metadata } from "next";
import Link from "next/link";
import { 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  CreditCard, 
  HelpCircle, 
  Mail, 
  ArrowLeft,
  ShieldCheck
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { 
  title: "Refund & Cancellation Policy | Korevante Studio",
  description: "Learn about our 7-day money-back guarantee, refund eligibility, cancellation process, and timelines.",
};

const REFUND_SECTIONS = [
  {
    id: "guarantee",
    title: "1. 7-Day Money-Back Guarantee",
    icon: ShieldCheck,
    content: (
      <>
        <p className="mb-3">
          At Korevante Studio, customer satisfaction is our top priority. We stand firmly behind the performance, speed, and accuracy of our 50+ integrated tools.
        </p>
        <p className="mb-3">
          If you upgrade to any paid tier (Starter, Pro Creator, or Enterprise) and determine that our platform does not suit your operational needs, you are eligible for a <strong>100% full refund</strong> within <strong>seven (7) calendar days</strong> of your initial billing transaction.
        </p>
        <p className="text-xs text-muted-foreground font-semibold">
          * Note: During the initial 7-day complimentary free trial, no charges are ever incurred. This refund policy applies directly to your first paid billing event.
        </p>
      </>
    ),
  },
  {
    id: "eligibility",
    title: "2. Eligibility Criteria",
    icon: CheckCircle2,
    content: (
      <>
        <p className="mb-3">
          To qualify for a prompt and seamless refund under our 7-day guarantee, your request must satisfy the following straightforward requirements:
        </p>
        <ul className="list-disc pl-5 space-y-2 mb-3">
          <li>The refund request is submitted within 7 calendar days from the exact timestamp of your initial successful transaction.</li>
          <li>Your account has not engaged in excessive automated API harvesting or abnormal tool consumption exceeding standard fair-usage thresholds.</li>
          <li>Your account has not violated our Acceptable Use Policy (e.g., generating abusive, illegal, or prohibited content).</li>
          <li>The request is for your first-ever billing cycle (subsequent recurring monthly renewals are non-refundable).</li>
        </ul>
      </>
    ),
  },
  {
    id: "non-refundable",
    title: "3. Non-Refundable Scenarios",
    icon: XCircle,
    content: (
      <>
        <p className="mb-3">
          Refunds will not be issued under the following circumstances:
        </p>
        <ul className="list-disc pl-5 space-y-2 mb-3">
          <li><strong>Requests past 7 days:</strong> Claims submitted after the 7-day window from the billing date cannot be processed.</li>
          <li><strong>Recurring Monthly Renewals:</strong> You are sent an automated email receipt upon each billing cycle. If you forget to cancel before a renewal, subsequent months are non-refundable; however, you can cancel immediately to prevent future charges.</li>
          <li><strong>Policy Infractions:</strong> Accounts suspended or terminated due to malicious attacks, scraping, reverse engineering, or terms violations forfeit all refund rights.</li>
          <li><strong>Partial Month Pro-rata:</strong> We do not issue partial refunds for unused days within an active monthly subscription cycle.</li>
        </ul>
      </>
    ),
  },
  {
    id: "process",
    title: "4. How to Submit a Refund Request",
    icon: Mail,
    content: (
      <>
        <p className="mb-3">
          Initiating a refund takes less than two minutes. Follow these simple steps:
        </p>
        <ol className="list-decimal pl-5 space-y-3 mb-4">
          <li>
            <strong>Send an Email:</strong> Contact our billing team at <a href="mailto:billing@korevante.com" className="text-primary font-bold hover:underline">billing@korevante.com</a> or <a href="mailto:support@korevante.com" className="text-primary font-bold hover:underline">support@korevante.com</a>.
          </li>
          <li>
            <strong>Include Order Credentials:</strong> Provide your registered account email address and your Razorpay Payment ID / Order ID (available in your email receipt or Dashboard &gt; Billing).
          </li>
          <li>
            <strong>Brief Feedback (Optional):</strong> Let us know why the platform was not a good fit. Your feedback directly shapes our upcoming product roadmap.
          </li>
        </ol>
        <div className="neu-pressed p-4 rounded-2xl text-sm">
          <strong>Review SLA:</strong> Our finance team reviews and approves all eligible refund requests within <strong>24 business hours</strong>.
        </div>
      </>
    ),
  },
  {
    id: "timeline",
    title: "5. Refund Processing Timelines",
    icon: Clock,
    content: (
      <>
        <p className="mb-3">
          Once your refund is approved by Korevante Studio, the funds are instantly remitted back to Razorpay for processing to your original payment instrument:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-4">
          <div className="neu-pressed p-4 rounded-2xl text-center">
            <p className="font-bold text-foreground text-sm">UPI (GPay/PhonePe)</p>
            <p className="text-xl font-black text-primary my-1">2 - 4 Hours</p>
            <p className="text-xs text-muted-foreground">Direct bank deposit</p>
          </div>
          <div className="neu-pressed p-4 rounded-2xl text-center">
            <p className="font-bold text-foreground text-sm">NetBanking</p>
            <p className="text-xl font-black text-primary my-1">2 - 3 Days</p>
            <p className="text-xs text-muted-foreground">Standard NEFT/IMPS</p>
          </div>
          <div className="neu-pressed p-4 rounded-2xl text-center">
            <p className="font-bold text-foreground text-sm">Credit / Debit Cards</p>
            <p className="text-xl font-black text-primary my-1">5 - 7 Days</p>
            <p className="text-xs text-muted-foreground">Card issuing bank timeline</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Depending on your issuing bank, the credit may appear on your statement as &quot;Razorpay Software&quot; or &quot;Korevante Studio&quot;.
        </p>
      </>
    ),
  },
  {
    id: "cancellation",
    title: "6. Cancelling Your Subscription Anytime",
    icon: RotateCcw,
    content: (
      <>
        <p className="mb-3">
          You are never locked into long-term contracts. You can cancel your subscription at any moment without contacting support:
        </p>
        <ul className="list-disc pl-5 space-y-2 mb-3">
          <li>Navigate to <strong>Dashboard &gt; Billing</strong> from your user workspace.</li>
          <li>Click the <strong>Manage Subscription</strong> or <strong>Cancel Plan</strong> option.</li>
          <li>Confirm cancellation. Your subscription will not renew, and no further charges will occur.</li>
          <li>You will continue to enjoy full access to your plan features until the end of your prepaid billing period.</li>
        </ul>
      </>
    ),
  },
];

export default function RefundPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <section className="pt-24 pb-14 md:pt-32 md:pb-16 text-center border-b border-border/20">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Badge variant="outline" className="mb-4 text-xs uppercase tracking-wider neu-convex px-4 py-1.5 border-0">
            <RotateCcw className="h-3.5 w-3.5 mr-1.5 text-emerald-500" /> Transparent Billing
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-foreground mb-4">
            Refund &amp; Cancellation Policy
          </h1>
          <p className="text-muted-foreground text-base max-w-2xl mx-auto font-medium">
            We believe in honest, fair, and transparent billing. Understand our 7-day money-back guarantee, refund workflows, and payout timelines.
          </p>
          <div className="mt-4 text-xs text-muted-foreground font-semibold">
            Last Updated: September 2026 • Razorpay Verified Merchant Terms
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {REFUND_SECTIONS.map((section) => {
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

          {/* Bottom CTA */}
          <div className="mt-12 text-center flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline">
              <ArrowLeft className="h-4 w-4" /> Back to Homepage
            </Link>
            <span className="hidden sm:inline text-muted-foreground">•</span>
            <Link href="/pricing" className="text-sm font-bold text-foreground hover:text-primary">
              View All Pricing Plans
            </Link>
            <span className="hidden sm:inline text-muted-foreground">•</span>
            <Link href="/contact" className="text-sm font-bold text-foreground hover:text-primary">
              Contact Billing Support
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
