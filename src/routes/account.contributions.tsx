import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Empty, fmtDate, StatusBadge } from "@/components/noholi";
import { getBook } from "@/lib/data";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/account/contributions")({
  head: () => ({ meta: [{ title: "My contributions — My Noholi" }, { name: "description", content: "Your blogs, creative writing and book reviews submitted to Noholi." }] }),
  component: Contributions,
});

const tabs = ["Drafts", "Pending Review", "Published", "Rejected"] as const;
const inTab = (t: (typeof tabs)[number], s: string) => t === "Drafts" ? s === "Draft" : t === "Published" ? s === "Published" || s === "Approved" : s === t;
const kindLabel = { blog: "Blog", creative: "Creative Writing", review: "Book Review" } as const;

export function ContributeLinks() {
  return (
    <div className="grid gap-px border border-border bg-border sm:grid-cols-3">
      {([["blog", "Submit a Blog", "News, essays and notes on reading."], ["creative", "Submit Creative Writing", "Poems, stories and lyric prose."], ["review", "Submit a Book Review", "Tell other readers about a book."]] as const).map(([k, t, d]) => (
        <Link key={k} to="/account/contribute" search={{ type: k }} className="group bg-background p-5 transition-colors hover:bg-muted"><div className="font-display text-xl group-hover:text-accent">{t} →</div><div className="mt-1 text-sm text-muted-foreground">{d}</div></Link>
      ))}
    </div>
  );
}

function Contributions() {
  const { contributions } = useApp();
  const [tab, setTab] = useState<(typeof tabs)[number]>("Pending Review");
  const list = contributions.filter((c) => inTab(tab, c.status));
  return (
    <>
      <h1 className="text-4xl">My contributions</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Everything you send is read by the Noholi editors before it appears on the website. Nothing is published automatically.</p>
      <div className="mt-8"><ContributeLinks /></div>
      <div className="mt-12 flex gap-6 overflow-x-auto border-b border-border" role="tablist">
        {tabs.map((t) => <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={cn("-mb-px whitespace-nowrap border-b-2 pb-3 text-sm", tab === t ? "border-foreground" : "border-transparent text-muted-foreground hover:text-foreground")}>{t} <span className="tabular-nums opacity-60">{contributions.filter((c) => inTab(t, c.status)).length}</span></button>)}
      </div>
      {list.length === 0 ? (
        <div className="mt-8"><Empty title="Your writing journey starts here." body={tab === "Drafts" ? "Drafts you save will wait here until you're ready." : "Nothing in this list yet."} /></div>
      ) : (
        <ul className="divide-y divide-border">
          {list.map((c) => (
            <li key={c.id} className="grid gap-2 py-5 sm:grid-cols-[minmax(0,1fr)_160px] sm:items-start">
              <div className="min-w-0">
                <div className="eyebrow">{kindLabel[c.kind]}{c.bookId && ` · ${getBook(c.bookId)?.titleEn}`}</div>
                <div className="mt-1 font-display text-xl">{c.title}</div>
                <div className="text-xs text-muted-foreground">{c.id} · updated {fmtDate(c.updated)}</div>
                {c.note && <p className="mt-3 border-l-2 border-border pl-3 text-sm text-muted-foreground">{c.note}</p>}
              </div>
              <div className="sm:text-right"><StatusBadge status={c.status} />{c.status === "Pending Review" && <div className="mt-1 text-xs text-muted-foreground">Editors reply within a week</div>}</div>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-10"><Button variant="outline" asChild><Link to="/writeups">Read published write ups</Link></Button></div>
    </>
  );
}
