"use server";

import fs from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export type FileActionResult = 
  | { success: true; message: string; data?: any }
  | { success: false; error: string };

export async function uploadFileAction(formData: FormData): Promise<FileActionResult> {
  try {
    const session = await getServerAuthSession();
    if (!session?.user) return { success: false, error: "Not authenticated" };
    const userId = (session.user as any).id as string;

    const file = formData.get("file") as globalThis.File | null;
    const projectId = (formData.get("projectId") as string) || null;

    if (!file || file.size === 0) {
      return { success: false, error: "Please select a valid file to upload." };
    }

    // Limit check (e.g. 50MB max upload per file)
    const MAX_SIZE = 50 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return { success: false, error: "File exceeds 50 MB limit." };
    }

    // Clean filename and prevent path traversal
    const baseName = path.basename(file.name);
    let sanitizedName = baseName.replace(/[^a-zA-Z0-9._-]/g, "_");

    // SECURITY: Disallow dangerous executable/script extensions (Stored XSS / Remote Code)
    const ext = path.extname(sanitizedName).toLowerCase();
    const DANGEROUS_EXTENSIONS = new Set([
      ".html", ".htm", ".xhtml", ".svg", ".php", ".phtml",
      ".exe", ".bat", ".cmd", ".sh", ".bash", ".vbs",
      ".js", ".mjs", ".cjs", ".jsp", ".asp", ".aspx", ".py", ".rb", ".cgi"
    ]);

    if (DANGEROUS_EXTENSIONS.has(ext)) {
      sanitizedName = sanitizedName.slice(0, -ext.length) + ".bin";
    }

    const uniqueKey = `${Date.now()}-${sanitizedName}`;

    // Read file bytes
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let publicUrl = "";

    // Attempt to write to local disk if writable (Docker, self-hosted VPS, local dev)
    try {
      const userUploadDir = path.join(process.cwd(), "public", "uploads", userId);
      if (!fs.existsSync(userUploadDir)) {
        fs.mkdirSync(userUploadDir, { recursive: true });
      }
      const filePath = path.join(userUploadDir, uniqueKey);
      await fs.promises.writeFile(filePath, buffer);
      publicUrl = `/uploads/${userId}/${uniqueKey}`;
    } catch {
      // Running on read-only serverless environment (e.g. Vercel Lambda)
      // Store as standard base64 data URL so file is accessible anywhere
      publicUrl = `data:${file.type || "application/octet-stream"};base64,${buffer.toString("base64")}`;
    }

    // Create database entry
    const fileRecord = await prisma.file.create({
      data: {
        userId,
        projectId: projectId || undefined,
        fileName: uniqueKey,
        originalName: file.name,
        mimeType: file.type || "application/octet-stream",
        sizeBytes: file.size,
        storageKey: `${userId}/${uniqueKey}`,
        url: publicUrl,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: "FILE_UPLOAD",
        resource: "file",
        metadata: JSON.stringify({ fileId: fileRecord.id, name: file.name, size: file.size }),
      },
    });

    revalidatePath("/dashboard/files");
    revalidatePath("/dashboard/projects");
    return { success: true, message: `Uploaded ${file.name} successfully!`, data: fileRecord };
  } catch (error: any) {
    console.error("[uploadFileAction] Error:", error);
    return { success: false, error: "Failed to upload file. Please try again." };
  }
}

export async function deleteFileAction(fileId: string): Promise<FileActionResult> {
  try {
    const session = await getServerAuthSession();
    if (!session?.user) return { success: false, error: "Not authenticated" };
    const userId = (session.user as any).id as string;

    const fileRecord = await prisma.file.findFirst({
      where: { id: fileId, userId },
    });

    if (!fileRecord) {
      return { success: false, error: "File not found." };
    }

    // Try deleting from disk
    try {
      const diskPath = path.join(process.cwd(), "public", "uploads", userId, fileRecord.fileName);
      if (fs.existsSync(diskPath)) {
        await fs.promises.unlink(diskPath);
      }
    } catch (diskErr) {
      console.warn("[deleteFileAction] Disk file deletion error:", diskErr);
    }

    // Delete record from DB
    await prisma.file.delete({
      where: { id: fileId },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: "FILE_DELETE",
        resource: "file",
        metadata: JSON.stringify({ fileId, name: fileRecord.originalName }),
      },
    });

    revalidatePath("/dashboard/files");
    revalidatePath("/dashboard/projects");
    return { success: true, message: "File deleted successfully." };
  } catch (error: any) {
    console.error("[deleteFileAction] Error:", error);
    return { success: false, error: "Failed to delete file." };
  }
}
