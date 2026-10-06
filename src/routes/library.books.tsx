import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

const facets = {
  genre: ["Fiction", "Non-fiction"],
  category: ["Adults", "Children", "General"],
  language: ["Bangla", "English"],
  availability: ["available", "limited", "unavailable"],
} as const;
type F = { [K in keyof typeof facets]: string[] };

function BooksPage() {
  const { t } = useApp();
  const [q, setQ] = useState("");
  const [f, setF] = useState<F>({ genre: [], category: [], language: [], availability: [] });
  const [sort, setSort] = useState("title");
  const [loading, setLoading] = useState(true);
  useEffect(() => { const id = setTimeout(() => setLoading(false), 450); return () => clearTimeout(id); }, []);

  const toggle = (k: keyof F, v: string) => setF((p) => ({ ...p, [k]: p[k].includes(v) ? p[k].filter((x) => x !== v) : [...p[k], v] }));
  const active = Object.values(f).flat().length;

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    let r = books.filter((b) => !b.noholi || true).filter((b) =>
      (!s || [b.titleEn, b.titleBn, b.authorEn, b.authorBn, b.isbn, b.publisher].some((x) => x.toLowerCase().includes(s))) &&
      (!f.genre.length || f.genre.includes(b.genre)) &&
      (!f.category.length || f.category.includes(b.category)) &&
      (!f.language.length || f.language.includes(b.language)) &&
      (!f.availability.length || f.availability.includes(availability(b))));
    r = [...r].sort((a, b) => sort === "newest" ? b.year - a.year : sort === "oldest" ? a.year - b.year : sort === "author" ? a.authorEn.localeCompare(b.authorEn) : a.titleEn.localeCompare(b.titleEn));
    return r;
  }, [q, f, sort]);

  const Filters = () => (
    <div className="space-y-8">
      {(Object.keys(facets) as (keyof F)[]).map((k) => (
        <fieldset key={k}>
          <legend className="eyebrow mb-3">{k}</legend>
          <div className="flex flex-wrap gap-2">
            {facets[k].map((v) => (
              <button key={v} onClick={() => toggle(k, v)} aria-pressed={f[k].includes(v)}
                className={cn("h-8 rounded-full border px-3 text-sm transition-colors", f[k].includes(v) ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground/50")}>
                {k === "availability" ? t(v as "available") : v}
              </button>
            ))}
          </div>
        </fieldset>
      ))}
      {active > 0 && <button onClick={() => setF({ genre: [], category: [], language: [], availability: [] })} className="text-sm underline underline-offset-4">Clear all filters</button>}
    </div>
  );

  return (
    <>
      <PageIntro eyebrow={`${t("library")} / ${t("books")}`} title="The printed collection.">
        Twelve thousand books to borrow — Bangla classics, new fiction, histories, and a children's shelf that is never quite tidy.
      </PageIntro>
      <section className="container-page">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_200px]">
          <SearchBox value={q} onValueChange={setQ} groups={["Books", "Authors"]} placeholder={t("search")} inputClassName="border-foreground/30 text-base" />
          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3">
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="!h-12 rounded-none border-foreground/30" aria-label="Sort"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="title">Title A–Z</SelectItem><SelectItem value="author">Author A–Z</SelectItem><SelectItem value="newest">Newest first</SelectItem><SelectItem value="oldest">Oldest first</SelectItem></SelectContent>
            </Select>
            <Sheet>
              <SheetTrigger asChild><Button variant="outline" className="h-12 rounded-none lg:hidden"><SlidersHorizontal />{active > 0 && active}</Button></SheetTrigger>
              <SheetContent side="left" className="overflow-y-auto bg-background p-6"><SheetTitle className="mb-6 font-display text-2xl">Filters</SheetTitle><Filters /></SheetContent>
            </Sheet>
          </div>
        </div>
        <div className="mt-10 grid gap-12 lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="hidden lg:block"><Filters /></aside>
          <div>
            <div className="mb-8 text-sm text-muted-foreground" aria-live="polite">{loading ? "Loading catalogue…" : `${results.length} ${results.length === 1 ? "book" : "books"}${q ? ` for “${q}”` : ""}`}</div>
            {loading ? (
              <div className="grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => <div key={i}><Skeleton className="aspect-[2/3] rounded-none" /><Skeleton className="mt-4 h-5 w-3/4" /><Skeleton className="mt-2 h-4 w-1/2" /></div>)}
              </div>
            ) : results.length ? (
              <div className="grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 xl:grid-cols-4">
                {results.map((b) => <BookCard key={b.id} book={b} />)}
              </div>
            ) : (
              <Empty title="No books match that search" body="Try a different spelling, search in Bangla, or clear a few filters." action={<Button variant="outline" onClick={() => { setQ(""); setF({ genre: [], category: [], language: [], availability: [] }); }}>Reset search</Button>} />
            )}
          </div>
        </div>
      </section>
    </>
  );
}
