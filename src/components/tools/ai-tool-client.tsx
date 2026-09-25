"use client";

import * as React from "react";
import { toast } from "sonner";
import { Loader2, Wand2, Copy, CheckCircle2, RotateCcw, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ToolDefinition } from "@/types";
import { AIToolConfig } from "@/config/ai-tools";
import { generateAiContentAction } from "@/actions/ai";

interface AIToolClientProps {
  tool: ToolDefinition;
  config: Omit<AIToolConfig, "generatePrompt">;
}

export function AIToolClient({ tool, config }: AIToolClientProps) {
  const [formData, setFormData] = React.useState<Record<string, string>>({});
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);

  // Initialize form data
  React.useEffect(() => {
    const initial: Record<string, string> = {};
    config.fields.forEach((f) => {
      if (f.type === "select" && f.options?.length) {
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

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    for (const field of config.fields) {
      if (field.required && !formData[field.name]?.trim()) {
        toast.error(`${field.label} is required.`);
        return;
      }
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await generateAiContentAction(tool.slug, formData);
      if (response.success && response.data) {
        setResult(response.data);
        toast.success("Content generated successfully!");
      } else {
        toast.error(response.error || "Failed to generate content.");
      }
    } catch (err) {
      toast.error("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReset = () => {
    const resetData: Record<string, string> = {};
    config.fields.forEach((f) => {
      if (f.type === "select" && f.options?.length) {
        resetData[f.name] = f.options[0];
      } else {
        resetData[f.name] = "";
      }
    });
    setFormData(resetData);
    setResult(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* ── Left Column: Configuration Form ── */}
      <Card className="lg:col-span-4 border-border/80 shadow-sm top-24 sticky">
        <CardContent className="p-6">
          <form onSubmit={handleGenerate} className="space-y-6">
            <div className="space-y-5">
              {config.fields.map((field) => (
                <div key={field.name} className="space-y-1.5">
                  <label className="text-sm font-semibold text-foreground flex items-center gap-1">
                    {field.label}
                    {field.required && <span className="text-destructive">*</span>}
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

                  {field.type === "textarea" && (
                    <textarea
                      placeholder={field.placeholder}
                      value={formData[field.name] || ""}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      disabled={loading}
                      rows={field.name === "history" || field.name === "features" ? 6 : 3}
                      className="w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none disabled:opacity-50"
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

            <div className="pt-2 flex gap-3">
              <Button
                type="submit"
                disabled={loading}
                variant="gradient"
                className="w-full gap-2 shadow-lg shadow-primary/20"
              >
                {loading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</>
                ) : (
                  <><Wand2 className="h-4 w-4" /> Generate Result</>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* ── Right Column: Output Result ── */}
      <Card className="lg:col-span-8 border-border/80 shadow-sm min-h-[500px] flex flex-col">
        {/* Result Header */}
        <div className="h-14 border-b border-border/50 flex items-center justify-between px-6 bg-muted/10 rounded-t-xl shrink-0">
          <h3 className="text-sm font-semibold text-foreground">Output Result</h3>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              disabled={loading || (!result && Object.values(formData).every((v) => !v))}
              className="h-8 px-2 text-muted-foreground hover:text-foreground"
              title="Reset Form"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            {result && (result.startsWith("data:image/") || result.startsWith("http")) ? (
              <a
                href={result}
                download="toolverse-ai-image.jpg"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors shadow-sm"
              >
                <Download className="h-3.5 w-3.5" /> Download
              </a>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                disabled={!result}
                className="h-8 gap-1.5"
              >
                {copied ? (
                  <><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Copied</>
                ) : (
                  <><Copy className="h-3.5 w-3.5" /> Copy Text</>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Result Body */}
        <CardContent className="p-0 flex-1 relative flex flex-col">
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/50 backdrop-blur-sm z-10">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <Wand2 className="h-6 w-6 text-primary animate-pulse" />
              </div>
              <p className="text-sm font-medium text-foreground">AI is crafting your content...</p>
              <p className="text-xs text-muted-foreground mt-1">This usually takes 3-5 seconds</p>
            </div>
          ) : result ? (
            result.startsWith("data:image/") || result.startsWith("http") ? (
              <div className="p-6 flex flex-col items-center justify-center flex-1 space-y-4">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-border/80 max-h-[500px]">
                  <img
                    src={result}
                    alt="AI Generated Output"
                    className="object-contain max-h-[480px] w-auto rounded-xl"
                  />
                </div>
              </div>
            ) : (
              <div className="p-6 overflow-y-auto prose prose-sm dark:prose-invert max-w-none flex-1 whitespace-pre-wrap font-sans leading-relaxed text-foreground/90">
                {result}
              </div>
            )
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground opacity-60">
              <Wand2 className="h-12 w-12 mb-4 opacity-20" />
              <p className="text-sm">Fill out the configuration on the left</p>
              <p className="text-sm">and click generate to see the magic.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
