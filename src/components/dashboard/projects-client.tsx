"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  FolderOpen, Plus, MoreVertical, LayoutGrid, Clock,
  Search, Edit3, Trash2, FolderPlus, Loader2, X, Tag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { createProjectAction, updateProjectAction, deleteProjectAction } from "@/actions/projects";

interface ProjectItem {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  createdAt: Date;
  updatedAt: Date;
  files: any[];
}

interface ProjectsClientProps {
  initialProjects: ProjectItem[];
}

const CATEGORIES = [
  "General",
  "AI Content",
  "Image Studio",
  "Video Production",
  "PDF Documents",
  "Dev Utilities",
];

export function ProjectsClient({ initialProjects }: ProjectsClientProps) {
  const router = useRouter();
  const [projects, setProjects] = React.useState<ProjectItem[]>(initialProjects);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("ALL");

  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [createForm, setCreateForm] = React.useState({
    name: "",
    description: "",
    category: "General",
  });
  const [createLoading, setCreateLoading] = React.useState(false);

  // Edit Modal State
  const [editItem, setEditItem] = React.useState<ProjectItem | null>(null);
  const [editForm, setEditForm] = React.useState({
    name: "",
    description: "",
    category: "General",
  });
  const [editLoading, setEditLoading] = React.useState(false);

  // Delete Modal State
  const [deleteTarget, setDeleteTarget] = React.useState<ProjectItem | null>(null);
  const [deleteLoading, setDeleteLoading] = React.useState(false);

  // Active Dropdown
  const [activeMenuId, setActiveMenuId] = React.useState<string | null>(null);

  // Sync state if initialProjects changes (on server revalidate)
  React.useEffect(() => {
    setProjects(initialProjects);
  }, [initialProjects]);

  // Filter projects
  const filteredProjects = React.useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCat = selectedCategory === "ALL" || p.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [projects, searchQuery, selectedCategory]);

  // Handle Create
  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!createForm.name.trim()) {
      toast.error("Project name is required");
      return;
    }
    setCreateLoading(true);
    try {
      const res = await createProjectAction(createForm);
      if (res.success) {
        toast.success(res.message);
        setIsCreateOpen(false);
        setCreateForm({ name: "", description: "", category: "General" });
        router.refresh();
      } else {
        toast.error(res.error);
      }
    } catch {
      toast.error("Failed to create project");
    } finally {
      setCreateLoading(false);
    }
  }

  // Handle Edit
  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editItem || !editForm.name.trim()) return;
    setEditLoading(true);
    try {
      const res = await updateProjectAction({
        id: editItem.id,
        name: editForm.name,
        description: editForm.description,
        category: editForm.category,
      });
      if (res.success) {
        toast.success(res.message);
        setEditItem(null);
        router.refresh();
      } else {
        toast.error(res.error);
      }
    } catch {
      toast.error("Failed to update project");
    } finally {
      setEditLoading(false);
    }
  }

  // Handle Delete
  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await deleteProjectAction(deleteTarget.id);
      if (res.success) {
        toast.success(res.message);
        setDeleteTarget(null);
        router.refresh();
      } else {
        toast.error(res.error);
      }
    } catch {
      toast.error("Failed to delete project");
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Top Controls: Search & Category Filter */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search workspaces by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 rounded-xl bg-card border-border/80 focus:border-primary/60 text-sm"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <Button
              variant={selectedCategory === "ALL" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("ALL")}
              className={`rounded-xl text-xs font-bold h-9 shrink-0 ${
                selectedCategory === "ALL" ? "gradient-btn text-white" : ""
              }`}
            >
              All ({projects.length})
            </Button>
            {CATEGORIES.slice(0, 4).map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-xl text-xs font-bold h-9 shrink-0 ${
                  selectedCategory === cat ? "gradient-btn text-white" : ""
                }`}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        <Button
          onClick={() => setIsCreateOpen(true)}
          className="gradient-btn text-white dark:text-[#01140e] font-black h-11 px-5 rounded-xl shadow-lg shadow-emerald-500/20 shrink-0 gap-2"
        >
          <Plus className="h-4 w-4" /> New Project
        </Button>
      </div>

      {/* Grid of Projects */}
      {filteredProjects.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center border-dashed border-2 border-border/60 max-w-xl mx-auto my-8">
          <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-4 shadow-inner">
            <FolderPlus className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-black text-foreground">No projects found</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-6 max-w-sm mx-auto font-medium">
            {searchQuery
              ? `No workspaces match "${searchQuery}". Try another keyword or clear search.`
              : "Create your first dedicated workspace to organize AI prompts, media files, and tool outputs."}
          </p>
          <Button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("ALL");
              setIsCreateOpen(true);
            }}
            className="gradient-btn text-white dark:text-[#01140e] font-bold rounded-xl h-11 px-6 gap-2"
          >
            <Plus className="h-4 w-4" /> Create First Project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Card
              key={project.id}
              className="glass-card border-border/70 hover:border-primary/40 rounded-2xl transition-all duration-200 group relative hover:shadow-xl hover:shadow-emerald-500/5"
            >
              <CardHeader className="flex flex-row items-start justify-between pb-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-emerald-500/15 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                  <FolderOpen className="h-6 w-6" />
                </div>

                <div className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setActiveMenuId(activeMenuId === project.id ? null : project.id)}
                    className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>

                  {/* Dropdown Menu */}
                  {activeMenuId === project.id && (
                    <div className="absolute right-0 top-9 w-36 rounded-xl bg-popover/95 backdrop-blur-md border border-border shadow-xl z-30 py-1 text-xs animate-in fade-in zoom-in-95">
                      <button
                        onClick={() => {
                          setEditItem(project);
                          setEditForm({
                            name: project.name,
                            description: project.description || "",
                            category: project.category || "General",
                          });
                          setActiveMenuId(null);
                        }}
                        className="w-full text-left px-3.5 py-2 hover:bg-muted/50 flex items-center gap-2 font-bold text-foreground"
                      >
                        <Edit3 className="h-3.5 w-3.5 text-primary" /> Rename / Edit
                      </button>
                      <button
                        onClick={() => {
                          setDeleteTarget(project);
                          setActiveMenuId(null);
                        }}
                        className="w-full text-left px-3.5 py-2 hover:bg-red-500/10 text-red-400 flex items-center gap-2 font-bold"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <CardTitle className="text-lg font-bold text-foreground group-hover:text-primary transition-colors truncate">
                      {project.name}
                    </CardTitle>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 min-h-[32px] font-medium">
                    {project.description || "No project description added."}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border/40 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <LayoutGrid className="h-3.5 w-3.5 text-primary" />
                    <span>{project.files?.length ?? 0} files</span>
                  </div>

                  <Badge variant="outline" className="text-[10px] font-bold px-2 py-0.5 rounded-lg border-border/60">
                    {project.category || "General"}
                  </Badge>
                </div>

                <div className="text-[11px] text-muted-foreground/70 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>Updated {formatDate(project.updatedAt)}</span>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Quick Create Card */}
          <button
            onClick={() => setIsCreateOpen(true)}
            className="rounded-2xl border-2 border-dashed border-border/60 hover:border-primary/50 bg-white/[0.01] hover:bg-primary/[0.03] transition-all p-6 flex flex-col items-center justify-center min-h-[200px] text-center group"
          >
            <div className="h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Plus className="h-6 w-6" />
            </div>
            <h4 className="font-bold text-foreground text-sm">Create New Project</h4>
            <p className="text-xs text-muted-foreground mt-1">Start a fresh workspace</p>
          </button>
        </div>
      )}

      {/* ── CREATE PROJECT MODAL ── */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card rounded-2xl p-6 sm:p-8 max-w-md w-full border border-border/80 shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setIsCreateOpen(false)}
              className="absolute top-5 right-5 text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-xl font-black text-foreground mb-1">Create New Workspace</h3>
            <p className="text-xs text-muted-foreground mb-6 font-medium">
              Organize your creative tool generations, video clips, and documents.
            </p>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-foreground mb-1 block">Project Title *</label>
                <Input
                  required
                  placeholder="e.g. YouTube Video Campaign"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className="rounded-xl h-11"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-foreground mb-1 block">Category</label>
                <select
                  value={createForm.category}
                  onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
                  className="w-full h-11 rounded-xl bg-background border border-input px-3 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-foreground mb-1 block">Description (Optional)</label>
                <textarea
                  placeholder="Brief summary of workflows or goals..."
                  rows={3}
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  className="w-full rounded-xl bg-background border border-input p-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none font-medium"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                  disabled={createLoading}
                  className="flex-1 rounded-xl h-11"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createLoading}
                  className="flex-1 gradient-btn text-white dark:text-[#01140e] font-bold rounded-xl h-11"
                >
                  {createLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Project"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── EDIT PROJECT MODAL ── */}
      {editItem && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card rounded-2xl p-6 sm:p-8 max-w-md w-full border border-border/80 shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setEditItem(null)}
              className="absolute top-5 right-5 text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-xl font-black text-foreground mb-1">Edit Project</h3>
            <p className="text-xs text-muted-foreground mb-6 font-medium">Update title, category or notes.</p>

            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-foreground mb-1 block">Project Title *</label>
                <Input
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="rounded-xl h-11"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-foreground mb-1 block">Category</label>
                <select
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  className="w-full h-11 rounded-xl bg-background border border-input px-3 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-foreground mb-1 block">Description</label>
                <textarea
                  rows={3}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full rounded-xl bg-background border border-input p-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none font-medium"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditItem(null)}
                  disabled={editLoading}
                  className="flex-1 rounded-xl h-11"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={editLoading}
                  className="flex-1 gradient-btn text-white dark:text-[#01140e] font-bold rounded-xl h-11"
                >
                  {editLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRMATION MODAL ── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card rounded-2xl p-6 sm:p-8 max-w-sm w-full border border-red-500/30 shadow-2xl relative animate-in fade-in zoom-in-95">
            <div className="h-12 w-12 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center mb-4">
              <Trash2 className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-black text-foreground mb-1">Delete &quot;{deleteTarget.name}&quot;?</h3>
            <p className="text-xs text-muted-foreground mb-6 font-medium">
              This action cannot be undone. Associated files will be unlinked from this workspace.
            </p>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setDeleteTarget(null)}
                disabled={deleteLoading}
                className="flex-1 rounded-xl h-11"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteLoading}
                className="flex-1 rounded-xl h-11 font-bold"
              >
                {deleteLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete Project"}
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
