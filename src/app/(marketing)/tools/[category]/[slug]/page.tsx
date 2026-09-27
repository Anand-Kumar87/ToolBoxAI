import { notFound, redirect } from "next/navigation";
import { TOOLS_REGISTRY } from "@/config/tools";
import { AI_TOOLS_CONFIG } from "@/config/ai-tools";
import { IMAGE_TOOLS_CONFIG } from "@/config/image-tools";
import { PDF_TOOLS_CONFIG } from "@/config/pdf-tools";
import { getServerAuthSession } from "@/lib/auth";
import { AIToolClient } from "@/components/tools/ai-tool-client";
import { ImageToolClient } from "@/components/tools/image-tool-client";
import { PdfToolClient } from "@/components/tools/pdf-tool-client";
import { DevToolClient } from "@/components/tools/dev-tool-client";
import { VideoToolClient } from "@/components/tools/video-tool-client";
import { checkIntelToolAuthorization } from "@/actions/intel";
import { checkUserAccessAndLimits } from "@/services/usage";
import { ChevronLeft, Lock, Sparkles } from "lucide-react";
import Link from "next/link";

export async function generateMetadata({ params }: { params: Promise<{ category: string; slug: string }> }) {
  const { category, slug } = await params;
  const tool = TOOLS_REGISTRY.find((t) => t.slug === slug && t.category.toLowerCase() === category.toLowerCase());

  if (!tool) return { title: "Tool Not Found" };
  return { title: `${tool.name} | Korevante Studio`, description: tool.description };
}

export default async function ToolPage({ params }: { params: Promise<{ category: string; slug: string }> }) {
  const { category, slug } = await params;

  const tool = TOOLS_REGISTRY.find(
    (t) => t.slug === slug && t.category.toLowerCase() === category.toLowerCase()
  );

  if (!tool) {
    notFound();
  }

  const session = await getServerAuthSession();
  if (!session?.user) {
    redirect(`/signup?callbackUrl=/tools/${category}/${slug}`);
  }

  const userId = (session.user as any).id as string;

  // Security Gate: Check Admin clearance for restricted intelligence tools
  if (tool.restrictedToAdmin) {
    const isAuthorized = await checkIntelToolAuthorization(userId);
    if (!isAuthorized) {
      return (
        <div className="container mx-auto max-w-4xl px-4 py-20 text-center">
          <div className="p-10 rounded-3xl bg-amber-500/10 border border-amber-500/20 max-w-xl mx-auto space-y-5 shadow-lg">
            <div className="h-16 w-16 mx-auto rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center">
              <Lock className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Restricted Administrative Tool</h1>
              <p className="text-sm text-muted-foreground leading-relaxed mt-2">
                <strong>{tool.name}</strong> is an internal intelligence suite restricted to System Administrators and authorized delegates.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/tools"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm"
              >
                <ChevronLeft className="h-4 w-4" /> Return to Tools Directory
              </Link>
            </div>
          </div>
        </div>
      );
    }
  }

  // Plan & Trial Access Gatekeeper: Check if user's subscription or trial tier permits using this tool
  const access = await checkUserAccessAndLimits(userId, tool.slug);
  if (!access.allowed) {
    const targetPlan = access.targetPlan || "PRO";
    const isExpired = access.isTrialExpired;

    return (
      <div className="container mx-auto max-w-4xl px-4 py-16 text-center">
        <div className="p-8 sm:p-12 rounded-3xl bg-card border border-border/80 max-w-xl mx-auto space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

          <div className="h-20 w-20 mx-auto rounded-3xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/10">
            <Lock className="h-10 w-10" />
          </div>

          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {isExpired ? "Free Trial Expired" : `${tool.planRequired} Plan Required`}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground">
              {isExpired ? "7-Day Free Trial Ended" : `Unlock ${tool.name}`}
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
              {access.reason}
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={isExpired ? "/pricing" : `/pricing?plan=${targetPlan.toLowerCase()}`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles className="h-4 w-4" />
              {isExpired ? "View Plans & Subscribe" : `Upgrade to ${targetPlan} Plan`}
            </Link>
            <Link
              href="/tools"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-muted/60 text-muted-foreground hover:text-foreground text-sm font-semibold hover:bg-muted transition-all"
            >
              <ChevronLeft className="h-4 w-4" /> Explore Basic Tools
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isAI = tool.category === "AI";
  const aiConfig = isAI && AI_TOOLS_CONFIG[tool.slug] ? { slug: AI_TOOLS_CONFIG[tool.slug].slug, fields: AI_TOOLS_CONFIG[tool.slug].fields } : null;

  const isImage = tool.category === "IMAGE";
  const imageConfig = isImage ? IMAGE_TOOLS_CONFIG[tool.slug] : null;

  const isPdf = tool.category === "PDF";
  const pdfConfig = isPdf ? PDF_TOOLS_CONFIG[tool.slug] : null;

  const isVideo = tool.category === "VIDEO";
  const isDevOrProd = tool.category === "DEVELOPER" || tool.category === "PRODUCTIVITY" || tool.category === "UTILITIES";

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 min-h-[calc(100vh-140px)]">
      {/* Back Button & Breadcrumbs */}
      <div className="mb-8">
        <Link href="/tools" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Tools Directory
        </Link>
      </div>

      {/* Tool Header */}
      <div className="mb-10 pb-6 border-b border-border/40">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-foreground">{tool.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full border border-primary/20 bg-primary/10 text-primary text-xs font-semibold uppercase">
                {tool.planRequired} Plan
              </span>
            </div>
            <p className="text-muted-foreground text-lg">{tool.description}</p>
          </div>
        </div>
      </div>

      {/* Tool Workspaces */}
      {isAI && aiConfig ? (
        <AIToolClient tool={tool} config={aiConfig} />
      ) : isImage && imageConfig ? (
        <ImageToolClient tool={tool} config={imageConfig} />
      ) : isPdf && pdfConfig ? (
        <PdfToolClient tool={tool} config={pdfConfig} />
      ) : isVideo ? (
        <VideoToolClient tool={tool} />
      ) : isDevOrProd ? (
        <DevToolClient tool={tool} />
      ) : (
        <div className="text-center py-24 bg-muted/20 border border-dashed border-border/60 rounded-3xl">
          <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h2 className="text-2xl font-semibold text-foreground mb-2">Studio in Development</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            The {tool.category} processing studio for <strong>{tool.name}</strong> is currently being provisioned. Check back soon.
          </p>
        </div>
      )}
    </div>
  );
}
