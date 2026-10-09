import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Empty, fmtDate, Stars, StatusBadge } from "@/components/noholi";
import type { Contribution } from "@/lib/data";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

const filters = ["All", "Blogs", "Creative Writings", "Book Reviews", "Drafts", "Pending Review", "Published", "Rejected"] as const;
type F = (typeof filters)[number];

export const Route = createFileRoute("/account/contributions")({
  validateSearch: z.object({ f: z.enum(filters).optional() }),
  head: () => ({ meta: [{ title: "My contributions — My Noholi" }, { name: "description", content: "Your blogs, creative writing and book reviews submitted to Noholi." },
      { property: "og:title", content: "My contributions — My Noholi" },
      { property: "og:description", content: "Your blogs, creative writing and book reviews submitted to Noholi." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ] }),
  component: Contributions,
});

const match = (f: F, c: Contribution) => {
  switch (f) {
    case "All": return true;
    case "Blogs": return c.kind === "blog";
    case "Creative Writings": return c.kind === "creative";
    case "Book Reviews": return c.kind === "review";
    case "Drafts": return c.status === "Draft";
    case "Published": return c.status === "Published" || c.status === "Approved";
    default: return c.status === f;
  }
};
const kindLabel = { blog: "Blog", creative: "Creative Writing", review: "Book Review" } as const;

function Contributions() {
  const { contributions, removeContribution } = useApp();
  const { f = "All" } = Route.useSearch();
  const list = contributions.filter((c) => match(f, c));
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <div><h1 className="text-4xl">My contributions</h1><p className="mt-2 max-w-2xl text-sm text-muted-foreground">Everything you send is read by Noholi's editors before it appears on the website. Nothing is published automatically.</p></div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" asChild><Link to="/account/contribute" search={{ type: "blog" }}>Submit a Blog</Link></Button>
          <Button size="sm" variant="outline" asChild><Link to="/account/contribute" search={{ type: "creative" }}>Submit Creative Writing</Link></Button>
          <Button size="sm" variant="outline" asChild><Link to="/account/contribute" search={{ type: "review" }}>Write a Book Review</Link></Button>
        </div>
      </div>
      <nav className="mt-10 flex gap-5 overflow-x-auto border-b border-border" aria-label="Filter contributions">
        {filters.map((x) => <Link key={x} to="/account/contributions" search={x === "All" ? {} : { f: x }} aria-current={f === x ? "page" : undefined} className={cn("-mb-px whitespace-nowrap border-b-2 pb-3 text-sm", f === x ? "border-foreground" : "border-transparent text-muted-foreground hover:text-foreground")}>{x} <span className="tabular-nums opacity-60">{contributions.filter((c) => match(x, c)).length}</span></Link>)}
      </nav>
      {list.length === 0 ? (
        <div className="mt-8"><Empty title="Your writing journey starts here." body={f === "Drafts" ? "Drafts you save will wait here until you're ready." : "Nothing in this list yet."} action={<Button asChild><Link to="/writeups">Explore Write Ups</Link></Button>} /></div>
      ) : (
        <ul className="divide-y divide-border">
          {list.map((c) => (
            <li key={c.id} className="grid gap-3 py-5 md:grid-cols-[minmax(0,1fr)_150px_auto] md:items-center">
              <div className="min-w-0">
                <div className="eyebrow">{kindLabel[c.kind]}{c.bookTitle && ` · ${c.bookTitle}`}</div>
                <div className="mt-1 font-display text-xl">{c.title}</div>
                <div className="flex flex-wrap items-center gap-x-3 text-xs text-muted-foreground"><span className="font-mono">{c.id}</span><span>Last updated {fmtDate(c.updated)}</span>{c.rating ? <Stars n={c.rating} /> : null}</div>
                {c.note && <p className="mt-3 border-l-2 border-border pl-3 text-sm text-muted-foreground">{c.note}</p>}
              </div>
              <div><StatusBadge status={c.status} />{c.status === "Pending Review" && <div className="mt-1 text-xs text-muted-foreground">Editors reply within a week</div>}</div>
              <div className="flex flex-wrap gap-2 md:justify-end">
                {c.status === "Draft" && <>
                  <Button size="sm" asChild><Link to="/account/contribute" search={{ type: c.kind, ...(c.bookId ? { book: c.bookId } : {}) }}>Continue writing</Link></Button>
                  <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={() => removeContribution(c.id)}>Delete draft</Button>
                </>}
                {c.status === "Rejected" && <Button size="sm" variant="outline" asChild><Link to="/account/contribute" search={{ type: c.kind }}>Edit & resubmit</Link></Button>}
                {c.status === "Published" && c.slug && <Button size="sm" variant="outline" asChild><Link to="/article/$slug" params={{ slug: c.slug }}>View</Link></Button>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
