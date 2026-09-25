import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProjectsClient } from "@/components/dashboard/projects-client";
import { FolderKanban } from "lucide-react";

export const metadata: Metadata = {
  title: "Projects & Workspaces | Korevante Studio",
  description: "Manage your creative AI projects and organized workspaces",
};

export default async function ProjectsPage() {
  const session = await getServerAuthSession();
  if (!session?.user) redirect("/login");

  const userId = (session.user as any).id as string;

  const projects = await prisma.project.findMany({
    where: { userId, isArchived: false },
    include: {
      files: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="pb-2 border-b border-border/40">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-pill text-[11px] font-bold text-primary mb-2.5 border border-primary/20">
          <FolderKanban className="h-3.5 w-3.5" /> Workspace Manager
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
          Creative Workspaces &amp; Projects
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium">
          Create, organize, and manage your AI generations, documents, and tool pipelines.
        </p>
      </div>

      <ProjectsClient initialProjects={projects} />
    </div>
  );
}
