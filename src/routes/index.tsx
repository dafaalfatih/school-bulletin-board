import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Megaphone, Inbox } from "lucide-react";
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

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section
        className="border-b"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="mx-auto max-w-5xl px-4 py-12 text-primary-foreground">
          <div className="flex items-center gap-2 text-sm opacity-90">
            <Megaphone className="h-4 w-4" />
            <span>Informasi resmi sekolah</span>
          </div>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
            Pengumuman Terbaru
          </h1>
          <p className="mt-2 max-w-xl text-sm opacity-90 sm:text-base">
            Semua kabar akademik, OSIS, dan acara sekolah dalam satu tempat —
            cepat, jelas, dan terorganisir.
          </p>
          {user && newCount > 0 && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-sm backdrop-blur">
              <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
              {newCount} pengumuman baru
            </div>
          )}
        </div>
      </section>

      <main className="mx-auto max-w-5xl px-4 py-8">
        {authLoading ? (
          <SkeletonList />
        ) : !user ? (
          <SignedOutPrompt />
        ) : (
          <>
            <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
              <TabsList className="mb-6 flex-wrap">
                <TabsTrigger value="all">Semua</TabsTrigger>
                <TabsTrigger value="akademik">Akademik</TabsTrigger>
                <TabsTrigger value="osis">OSIS</TabsTrigger>
                <TabsTrigger value="acara">Acara</TabsTrigger>
                <TabsTrigger value="umum">Umum</TabsTrigger>
              </TabsList>
            </Tabs>

            {filtered === null ? (
              <SkeletonList />
            ) : filtered.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid gap-4">
                {filtered.map((a) => (
                  <AnnouncementCard
                    key={a.id}
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
    </div>
  );
}

function SkeletonList() {
  return (
    <div className="grid gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-32 w-full rounded-xl" />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
      <Inbox className="h-10 w-10 text-muted-foreground" />
      <p className="mt-3 text-sm text-muted-foreground">
        Belum ada pengumuman pada kategori ini.
      </p>
    </div>
  );
}

function SignedOutPrompt() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border bg-card py-16 text-center shadow-sm">
      <Megaphone className="h-10 w-10 text-primary" />
      <h2 className="mt-3 text-lg font-semibold">Masuk untuk melihat pengumuman</h2>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Silakan masuk dengan akun sekolahmu untuk mengakses semua pengumuman terbaru.
      </p>
      <Button asChild className="mt-4">
        <Link to="/auth">Masuk / Daftar</Link>
      </Button>
    </div>
  );
}
