import { prisma } from "@/lib/prisma";

export interface UnifiedPlan {
  id: string; // Database ID or fallback ID
  name: string; // "BASIC" | "PRO" | "PREMIUM"
  title: string; // "Starter" | "Pro Creator" | "Enterprise"
  tagline: string;
  price: number; // Monthly price in INR (e.g. 150, 450, 1200)
  yearlyPrice: number; // Yearly discounted price per month (e.g. 120, 360, 960)
  popular: boolean;
  badge?: string;
  features: string[];
  notIncluded: string[];
  ctaText: string;
  href: string;
}

export const CANONICAL_PLANS: UnifiedPlan[] = [
  {
    id: "STARTER",
    name: "BASIC",
    title: "Starter",
    tagline: "Ideal for freelancers, hobbyists & casual creators.",
    price: 150,
    yearlyPrice: 120,
    popular: false,
    badge: "Most Affordable",
    features: [
      "20 AI Content Generation requests / day",
      "Full Image Studio (Crop, Resize, Filters)",
      "Standard PDF Utilities (Merge, Split, Convert)",
      "Basic Developer Tools (JSON, Base64, URL)",
      "Max file upload size: 25 MB",
      "Standard cloud processing speed",
      "Email support (24–48 hr response)",
    ],
    notIncluded: [
      "Neural 4x Image Upscaling",
      "Server-side Video & Audio Suite",
      "Background AI Job Queue priority",
      "Custom API Access",
    ],
    ctaText: "Start 7-Day Free Trial",
    href: "/signup?plan=starter",
  },
  {
    id: "PRO",
    name: "PRO",
    title: "Pro Creator",
    tagline: "Designed for content creators, agencies & power users.",
    price: 450,
    yearlyPrice: 360,
    popular: true,
    badge: "Most Popular",
    features: [
      "Unlimited AI Content Generation requests",
      "Full Image Studio + AI Background Removal",
      "Neural 4x Super-Resolution Image Upscaling",
      "Full Video & Audio Suite (Compress, Trim, Subtitles)",
      "Advanced PDF Document Engine (OCR, Compress)",
      "Developer Suite + API Key Support",
      "Max file upload size: 250 MB",
      "High-speed dedicated job processing",
      "Priority Live Chat Support",
    ],
    notIncluded: [
      "Custom dedicated server instance",
      "Dedicated Account Manager",
    ],
    ctaText: "Get Started with Pro",
    href: "/signup?plan=pro",
  },
  {
    id: "ENTERPRISE",
    name: "PREMIUM",
    title: "Enterprise",
    tagline: "For teams, studios & high-volume automated pipelines.",
    price: 1200,
    yearlyPrice: 960,
    popular: false,
    badge: "Unlimited Scale",
    features: [
      "Everything in Pro Creator included",
      "Unlimited batch processing for all 50+ tools",
      "4K Video Rendering & multi-gigabyte files",
      "Max file upload size: 2 GB per file",
      "Zero rate limits & dedicated worker queue",
      "REST API access for platform integration",
      "Multiple user seats (Up to 10 team members)",
      "Custom watermark & branding removal",
      "Dedicated account manager & 99.9% uptime SLA",
    ],
    notIncluded: [],
    ctaText: "Upgrade to Enterprise",
    href: "/signup?plan=enterprise",
  },
];

/**
 * Parses raw Prisma plan and its JSON metadata into UnifiedPlan
 */
export function parseDbPlan(dbPlan: any): UnifiedPlan {
  let metadata: any = {};
  try {
    if (dbPlan.features) {
      metadata = JSON.parse(dbPlan.features);
    }
  } catch (e) {
    metadata = {};
  }

  // Find fallback canonical for defaults
  const fallback = CANONICAL_PLANS.find(p => p.name === dbPlan.name) || CANONICAL_PLANS[0];

  const yearlyPrice = typeof metadata.yearlyPrice === "number" 
    ? metadata.yearlyPrice 
    : Math.round(dbPlan.price * 0.8);

  const rawName = (dbPlan.name || fallback.name).toLowerCase();
  const planSlug = rawName === "premium" ? "enterprise" : rawName === "basic" ? "starter" : rawName;

  return {
    id: dbPlan.id,
    name: dbPlan.name,
    title: dbPlan.title || fallback.title,
    tagline: dbPlan.description || fallback.tagline,
    price: dbPlan.price,
    yearlyPrice: yearlyPrice,
    popular: metadata.popular !== undefined ? Boolean(metadata.popular) : fallback.popular,
    badge: metadata.badge !== undefined ? metadata.badge : fallback.badge,
    features: Array.isArray(metadata.features) && metadata.features.length > 0 
      ? metadata.features 
      : fallback.features,
    notIncluded: Array.isArray(metadata.notIncluded) 
      ? metadata.notIncluded 
      : fallback.notIncluded,
    ctaText: metadata.ctaText || fallback.ctaText,
    href: `/signup?plan=${planSlug}`,
  };
}

/**
 * Fetch unified plans from database with canonical fallback
 */
export async function getUnifiedPlans(): Promise<UnifiedPlan[]> {
  try {
    const dbPlans = await prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { price: "asc" },
    });

    if (!dbPlans || dbPlans.length === 0) {
      return CANONICAL_PLANS;
    }

    return dbPlans.map(parseDbPlan);
  } catch (error) {
    console.error("[getUnifiedPlans] Error fetching from DB, using fallback:", error);
    return CANONICAL_PLANS;
  }
}
