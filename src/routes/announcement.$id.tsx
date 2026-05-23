import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Calendar,
  Download,
  FileText,
  ExternalLink,
  Paperclip,
  Image as ImageIcon,
  FileType2,
  Clock,
} from "lucide-react";
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
  attachment_url: string | null;
  attachment_name: string | null;
  attachment_type: string | null;
};

const CATEGORY_META: Record<Category, { label: string; className: string; accent: string }> = {
  akademik: {
    label: "Akademik",
    className: "bg-[oklch(var(--cat-akademik))] text-white",
    accent: "oklch(var(--cat-akademik))",
  },
  osis: {
    label: "OSIS",
    className: "bg-[oklch(var(--cat-osis))] text-white",
    accent: "oklch(var(--cat-osis))",
  },
  umum: {
    label: "Umum",
    className: "bg-[oklch(var(--cat-umum))] text-white",
    accent: "oklch(var(--cat-umum))",
  },
  acara: {
    label: "Acara",
    className: "bg-[oklch(var(--cat-acara))] text-white",
    accent: "oklch(var(--cat-acara))",
  },
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
      .select("id,title,content,category,created_at,updated_at,attachment_url,attachment_name,attachment_type")
      .eq("id", id)
      .maybeSingle()
      .then(({ data }) => setItem((data as Announcement | null) ?? "not_found"));
  }, [id, user, authLoading, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
        <Button asChild variant="ghost" size="sm" className="mb-6 -ml-2 group">
          <Link to="/">
            <ArrowLeft className="mr-1 h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            Kembali ke daftar
          </Link>
        </Button>

        {item === null ? (
          <div className="space-y-4 rounded-3xl border bg-card p-6 sm:p-8">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : item === "not_found" ? (
          <div className="rounded-3xl border border-dashed bg-card/60 py-20 text-center">
            <p className="text-sm text-muted-foreground">
              Pengumuman tidak ditemukan atau sudah dihapus.
            </p>
          </div>
        ) : (
          <article className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/80 shadow-[var(--shadow-card)] backdrop-blur-sm">
            {/* Accent bar */}
            <span
              className="absolute inset-x-0 top-0 h-1.5"
              style={{ background: CATEGORY_META[item.category].accent }}
            />
            {/* Decorative blob */}
            <div
              className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-20 blur-3xl"
              style={{ background: CATEGORY_META[item.category].accent }}
            />

            <div className="relative p-6 sm:p-10">
              <div className="flex flex-wrap items-center gap-3">
                <Badge
                  className={`${CATEGORY_META[item.category].className} rounded-full px-3 py-1 text-xs font-medium shadow-sm`}
                >
                  {CATEGORY_META[item.category].label}
                </Badge>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/60 px-3 py-1 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(item.created_at).toLocaleDateString("id-ID", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>

              <h1 className="mt-5 text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
                {item.title}
              </h1>

              <div className="mt-6 h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />

              <div className="prose prose-sm sm:prose-base mt-6 max-w-none whitespace-pre-wrap text-base leading-relaxed text-foreground/90">
                {item.content}
              </div>

              {item.attachment_url && (
                <Attachment
                  url={item.attachment_url}
                  name={item.attachment_name ?? "lampiran"}
                  type={item.attachment_type ?? ""}
                />
              )}

              {item.updated_at !== item.created_at && (
                <p className="mt-8 inline-flex items-center gap-1.5 border-t pt-4 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  Terakhir diperbarui:{" "}
                  {new Date(item.updated_at).toLocaleString("id-ID")}
                </p>
              )}
            </div>
          </article>
        )}
      </main>
    </div>
  );
}

function Attachment({ url, name, type }: { url: string; name: string; type: string }) {
  const isImage = type.startsWith("image/");
  const isPdf = type === "application/pdf";
  const Icon = isImage ? ImageIcon : isPdf ? FileText : FileType2;
  const typeLabel = isImage ? "Gambar" : isPdf ? "PDF" : "File";

  return (
    <div className="mt-8 overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-muted/40 to-muted/10">
      <div className="flex items-center gap-2 border-b border-border/60 bg-background/40 px-4 py-3 text-sm font-semibold text-foreground/90">
        <Paperclip className="h-4 w-4 text-primary" />
        Lampiran
      </div>

      {isImage && (
        <a href={url} target="_blank" rel="noreferrer" className="block bg-muted/30 p-3 sm:p-4">
          <img
            src={url}
            alt={name}
            className="mx-auto max-h-[28rem] w-full rounded-xl border border-border/60 object-contain shadow-sm transition-transform duration-300 hover:scale-[1.01]"
            loading="lazy"
          />
        </a>
      )}

      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{name}</p>
            <p className="text-xs text-muted-foreground">{typeLabel}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 sm:flex-nowrap">
          {(isPdf || (!isPdf && !isImage)) && (
            <Button asChild variant="outline" size="sm" className="flex-1 sm:flex-none">
              <a href={url} target="_blank" rel="noreferrer">
                <ExternalLink className="mr-1 h-4 w-4" />
                {isPdf ? "Buka PDF" : "Lihat File"}
              </a>
            </Button>
          )}
          <Button asChild size="sm" className="flex-1 sm:flex-none">
            <a href={url} download={name}>
              <Download className="mr-1 h-4 w-4" /> Download
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}