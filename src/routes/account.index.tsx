import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertCircle, ArrowRight, BookOpen, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BookCover, Cover, fmtDate, taka } from "@/components/noholi";
import { audiobooks, fines, getBook, loans, readingActivity, user } from "@/lib/data";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/account/")({ component: Dashboard });

const daysLeft = (d: string) => Math.round((new Date(d).getTime() - new Date("2026-10-03").getTime()) / 86400000);

function Dashboard() {
  const { reservations, wishlist, play, lang } = useApp();
  const current = loans.filter((l) => l.status !== "returned");
  const overdue = loans.filter((l) => l.status === "overdue");
  const owed = fines.filter((f) => !f.paid).reduce((s, f) => s + f.amount, 0);
  const ebook = readingActivity[0], audio = readingActivity[1];
  const eb = getBook(ebook.id)!, au = audiobooks.find((a) => a.id === audio.id)!;

  return (
    <div className="space-y-16">
      <section className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="eyebrow mb-3">Saturday, 3 October</div>
          <h1 className="text-5xl leading-tight md:text-6xl">{lang === "bn" ? "শুভ সন্ধ্যা, অর্ক।" : "Good evening, Aurko."}</h1>
          <p className="mt-3 text-muted-foreground">Patron since {fmtDate(user.since)} · {user.plan}, renews {fmtDate(user.expires)}</p>
        </div>
        <dl className="grid grid-cols-4 border-y border-foreground lg:col-span-5">
          {[[current.length, "On loan"], [overdue.length, "Overdue"], [reservations.length, "Reserved"], [taka(owed), "Fines due"]].map(([n, l]) => (
            <div key={l as string} className="border-r border-border py-5 pl-4 last:border-r-0"><dt className="text-xs text-muted-foreground">{l}</dt><dd className="mt-1 font-display text-3xl">{n}</dd></div>
          ))}
        </dl>
      </section>

      {overdue.length > 0 && (
        <div className="grid grid-cols-[24px_minmax(0,1fr)] gap-3 border border-destructive/40 bg-destructive/5 p-5 sm:grid-cols-[24px_minmax(0,1fr)_auto] sm:items-center">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <div><div className="font-medium">{getBook(overdue[0].bookId)!.titleEn} is {-daysLeft(overdue[0].due)} days overdue</div><div className="text-sm text-muted-foreground">A fine of ৳10/day applies. Return or renew to stop it growing.</div></div>
          <Button variant="outline" size="sm" asChild className="col-span-2 w-fit sm:col-span-1"><Link to="/account/borrowed">Renew or return</Link></Button>
        </div>
      )}

      <section className="grid gap-6 md:grid-cols-2">
        <Link to="/read/$id" params={{ id: eb.id }} className="group grid grid-cols-[96px_minmax(0,1fr)] gap-6 bg-secondary p-6">
          <BookCover book={eb} size="sm" />
          <div className="flex flex-col"><div className="eyebrow flex items-center gap-2"><BookOpen className="h-3.5 w-3.5" /> Continue reading</div><div className="mt-2 font-bangla text-2xl">{eb.titleBn}</div><div className="text-sm text-muted-foreground">{eb.authorEn}</div>
            <div className="mt-auto pt-4"><div className="h-1 bg-border"><div className="h-full bg-accent" style={{ width: `${ebook.progress * 100}%` }} /></div><div className="mt-2 text-xs text-muted-foreground">{Math.round(ebook.progress * 100)}% · {ebook.when}</div></div></div>
        </Link>
        <button onClick={() => play(au.id)} className="group grid grid-cols-[96px_minmax(0,1fr)] gap-6 bg-foreground p-6 text-left text-background">
          <Cover title={au.titleBn} author="" tone={au.tone} size="sm" />
          <div className="flex flex-col"><div className="eyebrow flex items-center gap-2 !text-background/60"><Headphones className="h-3.5 w-3.5" /> Continue listening</div><div className="mt-2 font-display text-2xl">{au.titleEn}</div><div className="text-sm text-background/60">{au.narrator}</div>
            <div className="mt-auto pt-4"><div className="h-1 bg-background/20"><div className="h-full bg-accent" style={{ width: `${audio.progress * 100}%` }} /></div><div className="mt-2 text-xs text-background/60">{Math.round(audio.progress * 100)}% · {audio.when}</div></div></div>
        </button>
      </section>

      <section className="grid gap-16 lg:grid-cols-2">
        <div>
          <div className="mb-2 flex items-end justify-between rule-top pt-5"><h2 className="text-3xl">Borrowed now</h2><Link to="/account/borrowed" className="text-sm hover:text-accent">All loans →</Link></div>
          <ul className="divide-y divide-border">
            {current.map((l) => { const bk = getBook(l.bookId)!; const dl = daysLeft(l.due); return (
              <li key={l.bookId} className="grid grid-cols-[48px_minmax(0,1fr)_auto] items-center gap-4 py-4">
                <BookCover book={bk} size="sm" />
                <div className="min-w-0"><div className="truncate font-display text-lg">{bk.titleEn}</div><div className="text-xs text-muted-foreground">Due {fmtDate(l.due)}</div></div>
                <span className={dl < 0 ? "text-sm text-destructive" : dl <= 3 ? "text-sm text-warning" : "text-sm text-muted-foreground"}>{dl < 0 ? `${-dl}d overdue` : `${dl} days left`}</span>
              </li>); })}
          </ul>
        </div>
        <div>
          <div className="mb-2 flex items-end justify-between rule-top pt-5"><h2 className="text-3xl">Reservations</h2><Link to="/account/reservations" className="text-sm hover:text-accent">Manage →</Link></div>
          <ul className="divide-y divide-border">
            {reservations.map((r) => { const bk = getBook(r.bookId)!; return (
              <li key={r.bookId} className="grid grid-cols-[48px_minmax(0,1fr)] items-center gap-4 py-4">
                <BookCover book={bk} size="sm" />
                <div className="min-w-0"><div className="truncate font-display text-lg">{bk.titleEn}</div><div className={r.status.startsWith("Ready") ? "text-xs text-success" : "text-xs text-muted-foreground"}>{r.status} · {r.expected}</div></div>
              </li>); })}
          </ul>
        </div>
      </section>

      <section>
        <div className="mb-8 flex items-end justify-between rule-top pt-5"><h2 className="text-3xl">From your wishlist</h2><Link to="/account/wishlist" className="inline-flex items-center gap-1 text-sm hover:text-accent">{wishlist.length} saved <ArrowRight className="h-4 w-4" /></Link></div>
        <div className="grid grid-cols-3 gap-6 sm:grid-cols-4 lg:grid-cols-6">
          {wishlist.map((id) => getBook(id)).filter(Boolean).slice(0, 6).map((b) => (
            <Link key={b!.id} to="/book/$id" params={{ id: b!.id }}><BookCover book={b!} size="sm" /><div className="mt-2 truncate text-sm">{b!.titleEn}</div></Link>
          ))}
        </div>
      </section>

      <section className="flex flex-wrap gap-3 border-t border-border pt-8">
        <Button variant="outline" asChild><Link to="/library/books">Find a book</Link></Button>
        <Button variant="outline" asChild><Link to="/library/ebooks">Open e-books</Link></Button>
        <Button variant="outline" asChild><Link to="/account/borrowed">View borrowed books</Link></Button>
        <Button variant="outline" asChild><Link to="/account/wishlist">View wishlist</Link></Button>
      </section>
    </div>
  );
}
