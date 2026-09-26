"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/auth";
import { changePasswordSchema } from "@/lib/validations/auth";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import path from "path";
import fs from "fs/promises";

type ActionResult = { success: true; message: string; avatarUrl?: string } | { success: false; error: string };

export async function updateProfileAction(data: {
  name?: string;
  bio?: string;
  phone?: string;
  company?: string;
  avatarUrl?: string;
}): Promise<ActionResult> {
  try {
    const session = await getServerAuthSession();
    if (!session?.user) return { success: false, error: "Not authenticated" };
    const userId = (session.user as any).id as string;

    if (data.name && (data.name.trim().length < 2 || data.name.trim().length > 64)) {
      return { success: false, error: "Name must be between 2 and 64 characters" };
    }

    if (data.bio && data.bio.length > 500) {
      return { success: false, error: "Bio cannot exceed 500 characters" };
    }

    if (data.phone && data.phone.length > 32) {
      return { success: false, error: "Phone number cannot exceed 32 characters" };
    }

    if (data.company && data.company.length > 100) {
      return { success: false, error: "Company name cannot exceed 100 characters" };
    }

    // SECURITY: Fetch existing profile to preserve any authorized admin delegation tokens
    const existingProfile = await prisma.profile.findUnique({ where: { userId } });
    const existingBio = existingProfile?.bio || "";
    const adminTokens = existingBio.match(/DELEGATED_ACCESS:[a-zA-Z0-9_\-]+/g) || [];

    // Strip any user-attempted injection of DELEGATED_ACCESS tokens
    let sanitizedBio = (data.bio || "")
      .replace(/DELEGATED_ACCESS:[a-zA-Z0-9_\-]+/gi, "")
      .trim();

    // Re-attach legitimate existing admin delegation tokens if present
    if (adminTokens.length > 0) {
      sanitizedBio = (sanitizedBio + " " + adminTokens.join(" ")).trim();
    }

    // Strip any delegation attempts from company field
    const sanitizedCompany = data.company
      ? data.company.replace(/DELEGATED_ACCESS:[a-zA-Z0-9_\-]+/gi, "").trim()
      : undefined;

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          name: data.name?.trim(),
          ...(data.avatarUrl ? { image: data.avatarUrl } : {}),
        },
      }),
      prisma.profile.upsert({
        where: { userId },
        update: {
          bio: sanitizedBio,
          phone: data.phone?.trim(),
          company: sanitizedCompany,
          ...(data.avatarUrl ? { avatarUrl: data.avatarUrl } : {}),
        },
        create: {
          userId,
          bio: sanitizedBio,
          phone: data.phone?.trim(),
          company: sanitizedCompany,
          avatarUrl: data.avatarUrl,
        },
      }),
    ]);

    await prisma.auditLog.create({
      data: { userId, action: "PROFILE_UPDATE", resource: "profile" },
    });

    revalidatePath("/dashboard/profile");
    revalidatePath("/dashboard");
    revalidatePath("/admin");
    return { success: true, message: "Profile updated successfully.", avatarUrl: data.avatarUrl };
  } catch (error) {
    console.error("[updateProfileAction]", error);
    return { success: false, error: "Failed to update profile." };
  }
}

export async function uploadAvatarAction(formData: FormData): Promise<ActionResult> {
  try {
    const session = await getServerAuthSession();
    if (!session?.user) return { success: false, error: "Not authenticated" };
    const userId = (session.user as any).id as string;

    const file = formData.get("avatar") as File | null;
    if (!file) {
      return { success: false, error: "No image file provided." };
    }

    // SECURITY: Whitelist raster images only. Explicitly disallow SVG (Stored XSS vector)
    const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return { success: false, error: "Only JPEG, PNG, and WebP image formats are permitted." };
    }

    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      return { success: false, error: "Image size must be less than 5MB." };
    }

    const rawExt = path.extname(file.name).toLowerCase();
    const EXT_MAP: Record<string, string> = {
      ".jpg": ".jpg",
      ".jpeg": ".jpg",
      ".png": ".png",
      ".webp": ".webp",
    };
    const safeExt = EXT_MAP[rawExt] || (file.type === "image/png" ? ".png" : file.type === "image/webp" ? ".webp" : ".jpg");

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let publicUrl = "";
    try {
      const uploadsDir = path.join(process.cwd(), "public", "uploads", "avatars");
      await fs.mkdir(uploadsDir, { recursive: true });
      const filename = `${userId}-${Date.now()}${safeExt}`;
      const filePath = path.join(uploadsDir, filename);
      await fs.writeFile(filePath, buffer);
      publicUrl = `/uploads/avatars/${filename}`;
    } catch {
      // Serverless fallback for Vercel/AWS Lambda
      publicUrl = `data:${file.type};base64,${buffer.toString("base64")}`;
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { image: publicUrl },
      }),
      prisma.profile.upsert({
        where: { userId },
        update: { avatarUrl: publicUrl },
        create: { userId, avatarUrl: publicUrl },
      }),
    ]);

    await prisma.auditLog.create({
      data: { userId, action: "AVATAR_UPLOAD", resource: "user" },
    });

    revalidatePath("/dashboard/profile");
    revalidatePath("/dashboard");
    revalidatePath("/admin");

    return {
      success: true,
      message: "Avatar photo uploaded successfully!",
      avatarUrl: publicUrl,
    };
  } catch (error) {
    console.error("[uploadAvatarAction]", error);
    return { success: false, error: "Failed to upload avatar photo." };
  }
}

export async function changePasswordAction(
  data: z.infer<typeof changePasswordSchema>
): Promise<ActionResult> {
  try {
    const session = await getServerAuthSession();
    if (!session?.user) return { success: false, error: "Not authenticated" };
    const userId = (session.user as any).id as string;

    const validated = changePasswordSchema.safeParse(data);
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0]?.message ?? "Invalid input" };
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.password) {
      return { success: false, error: "Cannot change password for OAuth accounts." };
    }

    const isMatch = await bcrypt.compare(validated.data.currentPassword, user.password);
    if (!isMatch) {
      return { success: false, error: "Current password is incorrect." };
    }

    const hashedNew = await bcrypt.hash(validated.data.newPassword, 12);
    await prisma.user.update({ where: { id: userId }, data: { password: hashedNew } });

    await prisma.auditLog.create({
      data: { userId, action: "PASSWORD_CHANGE", resource: "user" },
    });

    return { success: true, message: "Password changed successfully." };
  } catch (error) {
    return { success: false, error: "Failed to change password." };
  }
}

export async function deleteAccountAction(): Promise<ActionResult> {
  try {
    const session = await getServerAuthSession();
    if (!session?.user) return { success: false, error: "Not authenticated" };
    const userId = (session.user as any).id as string;

    // Log before deletion
    await prisma.auditLog.create({
      data: { userId, action: "ACCOUNT_DELETION_REQUESTED", resource: "user" },
    });

    // Cascade delete user (related data deleted by Prisma cascade)
    await prisma.user.delete({ where: { id: userId } });

    return { success: true, message: "Account deleted." };
  } catch (error) {
    return { success: false, error: "Failed to delete account." };
  }
}
