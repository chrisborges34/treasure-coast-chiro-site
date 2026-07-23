import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { formatTimeLabel } from "@/lib/clinic-hours";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Tables, Enums } from "@/integrations/supabase/types";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({
    meta: [{ title: "Admin Dashboard — Treasure Coast Spine & Disc Center" }],
  }),
});

type BookingStatus = Enums<"booking_status">;
const STATUSES: BookingStatus[] = ["pending", "confirmed", "cancelled", "completed"];

function AdminPage() {
  const { user, role, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate({ to: "/login" });
      return;
    }
    if (role !== "admin") {
      // Not an admin — RLS would block all queries anyway, but redirect for a clean UX.
      navigate({ to: "/" });
      return;
    }
    setChecked(true);
  }, [authLoading, user, role, navigate]);

  if (!checked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Checking access…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="font-display font-bold text-lg tracking-tight">
            Treasure Coast <span className="text-primary">Spine &amp; Disc</span>{" "}
            <span className="text-muted-foreground font-normal">/ Admin</span>
          </Link>
          <button
            onClick={() => signOut().then(() => navigate({ to: "/" }))}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Log out
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-display font-extrabold tracking-tight mb-8">
          Admin Dashboard
        </h1>

        <Tabs defaultValue="bookings">
          <TabsList>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="content">Site Content</TabsTrigger>
          </TabsList>
          <TabsContent value="bookings" className="mt-6">
            <BookingsPanel />
          </TabsContent>
          <TabsContent value="content" className="mt-6">
            <ContentPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function BookingsPanel() {
  const [bookings, setBookings] = useState<Tables<"bookings">[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    supabase
      .from("bookings")
      .select("*")
      .order("appointment_date", { ascending: true })
      .order("appointment_time", { ascending: true })
      .then(({ data }) => {
        setBookings(data ?? []);
        setLoading(false);
      });
  };

  useEffect(load, []);

  const updateStatus = async (id: string, status: BookingStatus) => {
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
    if (error) {
      console.error(error);
      load(); // revert on failure
    }
  };

  if (loading) return <p className="text-sm text-muted-foreground">Loading bookings…</p>;
  if (bookings.length === 0)
    return <p className="text-sm text-muted-foreground">No bookings yet.</p>;

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead className="bg-card text-left text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Patient</th>
            <th className="px-4 py-3">Contact</th>
            <th className="px-4 py-3">Date &amp; time</th>
            <th className="px-4 py-3">Reason</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {bookings.map((b) => (
            <tr key={b.id}>
              <td className="px-4 py-3 font-medium">{b.full_name}</td>
              <td className="px-4 py-3 text-muted-foreground">
                <div>{b.email}</div>
                <div>{b.phone}</div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                {new Date(`${b.appointment_date}T00:00:00`).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}{" "}
                · {formatTimeLabel(b.appointment_time)}
              </td>
              <td className="px-4 py-3 text-muted-foreground max-w-[200px] truncate">
                {b.reason || "—"}
              </td>
              <td className="px-4 py-3">
                <select
                  value={b.status}
                  onChange={(e) => updateStatus(b.id, e.target.value as BookingStatus)}
                  className="rounded-md border border-input bg-background px-2 py-1 text-sm capitalize"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s} className="capitalize">
                      {s}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ContentPanel() {
  const [blocks, setBlocks] = useState<Tables<"content_blocks">[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  useEffect(() => {
    supabase
      .from("content_blocks")
      .select("*")
      .order("key")
      .then(({ data }) => {
        setBlocks(data ?? []);
        setDrafts(Object.fromEntries((data ?? []).map((b) => [b.key, b.value])));
        setLoading(false);
      });
  }, []);

  const save = async (key: string) => {
    setSavingKey(key);
    const { error } = await supabase
      .from("content_blocks")
      .update({ value: drafts[key] })
      .eq("key", key);
    setSavingKey(null);
    if (error) console.error(error);
  };

  if (loading) return <p className="text-sm text-muted-foreground">Loading content…</p>;

  return (
    <div className="space-y-6">
      {blocks.map((b) => (
        <div key={b.key} className="rounded-xl border border-border bg-card p-5">
          <label className="text-xs font-mono uppercase tracking-wide text-primary mb-2 block">
            {b.key.replace(/_/g, " ")}
          </label>
          <Textarea
            rows={3}
            value={drafts[b.key] ?? ""}
            onChange={(e) => setDrafts((d) => ({ ...d, [b.key]: e.target.value }))}
          />
          <div className="mt-3 flex justify-end">
            <Button
              size="sm"
              disabled={drafts[b.key] === b.value || savingKey === b.key}
              onClick={() => save(b.key)}
            >
              {savingKey === b.key ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
