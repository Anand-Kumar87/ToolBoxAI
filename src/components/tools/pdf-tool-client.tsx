"use client";

import * as React from "react";
import { toast } from "sonner";
import { Loader2, Download, UploadCloud, FileText, RefreshCcw, File as FileIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ToolDefinition } from "@/types";
import { PdfToolConfig } from "@/config/pdf-tools";
import { processPdfAction } from "@/actions/pdf";
import { optimizeImageForUpload } from "@/lib/image-optimizer-client";

interface PdfToolClientProps {
  tool: ToolDefinition;
  config: PdfToolConfig;
}

export function PdfToolClient({ tool, config }: PdfToolClientProps) {
  const [formData, setFormData] = React.useState<Record<string, string>>({});
  const [files, setFiles] = React.useState<File[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [resultData, setResultData] = React.useState<string | null>(null);
  const [isJsonResult, setIsJsonResult] = React.useState(false);

  React.useEffect(() => {
    const initial: Record<string, string> = {};
    config.fields.forEach((f) => {
      if (f.defaultValue !== undefined) {
        initial[f.name] = String(f.defaultValue);
      } else if (f.type === "select" && f.options?.length) {
        initial[f.name] = f.options[0];
      } else {
        initial[f.name] = "";
      }
    });
    setFormData(initial);
  }, [config.fields]);

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length > 0) {
      if (!config.allowMultipleFiles && selected.length > 1) {
        toast.error("This tool only accepts a single file.");
        setFiles([selected[0]]);
      } else {
        setFiles((prev) => [...prev, ...selected]);
      }
      setResultData(null);
    }
    // reset input
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (files.length === 0) {
      toast.error("Please upload at least one file first.");
      return;
    }

    setLoading(true);
    setResultData(null);
    setIsJsonResult(false);

    try {
      const formPayload = new FormData();
      for (const f of files) {
        if (f.type.startsWith("image/")) {
          const safeImg = await optimizeImageForUpload(f, 2048, 0.85);
          formPayload.append("files", safeImg);
        } else {
          formPayload.append("files", f);
        }
      }

      Object.entries(formData).forEach(([key, val]) => {
        formPayload.append(key, val);
      });

      const response = await processPdfAction(tool.slug, formPayload);
      if (response.success && response.data) {
        setResultData(response.data);
        if (response.isJson) setIsJsonResult(true);
        toast.success("Processed successfully!");
      } else {
        toast.error(response.error || "Failed to process PDF.");
      }
    } catch (err: any) {
      console.error("[PdfToolClient]", err);
      toast.error(err?.message || "An unexpected error occurred while processing PDF.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (resultData && !isJsonResult) {
      const link = document.createElement("a");
      link.href = resultData;
      link.download = `${tool.slug}-result-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Download started!");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* ── Left Column: Config Form ── */}
      <Card className="lg:col-span-4 border-border/80 shadow-sm top-24 sticky">
        <CardContent className="p-6">
          <form onSubmit={handleGenerate} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground flex items-center justify-between">
                <span>Upload File(s) <span className="text-destructive">*</span></span>
                {config.allowMultipleFiles && <span className="text-xs font-normal text-muted-foreground">Multiple allowed</span>}
              </label>
              
              <div className="relative group">
                <input
                  type="file"
                  accept={tool.slug === "image-to-pdf" ? "image/jpeg, image/png" : "application/pdf"}
                  multiple={config.allowMultipleFiles}
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className={`w-full h-24 rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-colors border-border bg-muted/20 group-hover:border-primary/50`}>
                  <UploadCloud className="h-6 w-6 mb-1 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground font-medium text-center px-4 truncate w-full">
                    Click or drag to upload {tool.slug === "image-to-pdf" ? "images" : "PDFs"}
                  </span>
                </div>
              </div>

              {/* File List */}
              {files.length > 0 && (
                <div className="mt-3 space-y-2 max-h-32 overflow-y-auto pr-1">
                  {files.map((f, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg border border-border bg-background text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <FileIcon className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                        <span className="truncate">{f.name}</span>
                      </div>
                      <button type="button" onClick={() => removeFile(i)} className="text-muted-foreground hover:text-destructive p-1">
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {config.fields.length > 0 && (
              <div className="space-y-5">
                {config.fields.map((field) => (
                  <div key={field.name} className="space-y-1.5">
                    <label className="text-sm font-semibold text-foreground flex items-center gap-1">
                      {field.label}
                    </label>

                    {field.type === "text" && (
                      <Input
                        type="text"
                        placeholder={field.placeholder}
                        value={formData[field.name] || ""}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                        disabled={loading}
                        className="bg-background/50"
                      />
                    )}

                    {field.type === "select" && field.options && (
                      <select
                        value={formData[field.name] || ""}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                        disabled={loading}
                        className="w-full h-10 rounded-xl border border-input bg-background/50 px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all disabled:opacity-50"
                      >
                        {field.options.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                ))}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading || files.length === 0}
              variant="gradient"
              className="w-full gap-2 shadow-lg shadow-primary/20"
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</>
              ) : (
                <><RefreshCcw className="h-4 w-4" /> Process Document</>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* ── Right Column: Output Result ── */}
      <Card className="lg:col-span-8 border-border/80 shadow-sm min-h-[500px] flex flex-col">
        <div className="h-14 border-b border-border/50 flex items-center justify-between px-6 bg-muted/10 rounded-t-xl shrink-0">
          <h3 className="text-sm font-semibold text-foreground">Output Preview</h3>
          {!isJsonResult && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={!resultData}
              className="h-8 gap-1.5"
            >
              <Download className="h-3.5 w-3.5" /> Download PDF
            </Button>
          )}
        </div>

        <CardContent className="p-0 flex-1 relative flex flex-col items-center justify-center min-h-[400px] bg-black/5 dark:bg-white/5 rounded-b-xl overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <RefreshCcw className="h-6 w-6 text-primary animate-spin" />
              </div>
              <p className="text-sm font-medium text-foreground">Processing Document...</p>
            </div>
          ) : resultData ? (
            isJsonResult ? (
              <div className="p-6 w-full h-full overflow-y-auto text-left">
                <pre className="text-xs text-muted-foreground bg-background p-4 rounded-lg border border-border">
                  {resultData}
                </pre>
              </div>
            ) : (
              <iframe 
                src={resultData} 
                className="w-full h-[600px] border-0"
                title="PDF Preview"
              />
            )
          ) : files.length > 0 ? (
            <div className="flex flex-col items-center justify-center text-muted-foreground">
              <FileText className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-sm">{files.length} file(s) loaded. Configure settings and click Process.</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-muted-foreground opacity-60">
              <FileText className="h-12 w-12 mb-4 opacity-20" />
              <p className="text-sm">Upload PDF(s) to see the preview here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
