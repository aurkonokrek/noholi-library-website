import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Headphones, Library, Play, Tablet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BookCard, BookCover, Cover, fmtDate, SectionHead } from "@/components/noholi";
import { articles, audiobooks, books, fmtDuration, images } from "@/lib/data";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Noholi Library — Stories live here" },
      { name: "description", content: "Borrow books, read e-books, listen to audio books and discover writing at Noholi, a library and literary home in Dhaka." },
      { property: "og:title", content: "Noholi Library — Stories live here" },
      { property: "og:description", content: "A library and literary home in Dhaka for readers, listeners and writers." },
    ],
  }),
  component: Home,
});

function Home() {
  const { t, lang, play } = useApp();
  const featured = books.filter((b) => !b.noholi).filter((_, i) => [0, 2, 4, 8, 16, 21].includes(i));
  const noholi = books.filter((b) => b.noholi);
  const blog = articles.filter((a) => a.kind === "blog");
  const creative = articles.find((a) => a.kind === "creative")!;
  const review = articles.find((a) => a.kind === "review")!;

  return (
    <>
      {/* Hero */}
      <section className="container-page pt-10 md:pt-16">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="flex flex-col justify-between lg:col-span-5">
            <div>
              <div className="eyebrow mb-8">Est. Dhanmondi, Dhaka · নহলি পাঠাগার</div>
              <h1 className={lang === "bn" ? "font-bangla text-6xl leading-[1.15] md:text-7xl" : "text-[4.2rem] leading-[0.92] md:text-[6.5rem]"}>
                {t("heroTitle")}
              </h1>
              <p className="mt-8 max-w-md text-lg leading-relaxed text-muted-foreground">{t("heroBody")}</p>
              <div className="mt-10 flex flex-wrap gap-3">
                <Button size="lg" asChild><Link to="/library/books">{t("explore")} <ArrowRight /></Link></Button>
                <Button size="lg" variant="outline" asChild><Link to="/join">{t("become")}</Link></Button>
              </div>
            </div>
            <dl className="mt-14 grid grid-cols-3 gap-6 border-t border-border pt-6">
              {[["12,400+", "Books on the shelf"], ["860", "E-books"], ["140", "Audio books"]].map(([n, l]) => (
                <div key={l}><dt className="font-display text-3xl">{n}</dt><dd className="mt-1 text-xs text-muted-foreground">{l}</dd></div>
              ))}
            </dl>
          </div>
          <div className="relative lg:col-span-7">
            <img src={images.hero} alt="A reader at the long table in Noholi's reading room" width={1600} height={1104} className="photo aspect-[4/3] w-full object-cover lg:aspect-auto lg:h-full" />
            <Link to="/book/$id" params={{ id: "pather-panchali" }} className="absolute -bottom-8 left-6 hidden w-64 items-center gap-4 border border-border bg-background p-4 shadow-book transition-transform hover:-translate-y-0.5 md:flex">
              <BookCover book={books[0]} size="sm" className="w-14 shrink-0" />
              <div className="min-w-0"><div className="eyebrow mb-1 !text-[0.6rem]">Book of the month</div><div className="font-bangla text-lg leading-tight">পথের পাঁচালী</div><div className="text-xs text-muted-foreground">Bibhutibhushan</div></div>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="container-page mt-28">
        <SectionHead eyebrow="Library" title={t("featured")} link={<Link to="/library/books" className="inline-flex items-center gap-2 text-sm hover:text-accent">{t("viewAll")} <ArrowRight className="h-4 w-4" /></Link>} />
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 lg:grid-cols-6">
          {featured.map((b) => <BookCard key={b.id} book={b} />)}
        </div>
      </section>

      {/* Explore */}
      <section className="mt-28 bg-secondary py-20">
        <div className="container-page">
          <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] md:items-end">
            <h2 className="text-4xl md:text-6xl">Four ways into<br /><em className="text-accent">Noholi.</em></h2>
            <p className="max-w-lg text-muted-foreground md:justify-self-end">Borrow a printed book, discover what we publish, read on any screen, or listen on the way home. One membership opens all four.</p>
          </div>
          <div className="mt-14 grid border-t border-foreground sm:grid-cols-2 lg:grid-cols-4">
            {[
              { to: "/library/books", icon: Library, n: "01", title: t("books"), body: "Twelve thousand volumes in Bangla and English, from Tagore to Tahmima Anam.", tone: 0 },
              { to: "/library/noholi", icon: BookOpen, n: "02", title: t("noholiBooks"), body: "New writing published by Noholi Prokash — debuts, poetry and anthologies.", tone: 2 },
              { to: "/library/ebooks", icon: Tablet, n: "03", title: t("ebooks"), body: "Read in the browser with sepia mode, bookmarks and adjustable type.", tone: 3 },
              { to: "/library/audio", icon: Headphones, n: "04", title: t("audiobooks"), body: "Studio recordings of classics and Noholi originals, many read by the authors.", tone: 6 },
            ].map((c) => (
              <Link key={c.to} to={c.to} className="group border-b border-border py-8 sm:pr-8 lg:border-b-0 lg:border-r lg:px-6 lg:first:pl-0 lg:last:border-r-0">
                <div className="flex items-center justify-between">
                  <span className="grid h-11 w-11 place-items-center rounded-full" style={{ background: `var(--cover-${c.tone})`, color: `var(--cover-${c.tone}-fg)` }}><c.icon className="h-5 w-5" /></span>
                  <span className="font-display text-sm text-muted-foreground">{c.n}</span>
                </div>
                <h3 className="mt-10 text-3xl group-hover:text-accent">{c.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{c.body}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm">Browse <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Noholi books */}
      <section className="container-page mt-28">
        <SectionHead eyebrow="Noholi Prokash" title="Published by Noholi" link={<Link to="/library/noholi" className="inline-flex items-center gap-2 text-sm hover:text-accent">{t("viewAll")} <ArrowRight className="h-4 w-4" /></Link>} />
        <div className="grid gap-12 lg:grid-cols-12">
          <Link to="/book/$id" params={{ id: noholi[0].id }} className="group grid gap-8 sm:grid-cols-[220px_minmax(0,1fr)] lg:col-span-7">
            <BookCover book={noholi[0]} size="lg" className="w-full max-w-[220px]" />
            <div>
              <div className="eyebrow mb-3">New novel · 2024</div>
              <h3 className="font-bangla text-4xl leading-tight group-hover:text-accent">{noholi[0].titleBn}</h3>
              <div className="mt-1 font-display text-xl italic text-muted-foreground">{noholi[0].titleEn}</div>
              <p className="mt-5 leading-relaxed text-muted-foreground">{noholi[0].description}</p>
              <div className="mt-6 text-sm">{noholi[0].authorEn} · {noholi[0].pages} pages</div>
            </div>
          </Link>
          <ul className="divide-y divide-border border-y border-border lg:col-span-5">
            {noholi.slice(1).map((b) => (
              <li key={b.id}>
                <Link to="/book/$id" params={{ id: b.id }} className="group grid grid-cols-[56px_minmax(0,1fr)] items-center gap-5 py-4">
                  <BookCover book={b} size="sm" />
                  <div className="min-w-0"><div className="truncate font-display text-xl group-hover:text-accent">{b.language === "Bangla" ? b.titleBn : b.titleEn}</div><div className="truncate text-sm text-muted-foreground">{b.authorEn} · {b.genre}</div></div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Digital */}
      <section className="container-page mt-28">
        <div className="grid overflow-hidden bg-foreground text-background lg:grid-cols-2">
          <div className="p-8 md:p-14">
            <div className="eyebrow mb-6 !text-background/60">Digital library</div>
            <h2 className="text-4xl md:text-6xl">Read on the bus.<br />Listen in the rain.</h2>
            <p className="mt-6 max-w-md text-background/70">Members get unlimited access to e-books in the browser and studio-recorded audio books — with your place saved across every device.</p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Button size="lg" variant="accent" asChild><Link to="/library/ebooks">{t("ebooks")}</Link></Button>
              <Button size="lg" variant="outline" className="border-background/30 hover:border-background hover:bg-background/10" asChild><Link to="/library/audio">{t("audiobooks")}</Link></Button>
            </div>
          </div>
          <div className="border-t border-background/15 p-8 md:p-14 lg:border-l lg:border-t-0">
            <div className="eyebrow mb-6 !text-background/60">Listening now</div>
            <ul className="space-y-5">
              {audiobooks.slice(0, 4).map((a) => (
                <li key={a.id} className="grid grid-cols-[48px_minmax(0,1fr)_auto] items-center gap-4">
                  <Cover title={a.titleBn} author="" tone={a.tone} size="sm" />
                  <div className="min-w-0"><div className="truncate font-display text-lg">{a.titleEn}</div><div className="truncate text-xs text-background/60">{a.authorEn} · {fmtDuration(a.duration)}</div></div>
                  <button onClick={() => play(a.id)} aria-label={`Play ${a.titleEn}`} className="grid h-10 w-10 place-items-center rounded-full border border-background/30 hover:bg-background hover:text-foreground"><Play className="h-4 w-4 translate-x-px" /></button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Write ups */}
      <section className="container-page mt-28">
        <SectionHead eyebrow={t("writeups")} title={t("latestWriteups")} link={<Link to="/writeups" className="inline-flex items-center gap-2 text-sm hover:text-accent">{t("viewAll")} <ArrowRight className="h-4 w-4" /></Link>} />
        <div className="grid gap-12 lg:grid-cols-12">
          <Link to="/article/$slug" params={{ slug: blog[0].slug }} className="group lg:col-span-7">
            <img src={blog[0].image} alt="" loading="lazy" className="photo aspect-[16/10] w-full object-cover" />
            <div className="eyebrow mt-6">{blog[0].sub} · {blog[0].minutes} min read</div>
            <h3 className="mt-3 text-4xl leading-tight group-hover:text-accent">{blog[0].title}</h3>
            <p className="mt-3 max-w-xl text-muted-foreground">{blog[0].excerpt}</p>
            <div className="mt-4 text-sm">{blog[0].author} · {fmtDate(blog[0].date)}</div>
          </Link>
          <div className="space-y-10 lg:col-span-5">
            <Link to="/article/$slug" params={{ slug: creative.slug }} className="group block border-l-2 border-accent pl-6">
              <div className="eyebrow">{t("creative")} · {creative.sub}</div>
              <h3 className="mt-3 font-bangla text-3xl group-hover:text-accent">{creative.title}</h3>
              <p className="mt-3 whitespace-pre-line font-bangla text-lg italic leading-relaxed text-muted-foreground">{creative.excerpt}</p>
              <div className="mt-3 text-sm">{creative.author}</div>
            </Link>
            <Link to="/article/$slug" params={{ slug: review.slug }} className="group grid grid-cols-[80px_minmax(0,1fr)] gap-5 border-t border-border pt-8">
              <BookCover book={books.find((b) => b.id === review.bookId)!} size="sm" />
              <div><div className="eyebrow">{t("reviews")}</div><h3 className="mt-2 text-2xl leading-tight group-hover:text-accent">{review.title}</h3><div className="mt-2 text-sm text-muted-foreground">{review.author}</div></div>
            </Link>
            {blog.slice(1, 3).map((a) => (
              <Link key={a.slug} to="/article/$slug" params={{ slug: a.slug }} className="group block border-t border-border pt-6">
                <div className="eyebrow">{a.sub}</div><h3 className="mt-2 text-xl group-hover:text-accent">{a.title}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section className="container-page mt-28 grid gap-12 lg:grid-cols-12 lg:items-center">
        <img src={images.gChildren} alt="Children reading on the rug at Noholi" loading="lazy" className="photo aspect-[4/3] w-full object-cover lg:col-span-6" />
        <div className="lg:col-span-5 lg:col-start-8">
          <div className="eyebrow mb-5">About Noholi</div>
          <p className="font-display text-3xl leading-snug md:text-4xl">A neighbourhood library that grew into a literary home — where children find their first book and writers find their first readers.</p>
          <Button variant="link" asChild className="mt-6 px-0"><Link to="/about">{t("learnMore")} <ArrowRight /></Link></Button>
        </div>
      </section>

      {/* Membership */}
      <section className="container-page mt-28">
        <div className="relative overflow-hidden border border-foreground px-8 py-16 text-center md:py-24">
          <div className="eyebrow mb-6">Membership</div>
          <h2 className={lang === "bn" ? "font-bangla text-5xl md:text-6xl" : "text-5xl md:text-7xl"}>{t("membershipTitle")}</h2>
          <p className="mx-auto mt-6 max-w-lg text-muted-foreground">{t("membershipBody")}</p>
          <Button size="lg" variant="accent" className="mt-10" asChild><Link to="/join">{t("become")}</Link></Button>
        </div>
      </section>
    </>
  );
}
