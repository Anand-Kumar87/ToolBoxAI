"use server";

import { getServerAuthSession } from "@/lib/auth";
import { checkUserAccessAndLimits, recordToolUsage } from "@/services/usage";

export async function checkToolAccessAction(toolSlug: string) {
  const session = await getServerAuthSession();
  if (!session?.user) return { allowed: false, error: "Authentication required" };
  
  const userId = (session.user as any).id as string;
  const access = await checkUserAccessAndLimits(userId, toolSlug);
  
  if (!access.allowed) return { allowed: false, error: access.reason || "Access denied" };
  return { allowed: true };
}

export async function recordClientToolUsageAction(
  toolSlug: string, 
  executionTimeMs: number
) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user) return { success: false, error: "Authentication required" };

    const userId = (session.user as any).id as string;
    
    await recordToolUsage({
      userId,
      toolSlug,
      executionTimeMs,
      status: "SUCCESS"
    });

    return { success: true };
  } catch (error) {
    console.error("[recordClientToolUsageAction]", error);
    return { success: false };
  }
}
