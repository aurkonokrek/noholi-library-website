import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { runSearch } from "@/lib/search";
import { Button } from "@/components/ui/button";
import { SearchBox } from "@/components/search-box";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { BookCard, Empty, PageIntro } from "@/components/noholi";
import { availability, books } from "@/lib/data";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/library/books")({
  head: () => ({
    meta: [
      { title: "Books — Noholi Library catalogue" },
      { name: "description", content: "Search and filter Noholi's printed collection of Bangla and English books." },
      { property: "og:title", content: "Browse the Noholi catalogue" },
      { property: "og:description", content: "Fiction, non-fiction and children's books in Bangla and English." },
    ],
  }),
  component: BooksPage,
});

const facetLabel = { genre: "Genre", category: "Category", language: "Language", availability: "Availability" } as const;
const availLabel: Record<string, string> = { available: "Available", limited: "Limited Availability", borrowed: "Currently Borrowed", withdrawn: "Unavailable" };
/** "withdrawn" = no copies in the collection at all (e.g. lost or under repair). */
const availKey = (b: (typeof books)[number]) => b.totalCopies === 0 ? "withdrawn" : availability(b) === "unavailable" ? "borrowed" : availability(b);
const facets = {
  genre: ["Fiction", "Non-fiction"],
  category: ["Adults", "Children", "General"],
  language: ["Bangla", "English"],
  availability: ["available", "limited", "borrowed", "withdrawn"],
} as const;
type F = { [K in keyof typeof facets]: string[] };

function BooksPage() {
  const { t } = useApp();
  const [q, setQ] = useState("");
  const [f, setF] = useState<F>({ genre: [], category: [], language: [], availability: [] });
  const [sort, setSort] = useState("relevance");
  const [loading, setLoading] = useState(true);
  useEffect(() => { const id = setTimeout(() => setLoading(false), 450); return () => clearTimeout(id); }, []);

  const toggle = (k: keyof F, v: string) => setF((p) => ({ ...p, [k]: p[k].includes(v) ? p[k].filter((x) => x !== v) : [...p[k], v] }));
  const active = Object.values(f).flat().length;

  const matches = (b: (typeof books)[number], skip?: keyof F) =>
    (skip === "genre" || !f.genre.length || f.genre.includes(b.genre)) &&
    (skip === "category" || !f.category.length || f.category.includes(b.category)) &&
    (skip === "language" || !f.language.length || f.language.includes(b.language)) &&
    (skip === "availability" || !f.availability.length || f.availability.includes(availKey(b)));
  const pool = useMemo(() => {
    if (!q.trim()) return books;
    const order = runSearch(q, ["Books", "Noholi Books", "E-Books"]).map((r) => r.bookId);
    const ids = [...new Set(order)];
    return ids.map((id) => books.find((b) => b.id === id)!).filter(Boolean);
  }, [q]);
  const results = useMemo(() => {
    const r = pool.filter((b) => matches(b));
    if (sort === "relevance") return r;
    return [...r].sort((a, b) => sort === "newest" ? b.year - a.year : sort === "oldest" ? a.year - b.year : sort === "author" ? a.authorEn.localeCompare(b.authorEn) : sort === "title-desc" ? b.titleEn.localeCompare(a.titleEn) : a.titleEn.localeCompare(b.titleEn));
  }, [pool, f, sort, q]);
  const count = (k: keyof F, v: string) => pool.filter((b) => matches(b, k) && (k === "availability" ? availKey(b) === v : b[k] === v)).length;
  const clear = () => setF({ genre: [], category: [], language: [], availability: [] });

  const Filters = () => (
    <div className="space-y-7">
      <div className="flex items-baseline justify-between"><h2 className="font-display text-xl">Filters{active > 0 && <span className="ml-2 text-sm text-muted-foreground">({active})</span>}</h2>{active > 0 && <button onClick={clear} className="text-sm underline underline-offset-4 hover:text-accent">Clear All</button>}</div>
      {(Object.keys(facets) as (keyof F)[]).map((k) => (
        <fieldset key={k}>
          <legend className="eyebrow mb-2">{facetLabel[k]}</legend>
          <div className="space-y-1">
            {facets[k].map((v) => { const id = `f-${k}-${v}`; const n = count(k, v); return (
              <label key={v} htmlFor={id} className="flex cursor-pointer items-center gap-3 py-1 text-sm">
                <Checkbox id={id} checked={f[k].includes(v)} onCheckedChange={() => toggle(k, v)} />
                <span className="flex-1">{k === "availability" ? availLabel[v] : v}</span>
                <span className="tabular-nums text-xs text-muted-foreground">{n}</span>
              </label>); })}
          </div>
        </fieldset>
      ))}
    </div>
  );

  return (
    <>
      <PageIntro eyebrow={`${t("library")} / ${t("books")}`} title="The printed collection." compact />
      <section className="container-page">
        <div className="z-30 -mx-4 grid gap-3 bg-background/95 px-4 py-3 backdrop-blur md:sticky md:top-[var(--hdr,73px)] md:grid-cols-[minmax(0,1fr)_200px]">
          <SearchBox value={q} onValueChange={setQ} groups={["Books", "Authors"]} placeholder={t("search")} inputClassName="border-foreground/30 text-base" />
          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3">
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="!h-12 rounded-none border-foreground/30" aria-label="Sort"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="relevance">Sort: Relevance</SelectItem><SelectItem value="title">Title: A–Z</SelectItem><SelectItem value="title-desc">Title: Z–A</SelectItem><SelectItem value="author">Author: A–Z</SelectItem><SelectItem value="newest">Newest</SelectItem><SelectItem value="oldest">Oldest</SelectItem></SelectContent>
            </Select>
            <Sheet>
              <SheetTrigger asChild><Button variant="outline" className="h-12 rounded-none lg:hidden"><SlidersHorizontal /> Filters{active > 0 && ` (${active})`}</Button></SheetTrigger>
              <SheetContent side="left" className="overflow-y-auto bg-background p-6"><SheetTitle className="sr-only">Filters</SheetTitle><Filters /></SheetContent>
            </Sheet>
          </div>
        </div>
        <div className="mt-5 grid gap-10 lg:grid-cols-[200px_minmax(0,1fr)]">
          <aside className="hidden lg:block"><div className="sticky top-[calc(var(--hdr,73px)+5rem)] max-h-[calc(100vh-var(--hdr,73px)-6rem)] overflow-y-auto pb-6 pr-2">  <Filters /></div></aside>
          <div>
            {active > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {(Object.keys(f) as (keyof F)[]).flatMap((k) => f[k].map((v) => (
                  <button key={k + v} onClick={() => toggle(k, v)} className="inline-flex h-7 items-center gap-1.5 rounded-full border border-foreground/30 px-3 text-xs hover:border-foreground" aria-label={`Remove filter ${v}`}>{k === "availability" ? availLabel[v] : v}<X className="h-3 w-3" /></button>
                )))}
                <button onClick={clear} className="h-7 px-2 text-xs underline underline-offset-4">Clear All</button>
              </div>
            )}
            <div className="mb-5 text-sm text-muted-foreground" aria-live="polite">{loading ? "Loading catalogue…" : `${results.length} ${results.length === 1 ? "book" : "books"}${q ? ` for “${q}”` : ""}`}</div>
            {loading ? (
              <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {Array.from({ length: 8 }).map((_, i) => <div key={i}><Skeleton className="aspect-[2/3] rounded-none" /><Skeleton className="mt-4 h-5 w-3/4" /><Skeleton className="mt-2 h-4 w-1/2" /></div>)}
              </div>
            ) : results.length ? (
              <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {results.map((b) => <BookCard key={b.id} book={b} />)}
              </div>
            ) : (
              <Empty title="No books match that search" body="Try a different spelling, search in Bangla, or clear a few filters." action={<Button variant="outline" onClick={() => { setQ(""); clear(); }}>Reset search</Button>} />
            )}
          </div>
        </div>
      </section>
    </>
  );
}
