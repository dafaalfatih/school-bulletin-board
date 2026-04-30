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
    <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 font-semibold text-foreground">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Megaphone className="h-5 w-5" />
          </div>
          <span>Pengumuman HSI Boarding School</span>
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