import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookCover, Empty, fmtDate } from "@/components/noholi";
import { getBook, loans } from "@/lib/data";

export const Route = createFileRoute("/account/borrowed")({ head: () => ({ meta: [{"title": "Borrowed books \u2014 My Noholi"}, {"name": "description", "content": "View your current Noholi loans and return dates."}, {"property": "og:title", "content": "Borrowed books \u2014 My Noholi"}, {"property": "og:description", "content": "View your current Noholi loans and return dates."}, {"property": "og:type", "content": "website"}, {"name": "twitter:card", "content": "summary"}] }), component: Borrowed });

type Loan = (typeof loans)[number];

function Rows({ list }: { list: Loan[] }) {
  if (!list.length) return <Empty title="Nothing here" body="No books in this list. Your next favourite is waiting on the shelf." action={<Button variant="outline" asChild><Link to="/library/books">Browse books</Link></Button>} />;
  return (
    <div className="divide-y divide-border border-y border-border">
      <div className="hidden grid-cols-[56px_minmax(0,1fr)_120px_120px_140px_auto] gap-6 py-3 text-xs text-muted-foreground md:grid"><span /><span>Book</span><span>Issued</span><span>Due</span><span>Status</span><span /></div>
      {list.map((l) => { const b = getBook(l.bookId)!; return (
        <div key={l.bookId} className="grid grid-cols-[56px_minmax(0,1fr)] items-center gap-x-5 gap-y-2 py-5 md:grid-cols-[56px_minmax(0,1fr)_120px_120px_140px_auto] md:gap-6">
          <BookCover book={b} size="sm" />
          <div className="min-w-0"><Link to="/book/$id" params={{ id: b.id }} className="font-display text-lg hover:text-accent">{b.titleEn}</Link><div className="truncate text-sm text-muted-foreground">{b.authorEn}</div></div>
          <span className="col-start-2 text-sm md:col-start-auto"><span className="text-muted-foreground md:hidden">Issued </span>{fmtDate(l.issued)}</span>
          <span className="col-start-2 text-sm md:col-start-auto"><span className="text-muted-foreground md:hidden">Due </span>{fmtDate(l.due)}</span>
          <span className={`col-start-2 text-sm md:col-start-auto ${l.status === "overdue" ? "text-destructive" : l.status === "current" ? "text-success" : "text-muted-foreground"}`}>● {l.status === "returned" ? `Returned ${fmtDate((l as { returned?: string }).returned!)}` : l.status === "overdue" ? "Overdue" : "On loan"}</span>
          <div className="col-start-2 md:col-start-auto">{l.status !== "returned" ? <Button size="sm" variant="outline" onClick={() => toast("Renewed for 14 more days", { description: b.titleEn })}>Renew</Button> : <Button size="sm" variant="ghost" asChild><Link to="/book/$id" params={{ id: b.id }}>Borrow again</Link></Button>}</div>
        </div>); })}
    </div>
  );
}

function Borrowed() {
  return (
    <>
      <h1 className="mb-8 text-4xl">Borrowed books</h1>
      <Tabs defaultValue="current">
        <TabsList className="mb-8 h-auto rounded-none bg-transparent p-0">
          {[["current", "Current"], ["history", "History"], ["overdue", "Overdue"]].map(([v, l]) => (
            <TabsTrigger key={v} value={v} className="rounded-full border border-border px-4 py-1.5 data-[state=active]:border-foreground data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=active]:shadow-none">{l}</TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="current"><Rows list={loans.filter((l) => l.status !== "returned")} /></TabsContent>
        <TabsContent value="history"><Rows list={loans.filter((l) => l.status === "returned")} /></TabsContent>
        <TabsContent value="overdue"><Rows list={loans.filter((l) => l.status === "overdue")} /></TabsContent>
      </Tabs>
    </>
  );
}
