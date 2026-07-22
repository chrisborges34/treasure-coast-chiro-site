import { createFileRoute } from "@tanstack/react-router";
import clinicHero from "@/assets/clinic-hero.jpg";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Treasure Coast Spine & Disc Center — Chiropractor in West Palm Beach, FL" },
      { name: "description", content: "Non-surgical spinal decompression and chiropractic adjustments in West Palm Beach. Relief for herniated discs, sciatica, and chronic pain. Call (561) 684-1080." },
      { property: "og:title", content: "Treasure Coast Spine & Disc Center" },
      { property: "og:description", content: "Advanced spinal decompression and chiropractic care in West Palm Beach, FL." },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Chiropractor",
          name: "Treasure Coast Spine & Disc Center",
          telephone: "+1-561-684-1080",
          url: "/",
          address: {
            "@type": "PostalAddress",
            streetAddress: "6901 Okeechobee Blvd, Unit D7",
            addressLocality: "West Palm Beach",
            addressRegion: "FL",
            postalCode: "33411",
            addressCountry: "US",
          },
          openingHoursSpecification: [
            {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
              opens: "09:00",
              closes: "12:00",
            },
            {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
              opens: "14:30",
              closes: "18:00",
            },
          ],
        }),
      },
    ],
  }),
});

const services = [
  {
    n: "01.01",
    title: "Spinal Decompression",
    desc: "Non-surgical solution for herniated discs, sciatica, and chronic back pain using advanced motorized traction.",
  },
  {
    n: "01.02",
    title: "Chiropractic Adjustments",
    desc: "Manual alignment techniques to restore joint function and support the nervous system for total body health.",
  },
  {
    n: "01.03",
    title: "Disc Care",
    desc: "Targeted protocols for bulging, thinning, or degenerated discs to reduce pressure and promote natural healing.",
  },
  {
    n: "01.04",
    title: "Pain Management",
    desc: "Integrated therapies designed to tackle the root cause of discomfort without heavy reliance on medication.",
  },
];

const hours = [
  ["Monday", "9:00AM–12:00PM, 2:30PM–6:00PM"],
  ["Tuesday", "9:00AM–12:00PM, 2:30PM–6:00PM"],
  ["Wednesday", "9:00AM–12:00PM, 2:30PM–6:00PM"],
  ["Thursday", "9:00AM–12:00PM, 2:30PM–6:00PM"],
  ["Friday", "9:00AM–12:00PM, 2:30PM–6:00PM"],
];

const mapsUrl =
  "https://www.google.com/maps/dir/?api=1&destination=6901+Okeechobee+Blvd+Unit+D7+West+Palm+Beach+FL+33411";

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="#top" className="flex items-center gap-2">
            <div className="w-6 h-8 bg-primary rounded-sm" />
            <span className="font-display font-bold text-lg tracking-tight">
              Treasure Coast <span className="text-primary">Spine &amp; Disc</span>
            </span>
          </a>
          <div className="hidden md:flex gap-8 text-sm font-medium text-muted">
            <a href="#services" className="hover:text-foreground transition-colors">Services</a>
            <a href="#about" className="hover:text-foreground transition-colors">Our Clinic</a>
            <a href="#location" className="hover:text-foreground transition-colors">Location</a>
          </div>
          <a
            href="tel:+15616841080"
            className="bg-foreground text-background px-5 py-2 rounded-full text-sm font-semibold hover:bg-primary transition-colors"
          >
            (561) 684-1080
          </a>
        </div>
      </nav>

      {/* Hero */}
      <header id="top" className="relative pt-12 pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 animate-fade-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-6">
              West Palm Beach, FL
            </div>
            <h1 className="text-5xl md:text-7xl font-display font-extrabold tracking-tight text-balance leading-[0.95] mb-8">
              Advanced care for your <span className="text-primary">spine &amp; discs.</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-[50ch] text-pretty mb-10 leading-relaxed">
              Specializing in non-surgical spinal decompression and comprehensive chiropractic adjustments to restore your mobility and eliminate chronic pain.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="tel:+15616841080"
                className="px-8 py-4 bg-primary text-primary-foreground font-bold rounded-lg shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                Book Consultation
              </a>
              <div className="flex items-center gap-3 px-6 py-4 rounded-lg border border-border bg-card">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
                  <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                </span>
                <span className="text-sm font-semibold">Accepting New Patients</span>
              </div>
            </div>
          </div>
          <div className="lg:col-span-5 animate-fade-up [animation-delay:150ms]">
            <img
              src={clinicHero}
              alt="Modern chiropractic treatment room at Treasure Coast Spine & Disc Center"
              width={1024}
              height={1280}
              className="w-full aspect-[4/5] object-cover rounded-2xl ring-1 ring-black/5 shadow-2xl"
            />
          </div>
        </div>
      </header>

      {/* Services */}
      <section id="services" className="py-24 bg-card border-y border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-sm font-mono text-primary uppercase tracking-tight mb-4">
                01 // Core Services
              </h2>
              <p className="text-4xl font-display font-extrabold tracking-tight">
                Precision treatments for lasting relief.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-border border border-border">
            {services.map((s) => (
              <div key={s.n} className="bg-card p-8 hover:bg-background transition-colors group">
                <span className="text-xs font-mono text-muted-foreground group-hover:text-primary mb-12 block transition-colors">
                  {s.n}
                </span>
                <h3 className="text-xl font-bold mb-4">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-24">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-16 items-start">
          <div className="lg:col-span-5">
            <h2 className="text-sm font-mono text-primary uppercase tracking-tight mb-4">
              02 // Our Clinic
            </h2>
            <p className="text-4xl font-display font-extrabold tracking-tight leading-tight">
              A focused practice for spine and disc health.
            </p>
          </div>
          <div className="lg:col-span-7 space-y-6 text-lg text-muted-foreground leading-relaxed">
            <p>
              Treasure Coast Spine &amp; Disc Center is dedicated to helping patients across West Palm Beach recover from disc injuries, chronic back and neck pain, and nerve-related symptoms — without surgery or long-term medication.
            </p>
            <p>
              Our approach pairs evidence-based chiropractic technique with modern spinal decompression to address the mechanical source of pain. Every patient receives a personal evaluation and a care plan built for measurable, lasting progress.
            </p>
            <div className="pt-6 flex flex-wrap gap-8 text-sm font-mono text-foreground">
              <div>
                <div className="text-3xl font-display font-extrabold text-primary">5.0</div>
                <div className="text-muted-foreground mt-1">Patient rating</div>
              </div>
              <div>
                <div className="text-3xl font-display font-extrabold text-primary">Non-Surgical</div>
                <div className="text-muted-foreground mt-1">Disc care specialty</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Location & Hours */}
      <section id="location" className="py-24 bg-background border-t border-border">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20">
          <div className="animate-fade-up">
            <h2 className="text-sm font-mono text-primary uppercase tracking-tight mb-6">
              03 // Availability
            </h2>
            <p className="text-3xl font-display font-extrabold tracking-tight mb-8">Hours of Operation</p>
            <div className="space-y-1 font-mono text-sm">
              {hours.map(([day, time]) => (
                <div key={day} className="flex justify-between py-3 border-b border-border gap-4">
                  <span className="text-muted-foreground">{day}</span>
                  <span className="font-medium text-right">{time}</span>
                </div>
              ))}
              <div className="flex justify-between py-3 text-muted-foreground/60 italic">
                <span>Sat &amp; Sun</span>
                <span>Closed</span>
              </div>
            </div>
          </div>

          <div className="animate-fade-up [animation-delay:100ms]">
            <h2 className="text-sm font-mono text-primary uppercase tracking-tight mb-6">
              04 // Directions
            </h2>
            <p className="text-3xl font-display font-extrabold tracking-tight mb-8">Visit our Clinic</p>
            <div className="bg-card rounded-xl ring-1 ring-black/5 p-8 mb-6">
              <address className="not-italic mb-6">
                <p className="text-xl font-bold mb-2">Treasure Coast Spine &amp; Disc Center</p>
                <p className="text-muted-foreground leading-relaxed">
                  6901 Okeechobee Blvd, Unit D7<br />
                  West Palm Beach, FL 33411
                </p>
              </address>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="tel:+15616841080"
                  className="flex-1 text-center py-3 bg-foreground text-background font-bold rounded-lg hover:bg-primary transition-colors"
                >
                  Call Now
                </a>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center py-3 border border-border font-bold rounded-lg hover:bg-accent transition-colors"
                >
                  Get Directions
                </a>
              </div>
            </div>
            <div className="rounded-xl overflow-hidden ring-1 ring-black/5 bg-card">
              <iframe
                title="Clinic location map"
                src="https://www.google.com/maps?q=6901+Okeechobee+Blvd+Unit+D7+West+Palm+Beach+FL+33411&output=embed"
                width="100%"
                height="240"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="border-0 w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-16">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-5 h-7 bg-primary rounded-sm" />
              <span className="font-display font-bold text-xl tracking-tight">Treasure Coast</span>
            </div>
            <p className="text-background/60 max-w-sm">
              Professional chiropractic care for the West Palm Beach community. Dedicated to restoring function and vitality through evidence-based practice.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h4 className="text-xs font-mono uppercase tracking-widest text-primary mb-4">Contact</h4>
              <a href="tel:+15616841080" className="block text-sm mb-2 hover:text-primary transition-colors">
                (561) 684-1080
              </a>
              <a
                href="https://facebook.com/WestPalmChiro"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-background/60 hover:text-primary transition-colors"
              >
                facebook.com/WestPalmChiro
              </a>
            </div>
            <div>
              <h4 className="text-xs font-mono uppercase tracking-widest text-primary mb-4">Address</h4>
              <p className="text-sm text-background/60">
                6901 Okeechobee Blvd, D7<br />
                West Palm Beach, FL 33411
              </p>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 pt-12 mt-12 border-t border-background/10">
          <p className="text-xs text-background/40">
            &copy; {new Date().getFullYear()} Treasure Coast Spine &amp; Disc Center. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
