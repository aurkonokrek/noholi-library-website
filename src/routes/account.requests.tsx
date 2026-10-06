import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BookCover, Empty, fmtDate, StatusBadge } from "@/components/noholi";
import { getBook } from "@/lib/data";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/account/requests")({
  head: () => ({ meta: [{ title: "Borrow requests — My Noholi" }, { name: "description", content: "Track your Noholi borrow requests." }] }),
  component: Requests,
});

const filters = ["Open", "All", "Past"] as const;
const open = ["Pending Review", "Approved", "Ready for Pickup", "Active", "Overdue"];

function Requests() {
  const { borrowRequests } = useApp();
  const [f, setF] = useState<(typeof filters)[number]>("Open");
  const list = borrowRequests.filter((r) => f === "All" || (f === "Open" ? open.includes(r.status) : !open.includes(r.status)));
  return (
    <>
      <div className="mb-8 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <div><h1 className="text-4xl">Borrow requests</h1><p className="mt-2 text-sm text-muted-foreground">Borrowing is free. Each request is checked by the librarian before pickup.</p></div>
        <div className="flex gap-2">{filters.map((x) => <button key={x} onClick={() => setF(x)} aria-pressed={f === x} className={cn("h-8 rounded-full border px-4 text-sm", f === x ? "border-foreground bg-foreground text-background" : "border-border")}>{x}</button>)}</div>
      </div>
      {list.length === 0 ? (
        <Empty title="No borrow requests here." body="Find a book on the shelves and choose Borrow to send a request." action={<Button asChild><Link to="/library/books">Browse books</Link></Button>} />
      ) : (
        <ul className="divide-y divide-border border-y border-border">
          {list.map((r) => { const b = getBook(r.bookId)!; return (
            <li key={r.id} className="grid grid-cols-[56px_minmax(0,1fr)] gap-5 py-5 md:grid-cols-[56px_minmax(0,1fr)_180px_150px] md:items-center">
              <BookCover book={b} size="sm" />
              <div className="min-w-0">
                <Link to="/book/$id" params={{ id: b.id }} className="block truncate font-display text-xl hover:text-accent">{b.titleEn}</Link>
                <div className="truncate text-sm text-muted-foreground">{b.authorEn} · {r.copy}</div>
                <div className="mt-1 font-mono text-xs text-muted-foreground">{r.id}</div>
              </div>
              <dl className="col-start-2 text-sm md:col-start-auto"><dt className="sr-only">Dates</dt><dd className="text-muted-foreground">Requested {fmtDate(r.submitted)}</dd><dd>Return by {fmtDate(r.due)}</dd></dl>
              <div className="col-start-2 md:col-start-auto"><StatusBadge status={r.status} /><div className="mt-1 text-xs text-muted-foreground">{r.status === "Ready for Pickup" ? "Collect from the front desk with your NID" : r.status === "Pending Review" ? "Usually 1–2 working days" : r.status === "Overdue" ? "Please return as soon as you can" : ""}</div></div>
            </li>); })}
        </ul>
      )}
    </>
  );
}
