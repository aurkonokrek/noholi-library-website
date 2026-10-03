import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Availability, BookCover, Cover, Empty } from "@/components/noholi";
import { audiobooks, getBook } from "@/lib/data";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/account/wishlist")({ component: Wishlist });

function Wishlist() {
  const { wishlist, toggleWish, play } = useApp();
  const [tab, setTab] = useState("All");
  const items = wishlist.map((id) => {
    const a = audiobooks.find((x) => x.id === id);
    if (a) return { id, type: "Audio Books" as const, a };
    const b = getBook(id)!;
    return { id, type: b.ebook ? ("E-Books" as const) : ("Books" as const), b };
  });
  const list = items.filter((i) => tab === "All" || i.type === tab);

  return (
    <>
      <h1 className="mb-8 text-4xl">Wishlist</h1>
      <div className="mb-8 flex flex-wrap gap-2">
        {["All", "Books", "E-Books", "Audio Books"].map((t) => (
          <button key={t} onClick={() => setTab(t)} aria-pressed={tab === t} className={cn("h-8 rounded-full border px-4 text-sm", tab === t ? "border-foreground bg-foreground text-background" : "border-border")}>{t} <span className="opacity-60">{t === "All" ? items.length : items.filter((i) => i.type === t).length}</span></button>
        ))}
      </div>
      {list.length === 0 ? (
        <Empty title="Your wishlist is empty" body="Tap the heart on any book, e-book or audio book to save it here." action={<Button asChild><Link to="/library/books">Explore the library</Link></Button>} />
      ) : (
        <ul className="divide-y divide-border border-y border-border">
          {list.map((i) => (
            <li key={i.id} className="grid grid-cols-[64px_minmax(0,1fr)] items-center gap-5 py-5 sm:grid-cols-[64px_minmax(0,1fr)_auto]">
              {"a" in i && i.a ? <Cover title={i.a.titleBn} author="" tone={i.a.tone} size="sm" /> : <BookCover book={i.b!} size="sm" />}
              <div className="min-w-0">
                <div className="eyebrow">{i.type}</div>
                <div className="mt-1 truncate font-display text-xl">{"a" in i && i.a ? i.a.titleEn : i.b!.titleEn}</div>
                <div className="truncate text-sm text-muted-foreground">{"a" in i && i.a ? i.a.authorEn : i.b!.authorEn}</div>
                {i.type === "Books" && i.b && <Availability book={i.b} className="mt-1" />}
              </div>
              <div className="col-start-2 flex items-center gap-2 sm:col-start-auto">
                {i.type === "Audio Books" && <Button size="sm" onClick={() => play(i.id)}>Listen</Button>}
                {i.type === "E-Books" && <Button size="sm" asChild><Link to="/read/$id" params={{ id: i.id }}>Read</Link></Button>}
                {i.type === "Books" && <Button size="sm" asChild><Link to="/book/$id" params={{ id: i.id }}>Reserve</Link></Button>}
                {i.type !== "Audio Books" && <Button size="sm" variant="ghost" asChild><Link to="/book/$id" params={{ id: i.id }}>View</Link></Button>}
                <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={() => toggleWish(i.id)}>Remove</Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
