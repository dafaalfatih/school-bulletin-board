import { Calendar, ArrowUpRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Category = "akademik" | "osis" | "umum" | "acara";

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

interface Props {
  id: string;
  title: string;
  content: string;
  category: Category;
  createdAt: string;
  isNew?: boolean;
}

export function AnnouncementCard({ id, title, content, category, createdAt, isNew }: Props) {
  const meta = CATEGORY_META[category];
  const date = new Date(createdAt);

  return (
    <Link
      to="/announcement/$id"
      params={{ id }}
      className="group block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Card className="relative h-full overflow-hidden rounded-2xl border-border/60 bg-card/80 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[var(--shadow-card-hover)]">
        {/* Left accent bar */}
        <span
          className="absolute inset-y-0 left-0 w-1 opacity-80 transition-all duration-300 group-hover:w-1.5"
          style={{ background: meta.accent }}
        />
        {/* Decorative gradient blob */}
        <div
          className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-30"
          style={{ background: meta.accent }}
        />
        {isNew && (
          <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground shadow-md">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
            Baru
          </span>
        )}
        <CardHeader className="pb-3 pl-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={`${meta.className} rounded-full px-2.5 py-0.5 text-[11px] font-medium shadow-sm`}>
              {meta.label}
            </Badge>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              {date.toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
          <CardTitle className="mt-3 text-lg font-semibold leading-snug tracking-tight transition-colors group-hover:text-primary sm:text-xl">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="pl-6">
          <p className="line-clamp-3 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
            {content}
          </p>
          <div className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-all duration-300 group-hover:opacity-100">
            Baca selengkapnya
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}