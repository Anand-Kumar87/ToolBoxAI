import { prisma } from "@/lib/prisma";
import { SUBSCRIPTION_PLANS } from "@/config/plans";
import { TOOLS_REGISTRY } from "@/config/tools";
import { PlanTier, TrialStatus } from "@/types";

export interface AccessCheckResult {
  allowed: boolean;
  reason?: string;
  plan: PlanTier | "TRIAL" | "NONE";
  trialDaysRemaining?: number;
}

/**
 * Server-side evaluation of trial validity
 */
export function evaluateTrial(trial: {
  trialStartDate: Date;
  trialEndDate: Date;
  trialStatus: TrialStatus;
} | null): { isActive: boolean; daysRemaining: number } {
  if (!trial) return { isActive: false, daysRemaining: 0 };

  const now = new Date();
  const endDate = new Date(trial.trialEndDate);
  const diffMs = endDate.getTime() - now.getTime();
  const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

  const isActive = trial.trialStatus === "ACTIVE" && diffMs > 0;

  return { isActive, daysRemaining };
}

/**
 * Centralized server-side usage and subscription gatekeeper
 */
export async function checkUserAccessAndLimits(
  userId: string,
  toolSlug: string
): Promise<AccessCheckResult> {
  const tool = TOOLS_REGISTRY.find((t) => t.slug === toolSlug);
  if (!tool) {
    return { allowed: false, reason: "Tool not found", plan: "NONE" };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      subscriptions: {
        where: { status: "ACTIVE" },
        include: { plan: true },
        take: 1,
      },
      trial: true,
    },
  });

  if (!user) {
    return { allowed: false, reason: "User not found", plan: "NONE" };
  }


  // Admins always have access
  if (user.role === "ADMIN") {
    return { allowed: true, plan: "PREMIUM" };
  }

  // Check if tool is restricted to Admin by default
  if (tool.restrictedToAdmin) {
    const profile = await prisma.profile.findUnique({ where: { userId } });
    const hasDelegation =
      profile?.bio?.includes(`DELEGATED_ACCESS:${toolSlug}`) ||
      profile?.company?.includes(`DELEGATED_ACCESS:${toolSlug}`);

    if (hasDelegation) {
      return { allowed: true, plan: "PRO" };
    }

    return {
      allowed: false,
      reason: "Restricted Tool: This intelligence tool requires administrator authorization or delegation.",
      plan: "NONE",
    };
  }

  const activeSub = user.subscriptions[0];
  const { isActive: isTrialActive, daysRemaining } = evaluateTrial(user.trial as any);

  // If user has an active subscription
  if (activeSub) {
    const planTier = activeSub.plan.name as PlanTier;
    const planConfig = SUBSCRIPTION_PLANS[planTier];

    // Check Plan Hierarchy
    const tierRanks: Record<PlanTier, number> = { BASIC: 1, PRO: 2, PREMIUM: 3 };
    const userRank = tierRanks[planTier] || 1;
    const requiredRank = tierRanks[tool.planRequired] || 1;

    if (userRank < requiredRank) {
      return {
        allowed: false,
        reason: `This tool requires a ${tool.planRequired} plan. Please upgrade your subscription.`,
        plan: planTier,
      };
    }

    // If it's an AI tool, check monthly AI usage count
    if (tool.category === "AI") {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const usageCount = await prisma.toolUsage.count({
        where: {
          userId,
          category: "AI",
          createdAt: { gte: startOfMonth },
        },
      });

      if (usageCount >= planConfig.aiLimit) {
        return {
          allowed: false,
          reason: `You have reached your monthly limit of ${planConfig.aiLimit} AI requests. Please upgrade or wait for the next cycle.`,
          plan: planTier,
        };
      }
    }

    return { allowed: true, plan: planTier };
  }

  // If user has an active 7-day trial
  if (isTrialActive) {
    // Trial users have PRO tier privileges during trial period
    if (tool.planRequired === "PREMIUM") {
      return {
        allowed: false,
        reason: "This tool requires a Premium plan. Upgrade to unlock full studio access.",
        plan: "TRIAL",
        trialDaysRemaining: daysRemaining,
      };
    }

    // Trial usage cap (e.g. 50 AI requests during trial)
    if (tool.category === "AI") {
      const trialUsage = await prisma.toolUsage.count({
        where: {
          userId,
          category: "AI",
        },
      });

      if (trialUsage >= 50) {
        return {
          allowed: false,
          reason: "Trial AI limit reached (50 requests). Subscribe to continue creating without limits.",
          plan: "TRIAL",
          trialDaysRemaining: daysRemaining,
        };
      }
    }

    return {
      allowed: true,
      plan: "TRIAL",
      trialDaysRemaining: daysRemaining,
    };
  }

  // If trial has expired and no subscription
  return {
    allowed: false,
    reason: "Your 7-day trial has expired. Please choose a subscription plan to continue using ToolVerse AI.",
    plan: "NONE",
    trialDaysRemaining: 0,
  };
}

/**
 * Record usage after tool execution
 */
export async function recordToolUsage(params: {
  userId: string;
  toolSlug: string;
  tokensUsed?: number;
  executionTimeMs?: number;
  status?: "SUCCESS" | "FAILED";
  metadata?: any;
}) {
  const tool = TOOLS_REGISTRY.find((t) => t.slug === params.toolSlug);

  return prisma.toolUsage.create({
    data: {
      userId: params.userId,
      toolSlug: params.toolSlug,
      category: tool?.category || "UTILITIES",
      tokensUsed: params.tokensUsed || 0,
      executionTimeMs: params.executionTimeMs || 0,
      status: params.status || "SUCCESS",
      metadata: params.metadata ? JSON.stringify(params.metadata) : null,
    },
  });
}
