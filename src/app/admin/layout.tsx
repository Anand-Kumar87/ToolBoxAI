import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/lib/auth";
import { DashboardSidebar } from "@/components/dashboard/sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerAuthSession();
  
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden relative">
      <DashboardSidebar />
      <main className="flex-1 overflow-y-auto lg:pl-60 transition-all duration-300 ease-in-out">
        <div className="min-h-full w-full py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
