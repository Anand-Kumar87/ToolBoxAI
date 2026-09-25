import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { evaluateTrial } from "@/services/usage";
import { formatDate } from "@/lib/utils";
import { Metadata } from "next";
import { ProfileForm } from "@/components/dashboard/profile-form";

export const metadata: Metadata = {
  title: "Profile | ToolVerse AI",
  description: "Manage your personal profile, customize avatars, and security credentials.",
};

export default async function ProfilePage() {
  const session = await getServerAuthSession();
  if (!session?.user) redirect("/login");

  const userId = (session.user as any).id as string;

  const [user, projectsCount, filesCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        trial: true,
        subscriptions: {
          where: { status: "ACTIVE" },
          include: { plan: true },
          take: 1,
        },
        accounts: { select: { provider: true } },
      },
    }),
    prisma.project.count({ where: { userId } }),
    prisma.file.count({ where: { userId } }),
  ]);

  if (!user) redirect("/login");

  const activeSub = user.subscriptions[0];
  const { isActive: trialActive, daysRemaining } = evaluateTrial(user.trial as any);
  const isOAuthUser = user.accounts.some((a) => a.provider !== "credentials") && !user.password;
  const connectedProviders = user.accounts.map((a) => a.provider);

  let planTitle = "Starter Plan";
  if (activeSub) {
    planTitle = activeSub.plan.title;
  } else if (trialActive) {
    planTitle = `Trial (${daysRemaining}d left)`;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-foreground tracking-tight">My Profile</h1>
        <p className="text-sm font-medium text-muted-foreground mt-1">
          Customize your creator identity, 3D avatars, and account security.
        </p>
      </div>

      {/* Unified Luxury Profile Client */}
      <ProfileForm
        initialData={{
          name: user.name || "",
          bio: user.profile?.bio || "",
          phone: user.profile?.phone || "",
          company: user.profile?.company || "",
          email: user.email || "",
          avatarUrl: user.image || user.profile?.avatarUrl || "",
          role: user.role,
          createdAt: formatDate(user.createdAt),
          emailVerified: !!user.emailVerified,
          planTitle,
          isOAuthUser,
          connectedProviders,
          projectsCount,
          filesCount,
        }}
      />
    </div>
  );
}
