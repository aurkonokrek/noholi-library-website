import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { fmtDate, taka } from "@/components/noholi";
import { fines as initial, getBook } from "@/lib/data";

export const Route = createFileRoute("/account/fines")({ component: Fines });

function Fines() {
  const [fines, setFines] = useState(initial);
  const [paying, setPaying] = useState<0 | 1 | 2>(0);
  const due = fines.filter((f) => !f.paid);
  const total = due.reduce((s, f) => s + f.amount, 0);

  return (
    <>
      <h1 className="mb-8 text-4xl">Fines</h1>
      <div className="grid gap-6 border-y border-foreground py-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
        <div><div className="eyebrow">Outstanding</div><div className="mt-2 font-display text-6xl">{taka(total)}</div><div className="mt-1 text-sm text-muted-foreground">{due.length ? "Overdue fines accrue at ৳10 per day per book." : "You're all clear. Thank you!"}</div></div>
        {total > 0 && <Button size="lg" variant="accent" onClick={() => setPaying(1)}>Pay {taka(total)}</Button>}
      </div>
      <table className="mt-10 w-full text-left text-sm">
        <thead className="text-xs text-muted-foreground"><tr className="border-b border-border"><th className="py-3 font-normal">Reference</th><th className="font-normal">Book</th><th className="hidden font-normal md:table-cell">Reason</th><th className="hidden font-normal sm:table-cell">Date</th><th className="font-normal">Amount</th><th className="font-normal">Status</th></tr></thead>
        <tbody>
          {fines.map((f) => (
            <tr key={f.id} className="border-b border-border">
              <td className="py-4 tabular-nums text-muted-foreground">{f.id}</td>
              <td className="font-display text-base">{getBook(f.bookId)!.titleEn}</td>
              <td className="hidden md:table-cell">{f.reason}</td>
              <td className="hidden sm:table-cell">{fmtDate(f.date)}</td>
              <td className="tabular-nums">{taka(f.amount)}</td>
              <td className={f.paid ? "text-success" : "text-destructive"}>● {f.paid ? "Paid" : "Due"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Dialog open={paying > 0} onOpenChange={(o) => !o && setPaying(0)}>
        <DialogContent className="rounded-sm sm:max-w-md">
          {paying === 1 ? (
            <>
              <DialogTitle className="font-display text-3xl font-normal">Pay {taka(total)}</DialogTitle>
              <DialogDescription>Demo payment — no money will be charged.</DialogDescription>
              <div className="mt-2 grid grid-cols-3 gap-2">{["bKash", "Nagad", "Card"].map((m, i) => <button key={m} className={`h-14 border text-sm ${i === 0 ? "border-foreground bg-muted" : "border-border"}`}>{m}</button>)}</div>
              <Button className="mt-4 w-full" size="lg" onClick={() => { setFines((x) => x.map((f) => ({ ...f, paid: true }))); setPaying(2); }}>Confirm payment</Button>
            </>
          ) : (
            <div className="py-4 text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-success text-background"><Check /></div>
              <DialogTitle className="mt-6 font-display text-3xl font-normal">Payment received</DialogTitle>
              <DialogDescription className="mt-2">A receipt has been sent to aurko@example.com.</DialogDescription>
              <Button className="mt-6" variant="outline" onClick={() => setPaying(0)}>Done</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
