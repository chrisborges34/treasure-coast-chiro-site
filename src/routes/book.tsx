import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { getSlotsForDate, isClinicOpenOn, toDateKey, formatTimeLabel } from "@/lib/clinic-hours";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/book")({
  component: BookPage,
  head: () => ({
    meta: [
      { title: "Book an Appointment — Treasure Coast Spine & Disc Center" },
      {
        name: "description",
        content:
          "Book your chiropractic consultation online at Treasure Coast Spine & Disc Center in West Palm Beach, FL.",
      },
    ],
  }),
});

function BookPage() {
  const { user } = useAuth();
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Pre-fill contact info for logged-in patients.
  useEffect(() => {
    if (!user) return;
    setEmail(user.email ?? "");
    const meta = user.user_metadata as { full_name?: string; phone?: string } | undefined;
    if (meta?.full_name) setFullName(meta.full_name);
    if (meta?.phone) setPhone(meta.phone);
  }, [user]);

  useEffect(() => {
    if (!date) return;
    let active = true;
    setLoadingSlots(true);
    setSelectedTime(null);

    supabase
      .rpc("get_booked_times", { _date: toDateKey(date) })
      .then(({ data, error: rpcError }) => {
        if (!active) return;
        if (rpcError) {
          console.error(rpcError);
          setBookedTimes([]);
        } else {
          setBookedTimes((data ?? []) as unknown as string[]);
        }
        setLoadingSlots(false);
      });

    return () => {
      active = false;
    };
  }, [date]);

  const availableSlots = useMemo(() => {
    if (!date) return [];
    const all = getSlotsForDate(date);
    const booked = new Set(bookedTimes.map((t) => t.slice(0, 8)));
    return all.filter((t) => !booked.has(t));
  }, [date, bookedTimes]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!date || !selectedTime) return;
    setSubmitting(true);
    setError(null);

    const { error: insertError } = await supabase.from("bookings").insert({
      patient_id: user?.id ?? null,
      full_name: fullName,
      email,
      phone,
      appointment_date: toDateKey(date),
      appointment_time: selectedTime,
      reason: reason || null,
    });

    setSubmitting(false);

    if (insertError) {
      // Unique constraint violation = someone else just took this slot.
      if (insertError.code === "23505") {
        setError("That time was just booked by someone else — please pick another slot.");
        setSelectedTime(null);
        setBookedTimes((prev) => [...prev, selectedTime]);
      } else {
        setError(insertError.message);
      }
      return;
    }

    setSuccess(true);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary text-2xl">
            ✓
          </div>
          <h1 className="text-2xl font-display font-extrabold tracking-tight">
            Appointment requested
          </h1>
          <p className="mt-3 text-muted-foreground">
            We've received your request for{" "}
            <strong>
              {date?.toLocaleDateString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </strong>{" "}
            at <strong>{selectedTime && formatTimeLabel(selectedTime)}</strong>. Our team will
            confirm shortly by phone.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link
              to="/"
              className="px-6 py-3 rounded-lg border border-border font-semibold hover:bg-accent transition-colors"
            >
              Back to home
            </Link>
            {user && (
              <Link
                to="/portal"
                className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:shadow-lg transition-all"
              >
                View my appointments
              </Link>
            )}
          </div>
        </div>
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
          <a
            href="tel:+15616841080"
            className="text-sm font-semibold hover:text-primary transition-colors"
          >
            (561) 684-1080
          </a>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-display font-extrabold tracking-tight mb-2">
          Book your consultation
        </h1>
        <p className="text-muted-foreground mb-10">
          Pick a day and time that works for you. We'll confirm your appointment shortly after.
        </p>

        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-sm font-mono text-primary uppercase tracking-tight mb-4">
              1. Choose a date &amp; time
            </h2>
            <div className="rounded-xl border border-border bg-card p-4">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(d) =>
                  d < new Date(new Date().setHours(0, 0, 0, 0)) || !isClinicOpenOn(d)
                }
              />
            </div>

            {date && (
              <div className="mt-6">
                <p className="text-sm font-medium mb-3">
                  Available times for{" "}
                  {date.toLocaleDateString(undefined, {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                {loadingSlots ? (
                  <p className="text-sm text-muted-foreground">Loading times…</p>
                ) : availableSlots.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No open slots that day — try another date.
                  </p>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {availableSlots.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setSelectedTime(t)}
                        className={`py-2 rounded-lg border text-sm font-medium transition-colors ${
                          selectedTime === t
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-border hover:bg-accent"
                        }`}
                      >
                        {formatTimeLabel(t)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-sm font-mono text-primary uppercase tracking-tight mb-4">
              2. Your information
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full name</Label>
                <Input
                  id="fullName"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">What brings you in? (optional)</Label>
                <Textarea
                  id="reason"
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={!date || !selectedTime || submitting}
              >
                {submitting
                  ? "Booking…"
                  : date && selectedTime
                    ? `Request ${formatTimeLabel(selectedTime)} on ${date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`
                    : "Select a date & time first"}
              </Button>

              {!user && (
                <p className="text-xs text-muted-foreground text-center">
                  Booking as a guest.{" "}
                  <Link to="/login" className="text-primary hover:underline">
                    Log in
                  </Link>{" "}
                  to track this appointment in your patient portal.
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
