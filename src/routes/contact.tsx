import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageIntro } from "@/components/noholi";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Noholi Library" },
      { name: "description", content: "Visit Noholi Library in Dhanmondi, Dhaka, or send us a message." },
      { property: "og:title", content: "Contact Noholi Library" },
      { property: "og:description", content: "Address, opening hours and a contact form for Noholi Library." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Contact,
});

function Contact() {
  const [sent, setSent] = useState(false);
  return (
    <>
      <PageIntro eyebrow="Contact · যোগাযোগ" title="Come by, or write to us.">We answer every message within two working days. For membership questions, the front desk is quickest.</PageIntro>
      <section className="container-page grid gap-16 lg:grid-cols-12">
        <div className="space-y-10 lg:col-span-4">
          {[
            { icon: MapPin, t: "Address", d: "42 Satmasjid Road, Dhanmondi\nDhaka 1209, Bangladesh" },
            { icon: Phone, t: "Phone", d: "+880 2-5815 4420\n+880 1711-220 440" },
            { icon: Mail, t: "Email", d: "hello@noholi.org\nmembers@noholi.org" },
          ].map((x) => (
            <div key={x.t} className="grid grid-cols-[24px_minmax(0,1fr)] gap-4">
              <x.icon className="mt-1 h-5 w-5 text-accent" />
              <div><div className="eyebrow mb-2">{x.t}</div><p className="whitespace-pre-line font-display text-xl leading-snug">{x.d}</p></div>
            </div>
          ))}
          <div className="border-t border-border pt-8">
            <div className="eyebrow mb-4">Opening hours</div>
            <dl className="space-y-2 text-sm">
              {[["Saturday – Thursday", "10:00 – 20:00"], ["Friday", "15:00 – 20:00"], ["Public holidays", "Closed"]].map(([d, h]) => (
                <div key={d} className="flex justify-between border-b border-dashed border-border pb-2"><dt>{d}</dt><dd className="tabular-nums text-muted-foreground">{h}</dd></div>
              ))}
            </dl>
          </div>
        </div>
        <div className="lg:col-span-7 lg:col-start-6">
          {sent ? (
            <div className="border border-border p-10 text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-success text-background"><Check /></div>
              <h2 className="mt-6 text-3xl">Thank you — message received.</h2>
              <p className="mt-2 text-muted-foreground">We'll reply to your email within two working days.</p>
              <Button variant="outline" className="mt-8" onClick={() => setSent(false)}>Send another</Button>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="n">Name</Label><Input id="n" required placeholder="Your full name" className="h-11" /></div>
              <div className="space-y-2"><Label htmlFor="e">Email</Label><Input id="e" type="email" required placeholder="you@example.com" className="h-11" /></div>
              <div className="space-y-2 sm:col-span-2"><Label htmlFor="s">Subject</Label><Input id="s" required placeholder="Membership, donations, events…" className="h-11" /></div>
              <div className="space-y-2 sm:col-span-2"><Label htmlFor="m">Message</Label><Textarea id="m" required rows={7} placeholder="Write your message" /></div>
              <div className="sm:col-span-2"><Button size="lg" type="submit">Send message</Button></div>
            </form>
          )}
        </div>
      </section>
      <section className="container-page mt-20">
        <div className="relative h-80 overflow-hidden border border-border bg-secondary" role="img" aria-label="Map showing Noholi Library in Dhanmondi">
          <svg className="absolute inset-0 h-full w-full text-border" aria-hidden>
            <defs><pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse"><path d="M48 0H0V48" fill="none" stroke="currentColor" /></pattern></defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            <path d="M0 220 C 300 160, 500 260, 1400 120" stroke="currentColor" strokeWidth="18" fill="none" />
            <path d="M620 0 L 560 400" stroke="currentColor" strokeWidth="10" fill="none" />
          </svg>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full text-center">
            <div className="whitespace-nowrap bg-foreground px-3 py-1.5 text-xs text-background">Noholi Library</div>
            <div className="mx-auto h-6 w-px bg-foreground" />
            <div className="mx-auto h-3 w-3 rounded-full bg-accent ring-4 ring-accent/25" />
          </div>
          <div className="absolute bottom-4 left-4 text-xs text-muted-foreground">Dhanmondi Lake · 5 min walk</div>
        </div>
      </section>
    </>
  );
}
