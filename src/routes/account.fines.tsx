import { createFileRoute } from "@tanstack/react-router";
import { fmtDate, StatusBadge, taka } from "@/components/noholi";
import { fines, getBook, loans } from "@/lib/data";

export const Route = createFileRoute("/account/fines")({ component: Fines });

function Fines() {
  const due = fines.filter((f) => !f.paid);
  const total = due.reduce((s, f) => s + f.amount, 0);

  return (
    <>
      <h1 className="text-4xl">Fines</h1>
      <p className="mb-8 mt-2 max-w-2xl text-sm text-muted-foreground">Borrowing is always free. Fines only apply to late returns, damage or loss, according to library policy. Please settle any fine at the front desk.</p>
      <div className="grid gap-6 border-y border-foreground py-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
        <div><div className="eyebrow">Outstanding</div><div className="mt-2 font-display text-6xl">{taka(total)}</div><div className="mt-1 text-sm text-muted-foreground">{due.length ? "Overdue fines accrue at ৳10 per day per book." : "No outstanding fines. Thank you!"}</div></div>
      </div>
      <table className="mt-10 w-full text-left text-sm">
        <thead className="text-xs text-muted-foreground"><tr className="border-b border-border"><th className="py-3 font-normal">Reference</th><th className="font-normal">Book</th><th className="hidden font-normal md:table-cell">Reason</th><th className="hidden font-normal sm:table-cell">Due date</th><th className="font-normal">Amount</th><th className="font-normal">Status</th></tr></thead>
        <tbody>
          {fines.map((f) => (
            <tr key={f.id} className="border-b border-border">
              <td className="py-4 tabular-nums text-muted-foreground">{f.id}</td>
              <td className="font-display text-base">{getBook(f.bookId)!.titleEn}</td>
              <td className="hidden md:table-cell">{f.reason}</td>
              <td className="hidden sm:table-cell">{fmtDate(loans.find((l) => l.bookId === f.bookId)?.due ?? f.date)}</td>
              <td className="tabular-nums">{taka(f.amount)}</td>
              <td><StatusBadge status={f.paid ? "Cleared" : "Due"} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
