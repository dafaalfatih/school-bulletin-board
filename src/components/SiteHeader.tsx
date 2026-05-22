import { Link, useNavigate } from "@tanstack/react-router";
import { Megaphone, LogOut, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

export function SiteHeader() {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/auth" });
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link
          to="/"
          className="group flex items-center gap-2.5 font-semibold text-foreground transition-opacity hover:opacity-90"
        >
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl text-primary-foreground shadow-[var(--shadow-glow)] transition-transform group-hover:scale-105"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Megaphone className="h-5 w-5" />
          </div>
          <span className="hidden text-base tracking-tight sm:inline">
            Pengumuman HSI Boarding School
          </span>
          <span className="text-base tracking-tight sm:hidden">HSI Boarding</span>
        </Link>
        <nav className="flex items-center gap-2">
          {user ? (
            <>
              {role === "admin" && (
                <Button asChild variant="ghost" size="sm">
                  <Link to="/admin">
                    <Shield className="mr-1 h-4 w-4" /> Admin
                  </Link>
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="mr-1 h-4 w-4" /> Keluar
              </Button>
            </>
          ) : (
            <Button asChild size="sm">
              <Link to="/auth">Masuk</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}