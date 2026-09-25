import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendWelcomeEmail } from "@/lib/mail";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login",
    newUser: "/dashboard",
  },
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please provide email and password");
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email.toLowerCase().trim(),
          },
        });

        if (!user || !user.password) {
          throw new Error("Invalid email or password");
        }

        const isPasswordMatch = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordMatch) {
          throw new Error("Invalid email or password");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  events: {
    async createUser({ user }) {
      try {
        const now = new Date();
        const trialEnd = new Date(now);
        trialEnd.setDate(trialEnd.getDate() + 7);

        // Find default trial plan (PRO Creator)
        const proPlan =
          (await prisma.plan.findUnique({ where: { name: "PRO" } })) ||
          (await prisma.plan.findFirst({ where: { isActive: true } }));

        // 1. Create or ensure Profile
        await prisma.profile.upsert({
          where: { userId: user.id },
          update: {
            avatarUrl: user.image || undefined,
          },
          create: {
            userId: user.id,
            theme: "system",
            avatarUrl: user.image || null,
          },
        });

        // 2. Create 7-day Trial
        await prisma.trial.upsert({
          where: { userId: user.id },
          update: {
            trialStartDate: now,
            trialEndDate: trialEnd,
            trialStatus: "ACTIVE",
          },
          create: {
            userId: user.id,
            trialStartDate: now,
            trialEndDate: trialEnd,
            trialStatus: "ACTIVE",
          },
        });

        // 3. Create in-app welcome notification
        await prisma.notification.create({
          data: {
            userId: user.id,
            title: "Welcome to Korevante Studio! 🎉",
            message: `Your 7-day free trial is now active! Explore all 50+ tools and upgrade anytime to activate your subscription.`,
            type: "SUCCESS",
          },
        });

        // 5. Send welcome email via Gmail SMTP
        if (user.email) {
          sendWelcomeEmail(
            user.email,
            user.name || "Creator",
            proPlan?.title || "Pro Creator"
          ).catch((err) => {
            console.warn("[Google OAuth] Welcome email send error:", err);
          });
        }

        // 6. Audit Log
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            action: "USER_SIGNUP",
            resource: "user",
            metadata: JSON.stringify({ email: user.email, method: "google_oauth" }),
          },
        });

        console.log(`[Google OAuth] User ${user.email} provisioned with full 7-day trial.`);
      } catch (err) {
        console.error("[Google OAuth] Failed to provision new user:", err);
      }
    },
  },
  callbacks: {
    async jwt({ token, user, trigger, session, account }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || "USER";
      }

      if (trigger === "update" && session) {
        token.name = session.name ?? token.name;
        token.image = session.image ?? token.image;
        if (session.role) token.role = session.role;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role as string;
      }
      return session;
    },
  },
  secret:
    process.env.NEXTAUTH_SECRET ||
    process.env.AUTH_SECRET ||
    "korevante-studio-production-jwt-auth-key-super-secure-32chars",
};
