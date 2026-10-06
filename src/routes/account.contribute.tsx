import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Star, X } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { BookCover, StatusBadge } from "@/components/noholi";
import { SearchBox } from "@/components/search-box";
import { IdentityUpload, type DocState } from "@/components/verify";
import { getBook } from "@/lib/data";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

const types = ["blog", "creative", "review"] as const;

export const Route = createFileRoute("/account/contribute")({
  validateSearch: z.object({ type: z.enum(types).optional() }),
  head: () => ({ meta: [{ title: "Submit writing — My Noholi" }, { name: "description", content: "Submit a blog, creative writing or book review to Noholi's editors." }] }),
  component: Contribute,
});

const label = { blog: "Blog", creative: "Creative Writing", review: "Book Review" } as const;

function Contribute() {
  const { type = "blog" } = Route.useSearch();
  const nav = useNavigate({ from: "/account/contribute" });
  const { addContribution } = useApp();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [cat, setCat] = useState("");
  const [tags, setTags] = useState("");
  const [cover, setCover] = useState<DocState>(null);
  const [bookId, setBookId] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [tried, setTried] = useState(false);
  const [sent, setSent] = useState<{ id: string; draft: boolean } | null>(null);
  const book = bookId ? getBook(bookId) : undefined;

  const errs: Record<string, string> = {};
  if (!title.trim()) errs.title = "Add a title.";
  if (body.trim().split(/\s+/).length < 20) errs.body = "Write at least a few sentences (20+ words).";
  if (type !== "review" && !cat) errs.cat = "Choose a category.";
  if (type === "review" && !bookId) errs.book = "Choose the book you're reviewing.";
  if (type === "review" && !rating) errs.rating = "Give a rating.";
  const e = tried ? errs : {};

  const submit = (draft: boolean) => {
    if (!draft) { setTried(true); if (Object.keys(errs).length) return; }
    else if (!title.trim()) { setTried(true); return; }
    const id = addContribution({ kind: type, title, status: draft ? "Draft" : "Pending Review", ...(bookId ? { bookId } : {}) });
    setSent({ id, draft }); window.scrollTo(0, 0);
  };

  if (sent) {
    return (
      <div className="max-w-2xl py-6">
        <div className="grid h-14 w-14 place-items-center rounded-full bg-foreground text-background"><Check className="h-6 w-6" /></div>
        <h1 className="mt-8 text-5xl leading-tight">{sent.draft ? "Draft saved." : "Thank you — submitted for review."}</h1>
        <p className="mt-3 text-muted-foreground">{sent.draft ? "Your draft is private. Open My Contributions whenever you're ready to finish it." : "A Noholi editor will read it before anything is published. You'll see the decision in My Contributions."}</p>
        <div className="mt-6 flex items-center gap-4 text-sm"><span className="font-mono text-muted-foreground">{sent.id}</span><StatusBadge status={sent.draft ? "Draft" : "Pending Review"} /></div>
        <div className="mt-10 flex gap-3"><Button asChild><Link to="/account/contributions">My contributions</Link></Button><Button variant="outline" onClick={() => { setSent(null); setTitle(""); setBody(""); setBookId(null); setRating(0); setTried(false); }}>Write another</Button></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="eyebrow mb-3">Contribute</div>
      <h1 className="text-4xl md:text-5xl">Submit {type === "creative" ? "creative writing" : `a ${label[type].toLowerCase()}`}</h1>
      <div className="mt-6 inline-flex border border-border p-0.5" role="tablist" aria-label="Type">
        {types.map((t) => <button key={t} role="tab" aria-selected={type === t} onClick={() => { nav({ search: { type: t } }); setTried(false); }} className={cn("h-9 px-4 text-sm", type === t ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground")}>{label[t]}</button>)}
      </div>
      <p className="mt-4 text-sm text-muted-foreground">Submissions are reviewed by Noholi's editors before publication.</p>

      <div className="mt-10 space-y-7">
        {type === "review" && (
          <div className="space-y-2">
            <Label>Book</Label>
            {book ? (
              <div className="grid grid-cols-[48px_minmax(0,1fr)_auto] items-center gap-4 border border-foreground p-3">
                <BookCover book={book} size="sm" /><div className="min-w-0"><div className="truncate font-display text-lg">{book.titleEn}</div><div className="truncate text-sm text-muted-foreground">{book.authorEn}</div></div>
                <button type="button" onClick={() => setBookId(null)} aria-label="Change book" className="p-2 text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
              </div>
            ) : <SearchBox groups={["Books", "Noholi Books", "E-Books"]} placeholder="Search for the book by title or author…" onPick={(it) => it.bookId && setBookId(it.bookId)} />}
            {e.book && <p className="text-xs text-destructive">{e.book}</p>}
          </div>
        )}
        {type === "review" && (
          <fieldset><legend className="mb-2 text-sm font-medium">Your rating</legend>
            <div className="flex items-center gap-1">{[1, 2, 3, 4, 5].map((n) => <button key={n} type="button" onClick={() => setRating(n)} aria-label={`${n} of 5`} aria-pressed={rating >= n} className="p-1"><Star className={cn("h-6 w-6", rating >= n ? "fill-foreground text-foreground" : "text-muted-foreground")} /></button>)}
              <span className="ml-3 text-sm text-muted-foreground">{["", "Didn't work for me", "Had its moments", "Worth reading", "Very good", "Unforgettable"][rating]}</span></div>
            {e.rating && <p className="mt-1 text-xs text-destructive">{e.rating}</p>}
          </fieldset>
        )}
        <div className="space-y-2"><Label htmlFor="t">{type === "review" ? "Review title" : "Title"}</Label><Input id="t" value={title} onChange={(x) => setTitle(x.target.value)} className="h-12 font-display text-lg" />{e.title && <p className="text-xs text-destructive">{e.title}</p>}</div>
        {type !== "review" && (
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2"><Label>{type === "creative" ? "Type" : "Category"}</Label>
              <Select value={cat} onValueChange={setCat}><SelectTrigger className="!h-11"><SelectValue placeholder="Choose…" /></SelectTrigger>
                <SelectContent>{(type === "creative" ? ["Poetry", "Short story", "Essay", "Memoir", "Translation"] : ["Reading culture", "Essays", "Library news", "Literature"]).map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
              {e.cat && <p className="text-xs text-destructive">{e.cat}</p>}
            </div>
            {type === "blog" && <div className="space-y-2"><Label htmlFor="tags">Tags <span className="text-muted-foreground">(comma separated)</span></Label><Input id="tags" value={tags} onChange={(x) => setTags(x.target.value)} placeholder="reading, dhaka" className="h-11" /></div>}
          </div>
        )}
        <div className="space-y-2"><Label htmlFor="b">{type === "review" ? "Your review" : "Content"}</Label><Textarea id="b" rows={14} value={body} onChange={(x) => setBody(x.target.value)} className="font-display text-lg leading-relaxed" />
          <div className="flex justify-between text-xs"><span className="text-destructive">{e.body}</span><span className="text-muted-foreground tabular-nums">{body.trim() ? body.trim().split(/\s+/).length : 0} words</span></div></div>
        {type !== "review" && <div className="max-w-md"><IdentityUpload kind="nid" label={`Cover image ${type === "creative" ? "(optional)" : "(optional)"}`} hint="Landscape works best." value={cover} onChange={setCover} /></div>}
      </div>
      <div className="mt-10 flex flex-wrap justify-end gap-3 border-t border-border pt-6">
        <Button variant="ghost" onClick={() => submit(true)}>Save draft</Button>
        <Button size="lg" variant="accent" onClick={() => submit(false)}>Submit for review</Button>
      </div>
    </div>
  );
}
