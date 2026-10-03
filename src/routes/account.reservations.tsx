import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { BookCover, Empty, fmtDate } from "@/components/noholi";
import { getBook } from "@/lib/data";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/account/reservations")({ component: Reservations });

function Reservations() {
  const { reservations } = useApp();
  return (
    <>
      <h1 className="mb-8 text-4xl">Reservations</h1>
      {reservations.length === 0 ? <Empty title="No reservations" body="Reserve a book from its page and we'll hold it for you." action={<Button asChild><Link to="/library/books">Find a book</Link></Button>} /> : (
        <div className="grid gap-6 md:grid-cols-2">
          {reservations.map((r) => { const b = getBook(r.bookId)!; const ready = r.status.startsWith("Ready"); return (
            <div key={r.bookId} className="grid grid-cols-[96px_minmax(0,1fr)] gap-6 border border-border p-6">
              <BookCover book={b} size="sm" />
              <div className="flex min-w-0 flex-col">
                <span className={ready ? "text-xs font-medium text-success" : "text-xs font-medium text-warning"}>● {r.status}</span>
                <Link to="/book/$id" params={{ id: b.id }} className="mt-2 font-display text-2xl leading-tight hover:text-accent">{b.titleEn}</Link>
                <div className="text-sm text-muted-foreground">{b.authorEn}</div>
                <dl className="mt-4 space-y-1 text-sm"><div className="flex gap-2"><dt className="text-muted-foreground">Reserved</dt><dd>{fmtDate(r.date)}</dd></div><div className="flex gap-2"><dt className="text-muted-foreground">{ready ? "Pickup" : "Expected"}</dt><dd>{r.expected}</dd></div></dl>
                <div className="mt-auto pt-4 text-xs text-muted-foreground">{ready ? "Collect from the front desk with your card." : "We'll SMS you when it's ready."}</div>
              </div>
            </div>); })}
        </div>
      )}
    </>
  );
}
