import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SettingsClient } from "@/components/dashboard/settings-client";

export const metadata: Metadata = {
  title: "Settings | Korevante Studio",
  description: "Manage your account settings, preferences, and developer API keys.",
};

export default async function SettingsPage() {
  const session = await getServerAuthSession();
  if (!session?.user) redirect("/login");

  const userId = (session.user as any).id as string;

  const user = await prisma.user.findUnique({
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
  });

  if (!user) redirect("/login");

  const activeSub = user.subscriptions[0];
  const isOAuthUser = user.accounts.some((a) => a.provider !== "credentials") && !user.password;
  const connectedProviders = user.accounts.map((a) => a.provider);

  return (
    <SettingsClient
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image,
      }}
      profile={
        user.profile
          ? {
              bio: user.profile.bio,
              phone: user.profile.phone,
              company: user.profile.company,
              theme: user.profile.theme,
            }
          : null
      }
      activePlan={activeSub ? activeSub.plan.title : "Free Trial"}
      isOAuthUser={isOAuthUser}
      connectedProviders={connectedProviders}
    />
  );
}
