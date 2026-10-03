import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { user } from "@/lib/data";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "My Noholi — Patron account" },
      { name: "description", content: "Your Noholi dashboard, loans, reservations, wishlist and settings." },
      { property: "og:title", content: "My Noholi" },
      { property: "og:description", content: "Patron account at Noholi Library." },
    ],
  }),
  component: AccountLayout,
});

const tabs = [
  ["/account", "Dashboard"], ["/account/borrowed", "Borrowed"], ["/account/reservations", "Reservations"],
  ["/account/wishlist", "Wishlist"], ["/account/fines", "Fines"], ["/account/profile", "Profile"], ["/account/settings", "Settings"],
] as const;

function AccountLayout() {
  const { loggedIn, login, lang } = useApp();
  if (!loggedIn) {
    return (
      <div className="container-page max-w-lg py-32 text-center">
        <div className="eyebrow mb-4">Members only</div>
        <h1 className="text-5xl">Please log in.</h1>
        <p className="mt-3 text-muted-foreground">Your dashboard, loans and wishlist live here once you're signed in.</p>
        <div className="mt-8 flex justify-center gap-3"><Button onClick={login}>Use demo patron</Button><Button variant="outline" asChild><Link to="/join">Become a member</Link></Button></div>
      </div>
    );
  }
  return (
    <>
      <div className="border-b border-border">
        <div className="container-page grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 pt-10">
          <div className="flex min-w-0 items-center gap-4 pb-6">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-foreground font-display text-2xl text-background">A</span>
            <div className="min-w-0"><div className="truncate font-display text-2xl">{lang === "bn" ? user.nameBn : user.name}</div><div className="text-sm text-muted-foreground">{user.memberId} · <span className="text-success">● Active Patron</span></div></div>
          </div>
        </div>
        <nav className="container-page flex gap-6 overflow-x-auto" aria-label="Account">
          {tabs.map(([to, l]) => <Link key={to} to={to} activeOptions={{ exact: true }} className="-mb-px whitespace-nowrap border-b-2 border-transparent pb-3 text-sm text-muted-foreground hover:text-foreground data-[status=active]:border-foreground data-[status=active]:text-foreground">{l}</Link>)}
        </nav>
      </div>
      <div className="container-page py-12"><Outlet /></div>
    </>
  );
}
