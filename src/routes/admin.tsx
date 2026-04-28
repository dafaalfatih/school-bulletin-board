import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Pencil, Trash2, Plus, Shield } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

type Category = "akademik" | "osis" | "umum" | "acara";
type Announcement = {
  id: string;
  title: string;
  content: string;
  category: Category;
  created_at: string;
};

function AdminPage() {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<Announcement[] | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/auth" });
      return;
    }
    if (role && role !== "admin") {
      navigate({ to: "/" });
    }
  }, [user, role, loading, navigate]);

  const refresh = () => {
    supabase
      .from("announcements")
      .select("id,title,content,category,created_at")
      .order("created_at", { ascending: false })
      .then(({ data }) => setItems((data ?? []) as Announcement[]));
  };

  useEffect(() => {
    if (role === "admin") refresh();
  }, [role]);

  if (loading || role !== "admin") {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="mx-auto max-w-5xl px-4 py-8 text-sm text-muted-foreground">
          Memuat…
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              Panel Admin
            </div>
            <h1 className="text-2xl font-bold">Kelola Pengumuman</h1>
          </div>
          <AnnouncementDialog onSaved={refresh}>
            <Button>
              <Plus className="mr-1 h-4 w-4" /> Tambah
            </Button>
          </AnnouncementDialog>
        </div>

        {items === null ? (
          <p className="text-sm text-muted-foreground">Memuat…</p>
        ) : items.length === 0 ? (
          <div className="rounded-xl border border-dashed py-12 text-center text-sm text-muted-foreground">
            Belum ada pengumuman. Klik <strong>Tambah</strong> untuk membuat yang pertama.
          </div>
        ) : (
          <div className="grid gap-3">
            {items.map((a) => (
              <AdminRow key={a.id} item={a} onChanged={refresh} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function AdminRow({ item, onChanged }: { item: Announcement; onChanged: () => void }) {
  const onDelete = async () => {
    const { error } = await supabase.from("announcements").delete().eq("id", item.id);
    if (error) toast.error(error.message);
    else {
      toast.success("Pengumuman dihapus");
      onChanged();
    }
  };

  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border bg-card p-4">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{item.category}</Badge>
          <span className="text-xs text-muted-foreground">
            {new Date(item.created_at).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>
        <h3 className="mt-1 truncate font-semibold">{item.title}</h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">{item.content}</p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <AnnouncementDialog item={item} onSaved={onChanged}>
          <Button variant="ghost" size="icon" aria-label="Edit">
            <Pencil className="h-4 w-4" />
          </Button>
        </AnnouncementDialog>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Hapus">
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hapus pengumuman?</AlertDialogTitle>
              <AlertDialogDescription>
                Tindakan ini tidak bisa dibatalkan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction onClick={onDelete}>Hapus</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

function AnnouncementDialog({
  item,
  onSaved,
  children,
}: {
  item?: Announcement;
  onSaved: () => void;
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(item?.title ?? "");
  const [content, setContent] = useState(item?.content ?? "");
  const [category, setCategory] = useState<Category>(item?.category ?? "umum");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle(item?.title ?? "");
      setContent(item?.content ?? "");
      setCategory(item?.category ?? "umum");
    }
  }, [open, item]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    if (item) {
      const { error } = await supabase
        .from("announcements")
        .update({ title, content, category })
        .eq("id", item.id);
      setBusy(false);
      if (error) return toast.error(error.message);
      toast.success("Pengumuman diperbarui");
    } else {
      const { error } = await supabase
        .from("announcements")
        .insert({ title, content, category, author_id: user.id });
      setBusy(false);
      if (error) return toast.error(error.message);
      toast.success("Pengumuman dibuat");
    }
    setOpen(false);
    onSaved();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{item ? "Edit Pengumuman" : "Tambah Pengumuman"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Judul</Label>
            <Input id="title" required value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Kategori</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="akademik">Akademik</SelectItem>
                <SelectItem value="osis">OSIS</SelectItem>
                <SelectItem value="acara">Acara</SelectItem>
                <SelectItem value="umum">Umum</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Isi</Label>
            <Textarea
              id="content"
              required
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={busy}>
              {busy ? "Menyimpan…" : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}