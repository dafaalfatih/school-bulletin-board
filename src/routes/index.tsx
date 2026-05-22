import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Megaphone, Inbox, Sparkles, Bell, GraduationCap, Users, CalendarDays, Newspaper } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { SiteHeader } from "@/components/SiteHeader";
import { AnnouncementCard } from "@/components/AnnouncementCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/")({
  component: Index,
});

type Category = "akademik" | "osis" | "umum" | "acara";
type Announcement = {
  id: string;
  title: string;
  content: string;
  category: Category;
  created_at: string;
};

const LAST_SEEN_KEY = "announcements_last_seen_at";

function Index() {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<Announcement[] | null>(null);
  const [filter, setFilter] = useState<"all" | Category>("all");
  const [lastSeen, setLastSeen] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    return Number(localStorage.getItem(LAST_SEEN_KEY) ?? 0);
  });

  useEffect(() => {
    if (!user) return;
    let active = true;
    supabase
      .from("announcements")
      .select("id,title,content,category,created_at")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (!active) return;
        setItems((data ?? []) as Announcement[]);
      });

    const channel = supabase
      .channel("announcements-list")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "announcements" },
        () => {
          supabase
            .from("announcements")
            .select("id,title,content,category,created_at")
            .order("created_at", { ascending: false })
            .then(({ data }) => setItems((data ?? []) as Announcement[]));
        },
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Mark as seen when user views the page
  useEffect(() => {
    if (!items || items.length === 0) return;
    const newest = new Date(items[0].created_at).getTime();
    const timeout = setTimeout(() => {
      localStorage.setItem(LAST_SEEN_KEY, String(newest));
      setLastSeen(newest);
    }, 1500);
    return () => clearTimeout(timeout);
  }, [items]);

  const filtered = useMemo(() => {
    if (!items) return null;
    if (filter === "all") return items;
    return items.filter((i) => i.category === filter);
  }, [items, filter]);

  const newCount = useMemo(() => {
    if (!items) return 0;
    return items.filter((i) => new Date(i.created_at).getTime() > lastSeen).length;
  }, [items, lastSeen]);

  const stats = useMemo(() => {
    const all = items ?? [];
    return {
      total: all.length,
      akademik: all.filter((i) => i.category === "akademik").length,
      osis: all.filter((i) => i.category === "osis").length,
      acara: all.filter((i) => i.category === "acara").length,
    };
  }, [items]);

  return (
    <div className="min-h-screen" style={{ background: "var(--gradient-subtle)" }}>
      <SiteHeader />

      <section
        className="relative overflow-hidden border-b border-white/10"
        style={{ background: "var(--gradient-hero)" }}
      >
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative mx-auto max-w-6xl px-4 py-16 text-primary-foreground sm:px-6 sm:py-20 lg:py-24">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur-md animate-fade-in">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Portal Informasi Resmi</span>
          </div>
          <h1 className="mt-5 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl animate-fade-in">
            Pengumuman{" "}
            <span className="bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent">
              HSI Boarding School
            </span>
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg animate-fade-in">
            Semua kabar akademik, OSIS, dan acara sekolah dalam satu tempat —
            cepat, jelas, dan terorganisir.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3 animate-fade-in">
            {!user && (
              <Button
                asChild
                size="lg"
                className="rounded-full bg-white px-6 font-semibold text-primary shadow-lg transition-all hover:scale-[1.02] hover:bg-white/95 hover:shadow-xl"
              >
                <Link to="/auth">Mulai Sekarang</Link>
              </Button>
            )}
            {user && newCount > 0 && (
              <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-4 py-2 text-sm font-medium backdrop-blur-md">
                <Bell className="h-4 w-4" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                {newCount} pengumuman baru
              </div>
            )}
          </div>

          {/* Stats */}
          {user && items && items.length > 0 && (
            <div className="mt-10 grid grid-cols-2 gap-3 sm:max-w-2xl sm:grid-cols-4">
              <StatCard icon={Newspaper} label="Total" value={stats.total} />
              <StatCard icon={GraduationCap} label="Akademik" value={stats.akademik} />
              <StatCard icon={Users} label="OSIS" value={stats.osis} />
              <StatCard icon={CalendarDays} label="Acara" value={stats.acara} />
            </div>
          )}
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
        {authLoading ? (
          <SkeletonList />
        ) : !user ? (
          <SignedOutPrompt />
        ) : (
          <>
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Pengumuman Terbaru
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Pilih kategori untuk memfilter daftar pengumuman.
                </p>
              </div>
              <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
                <TabsList className="flex-wrap rounded-full bg-muted/60 p-1 backdrop-blur">
                  <TabsTrigger value="all" className="rounded-full">Semua</TabsTrigger>
                  <TabsTrigger value="akademik" className="rounded-full">Akademik</TabsTrigger>
                  <TabsTrigger value="osis" className="rounded-full">OSIS</TabsTrigger>
                  <TabsTrigger value="acara" className="rounded-full">Acara</TabsTrigger>
                  <TabsTrigger value="umum" className="rounded-full">Umum</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {filtered === null ? (
              <SkeletonList />
            ) : filtered.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid gap-5 sm:grid-cols-2">
                {filtered.map((a) => (
                  <AnnouncementCard
                    key={a.id}
                    id={a.id}
                    title={a.title}
                    content={a.content}
                    category={a.category}
                    createdAt={a.created_at}
                    isNew={new Date(a.created_at).getTime() > lastSeen}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <footer className="mt-12 border-t border-border/60 bg-background/40 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-6 text-center text-xs text-muted-foreground sm:px-6">
          © {new Date().getFullYear()} HSI Boarding School — Portal Pengumuman Resmi.
        </div>
      </footer>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Newspaper;
  label: string;
  value: number;
}) {
  return (
    <div className="group rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:bg-white/15">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-white/75">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className="mt-1 text-2xl font-bold tabular-nums">{value}</div>
    </div>
  );
}

function SkeletonList() {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-44 w-full rounded-2xl" />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 py-20 text-center backdrop-blur-sm">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
        <Inbox className="h-7 w-7 text-muted-foreground" />
      </div>
      <p className="mt-4 text-sm text-muted-foreground">
        Belum ada pengumuman pada kategori ini.
      </p>
    </div>
  );
}

function SignedOutPrompt() {
  return (
    <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-3xl border border-border/60 bg-card py-20 text-center shadow-[var(--shadow-card)]">
      <div
        className="pointer-events-none absolute -top-20 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full opacity-20 blur-3xl"
        style={{ background: "var(--gradient-primary)" }}
      />
      <div
        className="relative flex h-16 w-16 items-center justify-center rounded-2xl text-primary-foreground shadow-[var(--shadow-glow)]"
        style={{ background: "var(--gradient-primary)" }}
      >
        <Megaphone className="h-7 w-7" />
      </div>
      <h2 className="relative mt-5 text-xl font-bold tracking-tight">Masuk untuk melihat pengumuman</h2>
      <p className="relative mt-2 max-w-sm text-sm text-muted-foreground">
        Silakan masuk dengan akun sekolahmu untuk mengakses semua pengumuman terbaru.
      </p>
      <Button asChild size="lg" className="relative mt-6 rounded-full px-6">
        <Link to="/auth">Masuk / Daftar</Link>
      </Button>
    </div>
  );
}
