"use server";

import { prisma } from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export type ProjectResult = 
  | { success: true; message: string; data?: any }
  | { success: false; error: string };

export async function createProjectAction(data: {
  name: string;
  description?: string;
  category?: string;
}): Promise<ProjectResult> {
  try {
    const session = await getServerAuthSession();
    if (!session?.user) return { success: false, error: "Not authenticated" };
    const userId = (session.user as any).id as string;

    const trimmedName = data.name?.trim();
    if (!trimmedName || trimmedName.length < 2) {
      return { success: false, error: "Project name must be at least 2 characters." };
    }

    const project = await prisma.project.create({
      data: {
        userId,
        name: trimmedName,
        description: data.description?.trim() || null,
        category: data.category?.trim() || "General",
      },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: "PROJECT_CREATED",
        resource: "project",
        metadata: JSON.stringify({ projectId: project.id, name: project.name }),
      },
    });

    revalidatePath("/dashboard/projects");
    return { success: true, message: "Project created successfully!", data: project };
  } catch (error: any) {
    console.error("[createProjectAction] Error:", error);
    return { success: false, error: "Failed to create project." };
  }
}

export async function updateProjectAction(data: {
  id: string;
  name: string;
  description?: string;
  category?: string;
}): Promise<ProjectResult> {
  try {
    const session = await getServerAuthSession();
    if (!session?.user) return { success: false, error: "Not authenticated" };
    const userId = (session.user as any).id as string;

    const trimmedName = data.name?.trim();
    if (!trimmedName || trimmedName.length < 2) {
      return { success: false, error: "Project name must be at least 2 characters." };
    }

    const existing = await prisma.project.findFirst({
      where: { id: data.id, userId },
    });
    if (!existing) {
      return { success: false, error: "Project not found." };
    }

    const updated = await prisma.project.update({
      where: { id: data.id },
      data: {
        name: trimmedName,
        description: data.description?.trim() || null,
        category: data.category?.trim() || existing.category,
      },
    });

    revalidatePath("/dashboard/projects");
    return { success: true, message: "Project updated successfully!", data: updated };
  } catch (error: any) {
    console.error("[updateProjectAction] Error:", error);
    return { success: false, error: "Failed to update project." };
  }
}

export async function deleteProjectAction(projectId: string): Promise<ProjectResult> {
  try {
    const session = await getServerAuthSession();
    if (!session?.user) return { success: false, error: "Not authenticated" };
    const userId = (session.user as any).id as string;

    const existing = await prisma.project.findFirst({
      where: { id: projectId, userId },
    });
    if (!existing) {
      return { success: false, error: "Project not found." };
    }

    // Unlink any files first, then delete project
    await prisma.file.updateMany({
      where: { projectId },
      data: { projectId: null },
    });

    await prisma.project.delete({
      where: { id: projectId },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: "PROJECT_DELETED",
        resource: "project",
        metadata: JSON.stringify({ projectId }),
      },
    });

    revalidatePath("/dashboard/projects");
    return { success: true, message: "Project deleted successfully." };
  } catch (error: any) {
    console.error("[deleteProjectAction] Error:", error);
    return { success: false, error: "Failed to delete project." };
  }
}
