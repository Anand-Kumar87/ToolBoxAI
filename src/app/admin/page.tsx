import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Box } from "lucide-react";
import { AdminClient } from "@/components/admin/admin-client";

export const metadata = {
  title: "Admin Control Center | Korevante Studio",
  description: "Executive administrative dashboard for user moderation, analytics, tool registry, and pricing management.",
};

export default async function AdminDashboardPage() {
  const session = await getServerAuthSession();

  // Safety check: Only ADMIN role can access
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    redirect("/dashboard");
  }

  // Fetch Comprehensive Global Stats & Live Data
  const [
    totalUsers,
    totalUsage,
    totalRevenueAgg,
    activeSubscriptionsCount,
    totalStorageAgg,
    users,
    payments,
    plans,
    tools,
    recentAuditLogs,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.toolUsage.count(),
    prisma.payment.aggregate({
      where: { status: "SUCCESS" },
      _sum: { amount: true },
    }),
    prisma.subscription.count({
      where: { status: "ACTIVE" },
    }),
    prisma.file.aggregate({
      _sum: { sizeBytes: true },
      _count: true,
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        createdAt: true,
        profile: { select: { bio: true } },
        subscriptions: {
          where: { status: "ACTIVE" },
          select: { plan: { select: { title: true } } },
        },
        _count: {
          select: {
            toolUsages: true,
            projects: true,
            files: true,
          },
        },
      },
    }),
    prisma.payment.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        orderId: true,
        paymentId: true,
        amount: true,
        status: true,
        createdAt: true,
        user: { select: { name: true, email: true } },
      },
    }),
    prisma.plan.findMany({
      orderBy: { price: "asc" },
    }),
    prisma.tool.findMany({
      orderBy: [{ category: "asc" }, { name: "asc" }],
    }),
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 15,
      include: {
        user: { select: { name: true, email: true } },
      },
    }),
  ]);

  const stats = {
    totalUsers,
    totalUsage,
    totalRevenue: totalRevenueAgg._sum.amount || 0,
    activeSubscriptions: activeSubscriptionsCount,
    totalStorageMb: Math.round((totalStorageAgg._sum.sizeBytes || 0) / (1024 * 1024)),
    totalFiles: totalStorageAgg._count || 0,
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6 lg:p-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-[#01140e] flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Box className="h-5 w-5" />
            </div>
            Admin Control Center
          </h1>
          <p className="text-muted-foreground mt-2 font-medium">
            Monitor real-time system health, manage all 62 tools, moderate users, and control dynamic pricing.
          </p>
        </div>
      </div>

      <AdminClient
        stats={stats}
        users={users}
        payments={payments}
        initialPlans={plans}
        tools={tools}
        auditLogs={recentAuditLogs}
      />
    </div>
  );
}
