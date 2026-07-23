import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { formatTimeLabel } from "@/lib/clinic-hours";
import { Button } from "@/components/ui/button";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/portal")({
  component: PortalPage,
  head: () => ({
    meta: [{ title: "My Appointments — Treasure Coast Spine & Disc Center" }],
  }),
});

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-800",
  completed: "bg-slate-200 text-slate-700",
};

function PortalPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Tables<"bookings">[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate({ to: "/login" });
      return;
    }

    supabase
      .from("bookings")
      .select("*")
      .eq("patient_id", user.id)
      .order("appointment_date", { ascending: true })
      .then(({ data }) => {
        setBookings(data ?? []);
        setLoading(false);
      });
  }, [authLoading, user, navigate]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="font-display font-bold text-lg tracking-tight">
            Treasure Coast <span className="text-primary">Spine &amp; Disc</span>
          </Link>
          <button
            onClick={() => signOut().then(() => navigate({ to: "/" }))}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Log out
          </button>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-10 gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-display font-extrabold tracking-tight">My Appointments</h1>
            <p className="text-muted-foreground mt-1">{user.email}</p>
          </div>
          <Button asChild>
            <Link to="/book">Book new appointment</Link>
          </Button>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading your appointments…</p>
        ) : bookings.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-10 text-center">
            <p className="text-muted-foreground">You don&apos;t have any appointments yet.</p>
            <Button asChild className="mt-6">
              <Link to="/book">Book your first appointment</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between rounded-xl border border-border bg-card p-5"
              >
                <div>
                  <p className="font-semibold">
                    {new Date(`${b.appointment_date}T00:00:00`).toLocaleDateString(undefined, {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatTimeLabel(b.appointment_time)}
                    {b.reason ? ` · ${b.reason}` : ""}
                  </p>
                </div>
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${STATUS_STYLES[b.status]}`}
                >
                  {b.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
