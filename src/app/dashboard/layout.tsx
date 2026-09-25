import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/lib/auth";
import { DashboardSidebar } from "@/components/dashboard/sidebar";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your ToolVerse AI workspace",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerAuthSession();

  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard");
  }

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      {/* Ambient background glow for workspace */}
      <div className="absolute top-0 right-1/4 w-[700px] h-[350px] bg-gradient-to-b from-emerald-500/10 via-teal-500/5 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none -z-10" />

      <DashboardSidebar />
      {/* Main content - offset by floating sidebar width on lg+ */}
      <div className="lg:pl-72 transition-all duration-300">
        <main className="min-h-screen p-4 sm:p-8 lg:pr-8">{children}</main>
      </div>
    </div>
  );
}
