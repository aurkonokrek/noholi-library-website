import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Check, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Availability, BookCard, BookCover, taka, WishButton } from "@/components/noholi";
import { availability, books, getBook, user } from "@/lib/data";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/book/$id")({
  loader: ({ params }) => {
    const book = getBook(params.id);
    if (!book) throw notFound();
    return { book };
  },
  head: ({ loaderData }) => ({
    meta: loaderData ? [
      { title: `${loaderData.book.titleEn} by ${loaderData.book.authorEn} — Noholi Library` },
      { name: "description", content: loaderData.book.description },
      { property: "og:title", content: `${loaderData.book.titleEn} — Noholi Library` },
      { property: "og:description", content: loaderData.book.description },
    ] : [],
  }),
  notFoundComponent: () => (
    <div className="container-page py-32 text-center"><h1 className="text-5xl">Book not found</h1><p className="mt-3 text-muted-foreground">It may have been withdrawn from the catalogue.</p><Button className="mt-8" asChild><Link to="/library/books">Back to library</Link></Button></div>
  ),
  component: BookPage,
});

function BookPage() {
  const { book } = Route.useLoaderData();
  const { loggedIn, reserve, reservations } = useApp();
  const nav = useNavigate();
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const a = availability(book);
  const reserved = reservations.some((r) => r.bookId === book.id);
  const related = books.filter((b) => b.id !== book.id && (b.authorEn === book.authorEn || b.category === book.category)).slice(0, 4);
  const back = book.noholi ? "/library/noholi" : "/library/books";

  const meta: [string, string | number][] = [
    ["Genre", book.genre], ["Category", book.category], ["Language", book.language], ["Publisher", book.publisher],
    ["Year", book.year], ["Edition", book.edition], ["ISBN", book.isbn], ["Pages", book.pages],
    ["Condition", book.condition], ["Copies", `${book.availableCopies} of ${book.totalCopies} on shelf`], ["List price", taka(book.price)],
  ];

  const onReserve = () => { if (!loggedIn) { nav({ to: "/login" }); return; } setStep(1); };

  return (
    <>
      <div className="container-page pt-8"><Link to={back} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Back to {book.noholi ? "Noholi Books" : "Library"}</Link></div>
      <section className="container-page grid gap-12 pb-16 pt-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4">
          <div className="bg-secondary p-10 md:p-14"><BookCover book={book} size="lg" className="mx-auto w-full max-w-[280px]" /></div>
        </div>
        <div className="lg:col-span-8">
          <div className="eyebrow mb-4">{book.noholi ? "Noholi Prokash" : book.genre} · {book.category}</div>
          <h1 className="font-bangla text-5xl leading-tight md:text-6xl">{book.titleBn}</h1>
          <div className="mt-2 font-display text-2xl italic text-muted-foreground">{book.titleEn}</div>
          <div className="mt-5 text-lg">{book.authorEn} <span className="font-bangla text-muted-foreground">· {book.authorBn}</span></div>

          <div className="mt-8 border-y border-border py-5">
            {a === "unavailable" ? (
              <div className="flex items-start gap-3"><Clock className="mt-0.5 h-5 w-5 text-muted-foreground" /><div><div className="font-medium">Currently unavailable</div><div className="text-sm text-muted-foreground">All {book.totalCopies} copies are on loan. Reserve to join the queue — we'll hold the next returned copy for you.</div></div></div>
            ) : (
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2"><Availability book={book} className="text-sm" /><span className="text-sm text-muted-foreground">Shelf mark: {book.language === "Bangla" ? "BN" : "EN"}-{book.genre === "Fiction" ? "F" : "NF"}-{book.year}</span></div>
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {reserved ? (
              <Button size="lg" variant="outline" asChild><Link to="/account/reservations"><Check /> Reserved — view reservation</Link></Button>
            ) : (
              <Button size="lg" variant={a === "unavailable" ? "default" : "accent"} onClick={onReserve}>{a === "unavailable" ? "Join the waiting list" : "Reserve this book"}</Button>
            )}
            {book.ebook && <Button size="lg" variant="outline" asChild><Link to="/read/$id" params={{ id: book.id }}>Read e-book</Link></Button>}
            <WishButton id={book.id} label className="ml-2" />
          </div>

          <p className="mt-10 max-w-2xl font-display text-xl leading-relaxed">{book.description}</p>

          <dl className="mt-12 grid gap-x-10 sm:grid-cols-2">
            {meta.map(([k, v]) => (
              <div key={k} className="grid grid-cols-[120px_minmax(0,1fr)] border-b border-border py-3 text-sm"><dt className="text-muted-foreground">{k}</dt><dd className="tabular-nums">{v}</dd></div>
            ))}
          </dl>
        </div>
      </section>

      {related.length > 0 && (
        <section className="container-page mt-10">
          <h2 className="mb-10 rule-top pt-5 text-3xl">You might also borrow</h2>
          <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-4">{related.map((b) => <BookCard key={b.id} book={b} />)}</div>
        </section>
      )}

      <Dialog open={step > 0} onOpenChange={(o) => !o && setStep(0)}>
        <DialogContent className="rounded-sm sm:max-w-lg">
          {step === 1 ? (
            <>
              <DialogTitle className="font-display text-3xl font-normal">Confirm reservation</DialogTitle>
              <DialogDescription>Check the details below. You can cancel any time from your dashboard.</DialogDescription>
              <div className="mt-2 grid grid-cols-[72px_minmax(0,1fr)] gap-4 border-y border-border py-5">
                <BookCover book={book} size="sm" />
                <div className="text-sm"><div className="font-display text-lg">{book.titleEn}</div><div className="text-muted-foreground">{book.authorEn}</div><Availability book={book} className="mt-2" /></div>
              </div>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-muted-foreground">Patron</dt><dd>{user.name} · {user.memberId}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Pickup</dt><dd>Front desk, Dhanmondi</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Expected</dt><dd>{a === "unavailable" ? "Within 7–10 days" : "Ready tomorrow after 2pm"}</dd></div>
              </dl>
              <div className="mt-4 flex justify-end gap-2"><Button variant="ghost" onClick={() => setStep(0)}>Cancel</Button><Button variant="accent" onClick={() => { reserve(book.id); setStep(2); }}>Confirm reservation</Button></div>
            </>
          ) : (
            <div className="py-4 text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-success text-background"><Check className="h-6 w-6" /></div>
              <DialogTitle className="mt-6 font-display text-3xl font-normal">Reservation successful</DialogTitle>
              <DialogDescription className="mx-auto mt-2 max-w-sm">We'll hold <em>{book.titleEn}</em> for {user.name.split(" ")[0]}. You'll get an SMS when it's ready — collect within 3 days.</DialogDescription>
              <div className="mt-8 flex justify-center gap-2"><Button variant="outline" onClick={() => setStep(0)}>Keep browsing</Button><Button asChild><Link to="/account/reservations">View reservations</Link></Button></div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
