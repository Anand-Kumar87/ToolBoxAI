"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TOOLS_REGISTRY } from "@/config/tools";
import { ToolCategory } from "@/types";
import { cn } from "@/lib/utils";
import * as LucideIcons from "lucide-react";

const CATEGORIES: { label: string; value: ToolCategory | "ALL" }[] = [
  { label: "All Tools", value: "ALL" },
  { label: "AI", value: "AI" },
  { label: "Image", value: "IMAGE" },
  { label: "Video", value: "VIDEO" },
  { label: "PDF", value: "PDF" },
  { label: "Developer", value: "DEVELOPER" },
  { label: "Productivity", value: "PRODUCTIVITY" },
  { label: "Utilities", value: "UTILITIES" },
];

const PLAN_COLORS: Record<string, string> = {
  BASIC: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  PRO: "text-teal-400 bg-teal-500/10 border-teal-500/20",
  PREMIUM: "text-emerald-400 bg-emerald-500/15 border-emerald-500/30",
};

const CATEGORY_COLORS: Partial<Record<ToolCategory, string>> = {
  AI: "from-emerald-500 to-teal-500",
  IMAGE: "from-pink-500 to-rose-500",
  VIDEO: "from-purple-500 to-fuchsia-500",
  PDF: "from-amber-500 to-orange-500",
  DEVELOPER: "from-emerald-500 to-teal-500",
  PRODUCTIVITY: "from-teal-500 to-cyan-500",
  UTILITIES: "from-cyan-500 to-emerald-500",
};

import { getClientUserIntelAccessAction } from "@/actions/intel";

// Next.js 15 Note: `useSearchParams` in client components must be wrapped in `Suspense`.
function ToolsContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  
  const [activeCategory, setActiveCategory] = React.useState<ToolCategory | "ALL">(
    (categoryParam as ToolCategory) || "ALL"
  );
  const [search, setSearch] = React.useState("");
  const [canAccessIntel, setCanAccessIntel] = React.useState(false);

  // Check if current user is admin or has delegated clearance for restricted tools
  React.useEffect(() => {
    getClientUserIntelAccessAction().then((res) => {
      setCanAccessIntel(res.canAccessIntel);
    });
  }, []);

  // Update active category if URL changes (e.g., clicking sidebar links)
  React.useEffect(() => {
    if (categoryParam) {
      setActiveCategory(categoryParam as ToolCategory);
    }
  }, [categoryParam]);

  const filtered = React.useMemo(() => {
    return TOOLS_REGISTRY.filter((tool) => {
      // Hide restricted administrative intelligence suite from non-authorized users
      if (tool.restrictedToAdmin && !canAccessIntel) {
        return false;
      }

      const matchCat = activeCategory === "ALL" || tool.category === activeCategory;
      const matchSearch =
        !search ||
        tool.name.toLowerCase().includes(search.toLowerCase()) ||
        tool.description.toLowerCase().includes(search.toLowerCase()) ||
        tool.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));

      return matchCat && matchSearch;
    });
  }, [activeCategory, search, canAccessIntel]);

  const groupedByCategory = React.useMemo(() => {
    if (activeCategory !== "ALL") return null;
    const groups: Partial<Record<ToolCategory, typeof filtered>> = {};
    for (const tool of filtered) {
      if (!groups[tool.category]) groups[tool.category] = [];
      groups[tool.category]!.push(tool);
    }
    return groups;
  }, [filtered, activeCategory]);

  return (
    <div className="flex flex-col">
      {/* Header */}
      <section className="py-16 md:py-20 border-b border-border/40 bg-gradient-to-b from-muted/20 to-transparent">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="outline" className="mb-4 text-xs uppercase tracking-wider">
            50+ Tools
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-4">
            The Complete{" "}
            <span className="gradient-text-mint">
              Tool Directory
            </span>
          </h1>
          <p className="text-muted-foreground text-base max-w-xl mx-auto mb-8">
            Browse, search, and filter all 50+ tools. Every tool is production-ready and connected to the usage & billing system.
          </p>

          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="search"
              placeholder="Search tools by name, category, or tag..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-12 pl-10 pr-4 rounded-xl border border-input bg-background/80 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>
        </div>
      </section>

      {/* Category Filters */}
      <section className="sticky top-16 z-30 bg-background/90 backdrop-blur-lg border-b border-border/60">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto py-3 scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={cn(
                  "flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 border",
                  activeCategory === cat.value
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground bg-background"
                )}
              >
                {cat.label}
                {cat.value !== "ALL" && (
                  <span className="ml-1.5 text-xs opacity-70">
                    ({TOOLS_REGISTRY.filter((t) => t.category === cat.value).length})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="py-12">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{filtered.length}</span> tools
              {search && <> for &ldquo;<span className="font-semibold text-primary">{search}</span>&rdquo;</>}
            </p>
            {search && (
              <button
                onClick={() => setSearch("")}
                className="text-xs text-primary hover:underline"
              >
                Clear search
              </button>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-20 space-y-3">
              <Sparkles className="h-10 w-10 text-muted-foreground mx-auto" />
              <p className="text-lg font-semibold text-foreground">No tools found</p>
              <p className="text-sm text-muted-foreground">Try a different search term or category.</p>
            </div>
          ) : activeCategory !== "ALL" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((tool) => (
                <ToolCard key={tool.slug} tool={tool} />
              ))}
            </div>
          ) : (
            <div className="space-y-14">
              {Object.entries(groupedByCategory || {}).map(([category, tools]) => (
                <div key={category}>
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-lg bg-gradient-to-tr ${CATEGORY_COLORS[category as ToolCategory] || "from-slate-500 to-gray-500"} flex items-center justify-center text-white`}>
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <div>
                        <h2 className="font-bold text-lg text-foreground">{category} Tools</h2>
                        <p className="text-xs text-muted-foreground">{tools!.length} tools available</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveCategory(category as ToolCategory)}
                      className="text-xs text-primary hover:underline"
                    >
                      View all &rarr;
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {tools!.slice(0, 8).map((tool) => (
                      <ToolCard key={tool.slug} tool={tool} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function DynamicIcon({ name }: { name: string }) {
  const Icon = (LucideIcons as any)[name] || LucideIcons.Wrench;
  return <Icon className="h-5 w-5" />;
}

function ToolCard({ tool }: { tool: (typeof TOOLS_REGISTRY)[number] }) {
  const href = `/tools/${tool.category.toLowerCase()}/${tool.slug}`;

  return (
    <Link href={href} className="group">
      <Card className="h-full border-border/70 hover:border-primary/50 hover:shadow-md transition-all duration-200 cursor-pointer">
        <CardHeader className="space-y-3 pb-3">
          <div className="flex items-start justify-between">
            <div className={`h-10 w-10 rounded-xl bg-gradient-to-tr ${CATEGORY_COLORS[tool.category] || "from-slate-500 to-gray-500"} flex items-center justify-center text-white shadow-sm`}>
              <DynamicIcon name={tool.icon} />
            </div>
            <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full border", PLAN_COLORS[tool.planRequired])}>
              {tool.planRequired}
            </span>
          </div>
          <CardTitle className="text-sm font-semibold leading-tight group-hover:text-primary transition-colors">
            {tool.name}
          </CardTitle>
          <CardDescription className="text-xs leading-relaxed line-clamp-2">
            {tool.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 pb-4 px-6">
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="text-xs capitalize">
              {tool.category.toLowerCase()}
            </Badge>
            {tool.isFeatured && (
              <span className="text-xs text-amber-500 font-medium flex items-center gap-0.5">
                ★ Featured
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function ToolsPage() {
  return (
    <React.Suspense fallback={
      <div className="flex items-center justify-center h-screen bg-background">
        <Sparkles className="h-8 w-8 animate-pulse text-primary" />
      </div>
    }>
      <ToolsContent />
    </React.Suspense>
  );
}
