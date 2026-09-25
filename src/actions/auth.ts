"use server";

import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { signupSchema, forgotPasswordSchema, resetPasswordSchema } from "@/lib/validations/auth";
import { sendPasswordResetEmail, sendWelcomeEmail } from "@/lib/mail";
import { z } from "zod";

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

type ActionResult =
  | { success: true; message: string }
  | { success: false; error: string };

// ─────────────────────────────────────────────────────────────
// SIGNUP: Create account + automatic 7-day trial
// ─────────────────────────────────────────────────────────────
export async function signupAction(
  rawData: z.infer<typeof signupSchema>
): Promise<ActionResult> {
  try {
    const validated = signupSchema.safeParse(rawData);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.errors[0]?.message ?? "Invalid input",
      };
    }

    const { name, email, password, plan } = validated.data;

    // Check if email is already registered
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return {
        success: false,
        error: "An account with this email already exists.",
      };
    }

    // Hash password with bcrypt cost factor 12
    const hashedPassword = await bcrypt.hash(password, 12);

    // Resolve requested plan or fallback to PRO if trial
    const normalizedPlan = (plan || "").toUpperCase().trim();
    let planKey = "PRO"; // Default popular trial plan
    if (normalizedPlan === "ENTERPRISE" || normalizedPlan === "PREMIUM") {
      planKey = "PREMIUM";
    } else if (normalizedPlan === "STARTER" || normalizedPlan === "BASIC") {
      planKey = "BASIC";
    } else if (normalizedPlan === "PRO") {
      planKey = "PRO";
    }

    const targetPlan = await prisma.plan.findUnique({ where: { name: planKey } }) 
      || await prisma.plan.findFirst({ where: { isActive: true } });

    // Create user + profile + trial atomically
    const now = new Date();
    const trialEnd = addDays(now, 7);

    await prisma.user.create({
      data: {
        name: name.trim(),
        email,
        password: hashedPassword,
        role: "USER",
        profile: {
          create: { theme: "system" },
        },
        trial: {
          create: {
            trialStartDate: now,
            trialEndDate: trialEnd,
            trialStatus: "ACTIVE",
          },
        },
        notifications: {
          create: {
            title: "Welcome to Korevante Studio! 🎉",
            message: `Your 7-day free trial of Korevante Studio is now active! Explore 50+ tools and create amazing things. Trial ends on ${trialEnd.toLocaleDateString("en-IN", { dateStyle: "long" })}.`,
            type: "SUCCESS",
          },
        },
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: "USER_SIGNUP",
        resource: "user",
        metadata: JSON.stringify({ email, method: "credentials" }),
      },
    });

    // Dispatch welcome email asynchronously
    sendWelcomeEmail(email, name.trim(), targetPlan?.title || "Pro Creator").catch((err) => {
      console.warn("[signupAction] Welcome email failed:", err);
    });

    return {
      success: true,
      message: "Account created! Your 7-day free trial has started.",
    };
  } catch (error: any) {
    console.error("[signupAction] Error:", error);
    return { success: false, error: "Registration failed. Please try again." };
  }
}

// ─────────────────────────────────────────────────────────────
// FORGOT PASSWORD: Generate secure reset token
// ─────────────────────────────────────────────────────────────
export async function forgotPasswordAction(
  rawData: z.infer<typeof forgotPasswordSchema>
): Promise<ActionResult> {
  try {
    const validated = forgotPasswordSchema.safeParse(rawData);
    if (!validated.success) {
      return { success: false, error: "Invalid email address." };
    }

    const { email } = validated.data;
    const user = await prisma.user.findUnique({ where: { email } });

    // Always return success to prevent user enumeration
    if (!user) {
      return {
        success: true,
        message: "If this email exists, a reset link has been sent.",
      };
    }

    // Create a cryptographically secure token
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

    // Store in verification token table
    await prisma.verificationToken.upsert({
      where: { token },
      update: { expires },
      create: {
        identifier: email,
        token,
        expires,
      },
    });

    const resetUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/reset-password?token=${token}`;
    if (process.env.NODE_ENV === "development") {
      console.log(`[Password Reset] URL for ${email}: ${resetUrl}`);
    }
    
    // Dispatch real email via Gmail SMTP
    await sendPasswordResetEmail(email, resetUrl);

    return {
      success: true,
      message: "If this email exists, a password reset link has been sent.",
    };
  } catch (error: any) {
    console.error("[forgotPasswordAction] Error:", error);
    return {
      success: false,
      error: "Failed to process request. Please try again.",
    };
  }
}

// ─────────────────────────────────────────────────────────────
// RESET PASSWORD: Validate token and update password
// ─────────────────────────────────────────────────────────────
export async function resetPasswordAction(rawData: {
  token: string;
  password: string;
  confirmPassword: string;
}): Promise<ActionResult> {
  try {
    const { token, password, confirmPassword } = rawData;

    if (!token || !password || !confirmPassword) {
      return { success: false, error: "All fields are required." };
    }

    if (password !== confirmPassword) {
      return { success: false, error: "Passwords do not match." };
    }

    if (password.length < 8) {
      return { success: false, error: "Password must be at least 8 characters." };
    }

    // Find the verification token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      return {
        success: false,
        error: "This reset link is invalid or has already been used.",
      };
    }

    if (verificationToken.expires < new Date()) {
      await prisma.verificationToken.delete({ where: { token } });
      return {
        success: false,
        error: "This reset link has expired. Please request a new one.",
      };
    }

    // Update the user's password
    const hashedPassword = await bcrypt.hash(password, 12);
    await prisma.user.update({
      where: { email: verificationToken.identifier },
      data: {
        password: hashedPassword,
        emailVerified: new Date(), // Mark email as verified if not already
      },
    });

    // Delete the used token
    await prisma.verificationToken.delete({ where: { token } });

    await prisma.auditLog.create({
      data: {
        action: "PASSWORD_RESET",
        resource: "user",
        metadata: JSON.stringify({ email: verificationToken.identifier }),
      },
    });

    return { success: true, message: "Password updated successfully! You can now log in." };
  } catch (error: any) {
    console.error("[resetPasswordAction] Error:", error);
    return { success: false, error: "Failed to reset password. Please try again." };
  }
}

// ─────────────────────────────────────────────────────────────
// VERIFY EMAIL: Mark user as verified
// ─────────────────────────────────────────────────────────────
export async function verifyEmailAction(token: string): Promise<ActionResult> {
  try {
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      return { success: false, error: "Invalid or expired verification link." };
    }

    if (verificationToken.expires < new Date()) {
      await prisma.verificationToken.delete({ where: { token } });
      return { success: false, error: "Verification link has expired." };
    }

    await prisma.user.update({
      where: { email: verificationToken.identifier },
      data: { emailVerified: new Date() },
    });

    await prisma.verificationToken.delete({ where: { token } });

    return { success: true, message: "Email verified successfully!" };
  } catch (error) {
    return { success: false, error: "Email verification failed." };
  }
}
