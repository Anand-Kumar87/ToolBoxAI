"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Search, FileText, Image as ImageIcon, FileCode2, Video, Music,
  Download, Trash2, UploadCloud, Loader2, HardDrive, Filter, ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { uploadFileAction, deleteFileAction } from "@/actions/files";
import { optimizeImageForUpload } from "@/lib/image-optimizer-client";

interface FileItem {
  id: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  url: string;
  createdAt: Date;
  updatedAt: Date;
  project?: { id: string; name: string } | null;
}

interface FilesClientProps {
  initialFiles: FileItem[];
}

function formatBytes(bytes: number, decimals = 1) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

function getFileIcon(mime: string) {
  if (mime.startsWith("image/")) return <ImageIcon className="h-5 w-5 text-emerald-400" />;
  if (mime.startsWith("video/")) return <Video className="h-5 w-5 text-purple-400" />;
  if (mime.startsWith("audio/")) return <Music className="h-5 w-5 text-pink-400" />;
  if (mime.includes("pdf")) return <FileText className="h-5 w-5 text-rose-400" />;
  if (mime.includes("json") || mime.includes("javascript") || mime.includes("typescript") || mime.includes("python")) {
    return <FileCode2 className="h-5 w-5 text-cyan-400" />;
  }
  return <FileText className="h-5 w-5 text-muted-foreground" />;
}

export function FilesClient({ initialFiles }: FilesClientProps) {
  const router = useRouter();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [files, setFiles] = React.useState<FileItem[]>(initialFiles);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<string>("ALL");
  const [isUploading, setIsUploading] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    setFiles(initialFiles);
  }, [initialFiles]);

  // Filtered files
  const filteredFiles = React.useMemo(() => {
    return files.filter((f) => {
      const matchesSearch = f.originalName.toLowerCase().includes(searchQuery.toLowerCase());
      let matchesType = true;
      if (typeFilter === "IMAGE") matchesType = f.mimeType.startsWith("image/");
      else if (typeFilter === "VIDEO") matchesType = f.mimeType.startsWith("video/");
      else if (typeFilter === "PDF") matchesType = f.mimeType.includes("pdf");
      else if (typeFilter === "CODE") matchesType = f.mimeType.includes("json") || f.mimeType.includes("code");
      return matchesSearch && matchesType;
    });
  }, [files, searchQuery, typeFilter]);

  // Upload handler
  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setIsUploading(true);
    const toastId = toast.loading(`Uploading ${selected.name}...`);

    try {
      let fileToUpload = selected;
      if (selected.type.startsWith("image/") && selected.size > 2.5 * 1024 * 1024) {
        toast.loading("Optimizing image for fast upload...", { id: toastId });
        try {
          fileToUpload = await optimizeImageForUpload(selected, 2048, 0.88);
        } catch {
          fileToUpload = selected;
        }
      }

      const formData = new FormData();
      formData.append("file", fileToUpload);

      const res = await uploadFileAction(formData);
      if (res.success) {
        toast.success(res.message, { id: toastId });
        router.refresh();
      } else {
        toast.error(res.error, { id: toastId });
      }
    } catch (err: any) {
      console.error("[handleFileChange]", err);
      toast.error(err?.message || "Upload failed. Please try again.", { id: toastId });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  // Delete handler
  async function handleDelete(file: FileItem) {
    setDeletingId(file.id);
    try {
      const res = await deleteFileAction(file.id);
      if (res.success) {
        toast.success(res.message);
        router.refresh();
      } else {
        toast.error(res.error);
      }
    } catch {
      toast.error("Failed to delete file");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Top Filter and Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search uploaded and generated assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 rounded-xl bg-card border-border/80 focus:border-primary/60 text-sm"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: "ALL", label: `All (${files.length})` },
              { id: "IMAGE", label: "Images" },
              { id: "PDF", label: "PDFs" },
              { id: "VIDEO", label: "Videos" },
            ].map((tab) => (
              <Button
                key={tab.id}
                variant={typeFilter === tab.id ? "default" : "outline"}
                size="sm"
                onClick={() => setTypeFilter(tab.id)}
                className={`rounded-xl text-xs font-bold h-9 shrink-0 ${
                  typeFilter === tab.id ? "gradient-btn text-white" : ""
                }`}
              >
                {tab.label}
              </Button>
            ))}
          </div>
        </div>

        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="gradient-btn text-white dark:text-[#01140e] font-black h-11 px-5 rounded-xl shadow-lg shadow-emerald-500/20 shrink-0 gap-2"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Uploading...
            </>
          ) : (
            <>
              <UploadCloud className="h-4 w-4" /> Upload File
            </>
          )}
        </Button>
      </div>

      {/* Files Table / Empty State */}
      {filteredFiles.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center border-dashed border-2 border-border/60 max-w-xl mx-auto my-8">
          <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-4 shadow-inner">
            <HardDrive className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-black text-foreground">No files in your cloud storage</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-6 max-w-sm mx-auto font-medium">
            {searchQuery
              ? `No files match "${searchQuery}". Try a different keyword.`
              : "Upload images, videos, documents, or AI assets to store them securely in your vault."}
          </p>
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="gradient-btn text-white dark:text-[#01140e] font-bold rounded-xl h-11 px-6 gap-2"
          >
            <UploadCloud className="h-4 w-4" /> Upload First File
          </Button>
        </div>
      ) : (
        <Card className="glass-card border-border/70 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/20 border-b border-border/50">
                <tr>
                  <th className="px-3 sm:px-6 py-3 font-black">Asset Name</th>
                  <th className="hidden sm:table-cell px-3 sm:px-6 py-3 font-black">Format</th>
                  <th className="px-3 sm:px-6 py-3 font-black">Size</th>
                  <th className="hidden md:table-cell px-3 sm:px-6 py-3 font-black">Uploaded</th>
                  <th className="px-3 sm:px-6 py-3 font-black text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {filteredFiles.map((file) => (
                  <tr
                    key={file.id}
                    className="hover:bg-muted/15 transition-colors group"
                  >
                    <td className="px-3 sm:px-6 py-3 font-bold text-foreground flex items-center gap-2.5 sm:gap-3">
                      <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-tr from-card to-muted border border-border/60 flex items-center justify-center shrink-0">
                        {getFileIcon(file.mimeType)}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate font-bold text-foreground text-xs sm:text-sm max-w-[140px] sm:max-w-xs md:max-w-md">
                          {file.originalName}
                        </div>
                        {file.project && (
                          <span className="text-[10px] text-primary font-bold">
                            in {file.project.name}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="hidden sm:table-cell px-3 sm:px-6 py-3 text-xs font-semibold text-muted-foreground">
                      <Badge variant="outline" className="text-[10px] uppercase font-bold px-2 py-0.5 border-border/60">
                        {file.mimeType.split("/")[1] || "file"}
                      </Badge>
                    </td>

                    <td className="px-3 sm:px-6 py-3 text-xs font-medium text-muted-foreground whitespace-nowrap">
                      {formatBytes(file.sizeBytes)}
                    </td>

                    <td className="hidden md:table-cell px-3 sm:px-6 py-3 text-xs font-medium text-muted-foreground whitespace-nowrap">
                      {formatDate(file.createdAt)}
                    </td>

                    <td className="px-3 sm:px-6 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Direct Download */}
                        <a
                          href={file.url}
                          download={file.originalName}
                          target="_blank"
                          rel="noreferrer"
                          className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                          title="Download file"
                        >
                          <Download className="h-4 w-4" />
                        </a>

                        {/* Open file in new tab */}
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noreferrer"
                          className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                          title="View file"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>

                        {/* Delete Button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(file)}
                          disabled={deletingId === file.id}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                          title="Delete file"
                        >
                          {deletingId === file.id ? (
                            <Loader2 className="h-4 w-4 animate-spin text-destructive" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
