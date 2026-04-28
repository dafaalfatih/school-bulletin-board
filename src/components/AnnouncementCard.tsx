import { Calendar } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Category = "akademik" | "osis" | "umum" | "acara";

const CATEGORY_META: Record<Category, { label: string; className: string }> = {
  akademik: { label: "Akademik", className: "bg-[oklch(var(--cat-akademik))] text-white" },
  osis: { label: "OSIS", className: "bg-[oklch(var(--cat-osis))] text-white" },
  umum: { label: "Umum", className: "bg-[oklch(var(--cat-umum))] text-white" },
  acara: { label: "Acara", className: "bg-[oklch(var(--cat-acara))] text-white" },
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
      className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
    >
    <Card className="relative overflow-hidden transition-all hover:shadow-[var(--shadow-card)] hover:-translate-y-0.5">
      {isNew && (
        <span className="absolute right-3 top-3 inline-flex items-center rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground shadow">
          Baru
        </span>
      )}
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Badge className={meta.className}>{meta.label}</Badge>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {date.toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>
        <CardTitle className="mt-2 text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="line-clamp-3 whitespace-pre-wrap text-sm text-muted-foreground">{content}</p>
      </CardContent>
    </Card>
    </Link>
  );
}