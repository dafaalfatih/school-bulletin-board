import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { SiteHeader } from "@/components/SiteHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/announcement/$id")({
  component: AnnouncementDetail,
});

type Category = "akademik" | "osis" | "umum" | "acara";
type Announcement = {
  id: string;
  title: string;
  content: string;
  category: Category;
  created_at: string;
  updated_at: string;
};

const CATEGORY_META: Record<Category, { label: string; className: string }> = {
  akademik: { label: "Akademik", className: "bg-[oklch(var(--cat-akademik))] text-white" },
  osis: { label: "OSIS", className: "bg-[oklch(var(--cat-osis))] text-white" },
  umum: { label: "Umum", className: "bg-[oklch(var(--cat-umum))] text-white" },
  acara: { label: "Acara", className: "bg-[oklch(var(--cat-acara))] text-white" },
};

function AnnouncementDetail() {
  const { id } = Route.useParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [item, setItem] = useState<Announcement | null | "not_found">(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate({ to: "/auth" });
      return;
    }
    supabase
      .from("announcements")
      .select("id,title,content,category,created_at,updated_at")
      .eq("id", id)
      .maybeSingle()
      .then(({ data }) => setItem((data as Announcement | null) ?? "not_found"));
  }, [id, user, authLoading, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
          <Link to="/">
            <ArrowLeft className="mr-1 h-4 w-4" /> Kembali ke daftar
          </Link>
        </Button>

        {item === null ? (
          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : item === "not_found" ? (
          <div className="rounded-xl border border-dashed py-16 text-center">
            <p className="text-sm text-muted-foreground">
              Pengumuman tidak ditemukan atau sudah dihapus.
            </p>
          </div>
        ) : (
          <article className="rounded-2xl border bg-card p-6 shadow-[var(--shadow-card)] sm:p-8">
            <div className="flex flex-wrap items-center gap-3">
              <Badge className={CATEGORY_META[item.category].className}>
                {CATEGORY_META[item.category].label}
              </Badge>
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {new Date(item.created_at).toLocaleDateString("id-ID", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
            <h1 className="mt-3 text-2xl font-bold sm:text-3xl">{item.title}</h1>
            <div className="mt-6 whitespace-pre-wrap text-base leading-relaxed text-foreground">
              {item.content}
            </div>
            {item.updated_at !== item.created_at && (
              <p className="mt-6 border-t pt-4 text-xs text-muted-foreground">
                Terakhir diperbarui:{" "}
                {new Date(item.updated_at).toLocaleString("id-ID")}
              </p>
            )}
          </article>
        )}
      </main>
    </div>
  );
}