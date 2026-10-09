import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertCircle, BookOpen, Headphones } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { BookCover, Cover, fmtDate, StatusBadge, taka } from "@/components/noholi";
import { audiobooks, fines, getBook, loans, readingActivity, user } from "@/lib/data";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/account/")({ head: () => ({ meta: [{"title": "My library overview \u2014 My Noholi"}, {"name": "description", "content": "Your Noholi membership, loans, requests and contributions at a glance."}, {"property": "og:title", "content": "My library overview \u2014 My Noholi"}, {"property": "og:description", "content": "Your Noholi membership, loans, requests and contributions at a glance."}, {"property": "og:type", "content": "website"}, {"name": "twitter:card", "content": "summary"}] }), component: Dashboard });

const daysLeft = (d: string) => Math.round((new Date(d).getTime() - new Date("2026-10-03").getTime()) / 86400000);

function Group({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return (
    <section className="grid gap-6 border-t border-foreground pt-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12">
      <div><div className="eyebrow">{eyebrow}</div><h2 className="mt-2 text-3xl">{title}</h2></div>
      <div>{children}</div>
    </section>
  );
}

function Stat({ to, n, label, note }: { to: string; n: ReactNode; label: string; note?: string }) {
  return (
    <Link to={to} className="group block border-b border-border py-4 sm:border-b-0 sm:border-r sm:px-5 sm:first:pl-0 sm:last:border-r-0">
      <div className="text-xs text-muted-foreground group-hover:text-foreground">{label}</div>
      <div className="mt-1 font-display text-3xl tabular-nums">{n}</div>
      {note && <div className="text-xs text-muted-foreground">{note}</div>}
    </Link>
  );
}

function Dashboard() {
  const { borrowRequests, contributions, recommendations, wishlist, play, lang } = useApp();
  const current = loans.filter((l) => l.status !== "returned");
  const overdue = loans.filter((l) => l.status === "overdue");
  const owed = fines.filter((f) => !f.paid).reduce((s, f) => s + f.amount, 0);
  const pendingReq = borrowRequests.filter((r) => ["Pending Review", "Approved", "Ready for Pickup"].includes(r.status));
  const drafts = contributions.filter((c) => c.status === "Draft").length;
  const published = contributions.filter((c) => c.status === "Published").length;
  const ebook = readingActivity[0]!, audio = readingActivity[1]!;
  const eb = getBook(ebook.id)!, au = audiobooks.find((a) => a.id === audio.id)!;
  const first = overdue[0];

  return (
    <div className="space-y-14">
      <section>
        <div className="eyebrow mb-3">Saturday, 3 October</div>
        <h1 className="text-5xl leading-tight md:text-6xl">{lang === "bn" ? "শুভ সন্ধ্যা, অর্ক।" : "Good evening, Aurko."}</h1>
        <p className="mt-3 text-muted-foreground">Member since {fmtDate(user.since)} · Free membership</p>
      </section>

      {first && (
        <div className="grid grid-cols-[24px_minmax(0,1fr)] gap-3 border border-destructive/40 bg-destructive/5 p-5 sm:grid-cols-[24px_minmax(0,1fr)_auto] sm:items-center">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <div><div className="font-medium">{getBook(first.bookId)!.titleEn} is {-daysLeft(first.due)} days overdue</div><div className="text-sm text-muted-foreground">Late returns may result in a fine according to library policy.</div></div>
          <Button variant="outline" size="sm" asChild className="col-span-2 w-fit sm:col-span-1"><Link to="/account/borrowed">See borrowed books</Link></Button>
        </div>
      )}

      <Group eyebrow="01" title="My library">
        <div className="grid border-y border-border sm:grid-cols-4">
          <Stat to="/account/borrowed" n={current.length} label="Currently borrowed" />
          <Stat to="/account/requests" n={pendingReq.length} label="Borrow requests" note={pendingReq.some((r) => r.status === "Ready for Pickup") ? "1 ready for pickup" : "In review"} />
          <Stat to="/account/borrowed" n={overdue.length} label="Overdue" />
          <Stat to="/account/fines" n={taka(owed)} label="Fines" />
        </div>
        <ul className="mt-4 divide-y divide-border">
          {current.map((l) => { const bk = getBook(l.bookId)!; const dl = daysLeft(l.due); return (
            <li key={l.bookId} className="grid grid-cols-[40px_minmax(0,1fr)_auto] items-center gap-4 py-3">
              <BookCover book={bk} size="sm" />
              <div className="min-w-0"><div className="truncate font-display text-lg">{bk.titleEn}</div><div className="text-xs text-muted-foreground">Return by {fmtDate(l.due)}</div></div>
              {dl < 0 ? <StatusBadge status="Overdue" /> : <span className="text-sm text-muted-foreground">{dl} days left</span>}
            </li>); })}
          {pendingReq.map((r) => { const bk = getBook(r.bookId)!; return (
            <li key={r.id} className="grid grid-cols-[40px_minmax(0,1fr)_auto] items-center gap-4 py-3">
              <BookCover book={bk} size="sm" />
              <div className="min-w-0"><div className="truncate font-display text-lg">{bk.titleEn}</div><div className="font-mono text-xs text-muted-foreground">{r.id}</div></div>
              <StatusBadge status={r.status} />
            </li>); })}
        </ul>
      </Group>

      <Group eyebrow="02" title="My content">
        <div className="grid border-y border-border sm:grid-cols-3">
          <Stat to="/account/contributions" n={contributions.length} label="My contributions" note={`${contributions.filter((c) => c.status === "Pending Review").length} pending review`} />
          <Stat to="/account/contributions" n={drafts} label="Drafts" />
          <Stat to="/account/contributions" n={published} label="Published" />
        </div>
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
          {(["Blogs", "Creative Writings", "Book Reviews", "Drafts", "Pending Review", "Published"] as const).map((f) => <Link key={f} to="/account/contributions" search={{ f }} className="underline underline-offset-4 hover:text-accent">{f === "Blogs" ? "My Blogs" : f === "Creative Writings" ? "My Creative Writings" : f === "Book Reviews" ? "My Book Reviews" : f}</Link>)}
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild><Link to="/account/contribute" search={{ type: "blog" }}>Submit a Blog</Link></Button>
          <Button variant="outline" size="sm" asChild><Link to="/account/contribute" search={{ type: "creative" }}>Submit Creative Writing</Link></Button>
          <Button variant="outline" size="sm" asChild><Link to="/account/contribute" search={{ type: "review" }}>Write a Book Review</Link></Button>
        </div>
      </Group>

      <Group eyebrow="03" title="My activity">
        <div className="grid border-y border-border sm:grid-cols-2">
          <Stat to="/account/wishlist" n={wishlist.length} label="Wishlist" note="Saved books, e-books and audio" />
          <Stat to="/account/recommend" n={recommendations.length} label="Book recommendations" note={recommendations[0] ? `Latest: ${recommendations[0].status}` : undefined} />
        </div>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Link to="/read/$id" params={{ id: eb.id }} className="group grid grid-cols-[72px_minmax(0,1fr)] gap-5 border border-border p-5 hover:border-foreground/40">
            <BookCover book={eb} size="sm" />
            <div className="flex flex-col"><div className="eyebrow flex items-center gap-2"><BookOpen className="h-3.5 w-3.5" /> Reading history</div><div className="mt-2 font-bangla text-xl">{eb.titleBn}</div><div className="text-sm text-muted-foreground">{eb.authorEn}</div>
              <div className="mt-auto pt-3"><div className="h-1 bg-border"><div className="h-full bg-accent" style={{ width: `${ebook.progress * 100}%` }} /></div><div className="mt-2 text-xs text-muted-foreground">{Math.round(ebook.progress * 100)}% · {ebook.when} · Continue</div></div></div>
          </Link>
          <button onClick={() => play(au.id)} className="group grid grid-cols-[72px_minmax(0,1fr)] gap-5 border border-border p-5 text-left hover:border-foreground/40">
            <Cover title={au.titleBn} author="" tone={au.tone} size="sm" />
            <div className="flex flex-col"><div className="eyebrow flex items-center gap-2"><Headphones className="h-3.5 w-3.5" /> Listening history</div><div className="mt-2 font-display text-xl">{au.titleEn}</div><div className="text-sm text-muted-foreground">Read by {au.narrator}</div>
              <div className="mt-auto pt-3"><div className="h-1 bg-border"><div className="h-full bg-accent" style={{ width: `${audio.progress * 100}%` }} /></div><div className="mt-2 text-xs text-muted-foreground">{Math.round(audio.progress * 100)}% · {audio.when} · Resume</div></div></div>
          </button>
        </div>
      </Group>
    </div>
  );
}
