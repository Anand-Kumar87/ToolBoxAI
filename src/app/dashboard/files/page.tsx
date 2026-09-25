import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FilesClient } from "@/components/dashboard/files-client";
import { HardDrive } from "lucide-react";

export const metadata: Metadata = {
  title: "My Cloud Vault | Korevante Studio",
  description: "Securely view, upload, and download your creative assets",
};

export default async function FilesPage() {
  const session = await getServerAuthSession();
  if (!session?.user) redirect("/login");

  const userId = (session.user as any).id as string;

  const files = await prisma.file.findMany({
    where: { userId },
    include: {
      project: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="pb-2 border-b border-border/40">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-pill text-[11px] font-bold text-primary mb-2.5 border border-primary/20">
          <HardDrive className="h-3.5 w-3.5" /> Storage Vault
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
          Cloud Assets &amp; Files
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium">
          Manage, preview, and download your generated content and uploaded assets.
        </p>
      </div>

      <FilesClient initialFiles={files} />
    </div>
  );
}
