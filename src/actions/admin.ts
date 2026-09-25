"use server";

import { prisma } from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// Ensure caller is ADMIN
async function ensureAdmin() {
  const session = await getServerAuthSession();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
}

export async function deleteUserAction(userId: string) {
  try {
    await ensureAdmin();
    await prisma.user.delete({ where: { id: userId } });
    revalidatePath("/admin");
    return { success: true, message: "User deleted successfully." };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateUserRoleAction(userId: string, role: string) {
  try {
    await ensureAdmin();
    await prisma.user.update({
      where: { id: userId },
      data: { role },
    });
    revalidatePath("/admin");
    return { success: true, message: `User role updated to ${role}.` };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function toggleToolStatusAction(toolId: string, isActive: boolean) {
  try {
    await ensureAdmin();
    const updated = await prisma.tool.update({
      where: { id: toolId },
      data: { isActive },
    });
    revalidatePath("/admin");
    revalidatePath("/tools");
    revalidatePath("/");
    return {
      success: true,
      message: `Tool "${updated.name}" is now ${isActive ? "Active" : "Disabled"}.`,
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateToolAction(
  toolId: string,
  data: { planRequired?: string; isFeatured?: boolean }
) {
  try {
    await ensureAdmin();
    const updated = await prisma.tool.update({
      where: { id: toolId },
      data,
    });
    revalidatePath("/admin");
    revalidatePath("/tools");
    return {
      success: true,
      message: `Tool "${updated.name}" updated successfully.`,
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function broadcastNotificationAction(
  title: string,
  message: string,
  type: string = "INFO"
) {
  try {
    await ensureAdmin();
    const allUsers = await prisma.user.findMany({ select: { id: true } });

    if (allUsers.length === 0) {
      return { success: true, message: "No registered users to notify." };
    }

    await prisma.notification.createMany({
      data: allUsers.map((u) => ({
        userId: u.id,
        title,
        message,
        type,
      })),
    });

    return {
      success: true,
      message: `Broadcast sent successfully to ${allUsers.length} users!`,
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export interface UpdatePlanInput {
  title: string;
  price: number;
  yearlyPrice: number;
  description: string;
  badge?: string;
  popular?: boolean;
  features?: string[];
  notIncluded?: string[];
}

export async function updatePlanAction(planId: string, data: UpdatePlanInput) {
  try {
    await ensureAdmin();

    const existing = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!existing) {
      return { success: false, error: "Plan not found" };
    }

    let currentMetadata: any = {};
    try {
      if (existing.features) {
        currentMetadata = JSON.parse(existing.features);
      }
    } catch {
      currentMetadata = {};
    }

    const updatedMetadata = {
      ...currentMetadata,
      yearlyPrice: Number(data.yearlyPrice) || Math.round(Number(data.price) * 0.8),
      badge: data.badge || "",
      popular: Boolean(data.popular),
      features: Array.isArray(data.features) ? data.features : (currentMetadata.features || []),
      notIncluded: Array.isArray(data.notIncluded) ? data.notIncluded : (currentMetadata.notIncluded || []),
    };

    await prisma.plan.update({
      where: { id: planId },
      data: {
        title: data.title.trim(),
        price: Number(data.price),
        description: data.description.trim(),
        features: JSON.stringify(updatedMetadata),
      },
    });

    revalidatePath("/");
    revalidatePath("/pricing");
    revalidatePath("/admin");

    return { success: true, message: `Plan "${data.title}" updated successfully.` };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function resetCanonicalPlansAction() {
  try {
    await ensureAdmin();
    const { CANONICAL_PLANS } = await import("@/lib/plans");

    for (const plan of CANONICAL_PLANS) {
      const metadata = {
        yearlyPrice: plan.yearlyPrice,
        popular: plan.popular,
        badge: plan.badge,
        features: plan.features,
        notIncluded: plan.notIncluded,
        ctaText: plan.ctaText,
      };

      await prisma.plan.upsert({
        where: { name: plan.name },
        update: {
          title: plan.title,
          description: plan.tagline,
          price: plan.price,
          features: JSON.stringify(metadata),
          isActive: true,
        },
        create: {
          name: plan.name,
          title: plan.title,
          description: plan.tagline,
          price: plan.price,
          currency: "INR",
          billingInterval: "monthly",
          aiRequestLimit: plan.name === "BASIC" ? 20 : plan.name === "PRO" ? 100 : 500,
          fileUploadLimit: plan.name === "BASIC" ? 25 : plan.name === "PRO" ? 250 : 2000,
          videoProcessLimit: plan.name === "BASIC" ? 5 : plan.name === "PRO" ? 20 : 60,
          storageLimitMb: plan.name === "BASIC" ? 500 : plan.name === "PRO" ? 5000 : 25000,
          features: JSON.stringify(metadata),
          isActive: true,
        },
      });
    }

    revalidatePath("/");
    revalidatePath("/pricing");
    revalidatePath("/admin");

    return { success: true, message: "Standard pricing plans initialized successfully." };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function toggleUserToolDelegationAction(targetUserId: string, toolSlug: string) {
  try {
    await ensureAdmin();

    const profile = await prisma.profile.findUnique({
      where: { userId: targetUserId },
    });

    const token = `DELEGATED_ACCESS:${toolSlug}`;
    let newBio = profile?.bio || "";
    let isNowGranted = false;

    if (newBio.includes(token)) {
      newBio = newBio.replace(token, "").trim();
      isNowGranted = false;
    } else {
      newBio = (newBio + " " + token).trim();
      isNowGranted = true;
    }

    if (profile) {
      await prisma.profile.update({
        where: { userId: targetUserId },
        data: { bio: newBio },
      });
    } else {
      await prisma.profile.create({
        data: {
          userId: targetUserId,
          bio: newBio,
        },
      });
    }

    revalidatePath("/admin");
    return {
      success: true,
      delegated: isNowGranted,
      message: isNowGranted
        ? `Access for "${toolSlug}" granted to user.`
        : `Access for "${toolSlug}" revoked from user.`,
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
