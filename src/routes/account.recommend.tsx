import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Empty, fmtDate, StatusBadge } from "@/components/noholi";
import { SearchBox } from "@/components/search-box";
import { IdentityUpload, type DocState } from "@/components/verify";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/account/recommend")({
  head: () => ({ meta: [{ title: "Recommend a Book — My Noholi" }, { name: "description", content: "Suggest a book for Noholi Library to acquire." }] }),
  component: Recommend,
});

const empty = { title: "", author: "", publisher: "", isbn: "", language: "Bangla" as "Bangla" | "English", reason: "" };

function Recommend() {
  const { recommendations, addRecommendation } = useApp();
  const [d, setD] = useState(empty);
  const [cover, setCover] = useState<DocState>(null);
  const [tried, setTried] = useState(false);
  const [sent, setSent] = useState<string | null>(null);
  const [held, setHeld] = useState<string | null>(null);
  const errs = { title: !d.title.trim(), author: !d.author.trim(), reason: d.reason.trim().length < 10 };
  const submit = () => {
    setTried(true);
    if (Object.values(errs).some(Boolean)) return;
    setSent(addRecommendation({ title: d.title, author: d.author, language: d.language, reason: d.reason, ...(d.publisher ? { publisher: d.publisher } : {}), ...(d.isbn ? { isbn: d.isbn } : {}) }));
    setD(empty); setCover(null); setTried(false);
  };
  return (
    <div className="grid gap-16 lg:grid-cols-12">
      <div className="lg:col-span-7">
        <div className="eyebrow mb-3">Suggestion desk</div>
        <h1 className="text-4xl md:text-5xl">Recommend a book for the library.</h1>
        <p className="mt-3 max-w-xl text-muted-foreground">Help us build a better library. Tell us about a book Noholi should consider adding to the shelves. This isn't your wishlist — it's a suggestion for everyone.</p>

        {sent && (
          <div className="mt-8 grid grid-cols-[32px_minmax(0,1fr)] gap-3 border border-foreground p-5" role="status">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-foreground text-background"><Check className="h-4 w-4" /></span>
            <div><div className="font-medium">Thank you — recommendation received.</div><div className="mt-1 flex flex-wrap items-center gap-x-4 text-sm"><span className="font-mono text-muted-foreground">{sent}</span><StatusBadge status="Submitted" /></div><div className="mt-1 text-sm text-muted-foreground">The acquisitions team reviews suggestions every month.</div></div>
          </div>
        )}

        <div className="mt-10 space-y-6">
          <div className="space-y-2">
            <Label>Check the catalogue first</Label>
            <SearchBox groups={["Books", "Noholi Books", "E-Books", "Audio Books"]} placeholder="Is it already on our shelves? Search…" onPick={(it) => setHeld(it.title)} />
            {held && <p className="text-sm">Good news — <em>{held}</em> is already in the library. <button className="underline underline-offset-2" onClick={() => setHeld(null)}>Dismiss</button></p>}
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2"><Label htmlFor="rt">Book title</Label><Input id="rt" value={d.title} onChange={(x) => setD({ ...d, title: x.target.value })} className="h-11" />{tried && errs.title && <p className="text-xs text-destructive">Enter the title.</p>}</div>
            <div className="space-y-2"><Label htmlFor="ra">Author</Label><Input id="ra" value={d.author} onChange={(x) => setD({ ...d, author: x.target.value })} className="h-11" />{tried && errs.author && <p className="text-xs text-destructive">Enter the author.</p>}</div>
            <div className="space-y-2"><Label htmlFor="rp">Publisher <span className="text-muted-foreground">(optional)</span></Label><Input id="rp" value={d.publisher} onChange={(x) => setD({ ...d, publisher: x.target.value })} className="h-11" /></div>
            <div className="space-y-2"><Label htmlFor="ri">ISBN <span className="text-muted-foreground">(optional)</span></Label><Input id="ri" value={d.isbn} onChange={(x) => setD({ ...d, isbn: x.target.value })} className="h-11 font-mono" /></div>
            <fieldset className="space-y-2"><legend className="text-sm font-medium">Language</legend>
              <div className="inline-flex border border-border p-0.5">{(["Bangla", "English"] as const).map((l) => <button key={l} type="button" aria-pressed={d.language === l} onClick={() => setD({ ...d, language: l })} className={cn("h-9 px-4 text-sm", d.language === l ? "bg-foreground text-background" : "text-muted-foreground")}>{l}</button>)}</div></fieldset>
            <div className="space-y-2 sm:col-span-2"><Label htmlFor="rr">Why should Noholi add it?</Label><Textarea id="rr" rows={4} value={d.reason} onChange={(x) => setD({ ...d, reason: x.target.value })} placeholder="Who would read it, and why it matters…" />{tried && errs.reason && <p className="text-xs text-destructive">A sentence or two helps the team decide.</p>}</div>
            <div className="max-w-[200px]"><IdentityUpload kind="photo" label="Cover image (optional)" value={cover} onChange={setCover} /></div>
          </div>
          <div className="flex justify-end border-t border-border pt-6"><Button size="lg" onClick={submit}>Send recommendation</Button></div>
        </div>
      </div>
      <aside className="lg:col-span-5">
        <h2 className="rule-top pt-5 text-2xl">Your recommendations</h2>
        {recommendations.length === 0 ? <div className="mt-6"><Empty title="You haven't recommended a book yet." body="Your suggestions will appear here with their status." /></div> : (
          <ul className="mt-2 divide-y divide-border">
            {recommendations.map((r) => (
              <li key={r.id} className="py-4">
                <div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="font-display text-lg leading-tight">{r.title}</div><div className="text-sm text-muted-foreground">{r.author} · {r.language}</div></div><StatusBadge status={r.status} /></div>
                <div className="mt-1 font-mono text-xs text-muted-foreground">{r.id} · {fmtDate(r.date)}</div>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-6 text-xs text-muted-foreground">Statuses: Submitted → Under Review → Considering → Acquired or Not Planned.</p>
      </aside>
    </div>
  );
}
