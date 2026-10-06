import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fmtDate, Logo } from "@/components/noholi";
import { user } from "@/lib/data";

export const Route = createFileRoute("/account/profile")({ component: Profile });

function Profile() {
  const [edit, setEdit] = useState(false);
  const [u, setU] = useState(user);
  const fields: [keyof typeof user, string][] = [["name", "Full name"], ["email", "Email"], ["phone", "Phone"], ["address", "Address"]];
  return (
    <div className="grid gap-14 lg:grid-cols-12">
      <div className="lg:col-span-7">
        <div className="mb-8 flex items-end justify-between"><h1 className="text-4xl">Member profile</h1>{!edit && <Button variant="outline" onClick={() => setEdit(true)}>Edit profile</Button>}</div>
        {edit ? (
          <form className="grid gap-5" onSubmit={(e) => { e.preventDefault(); setEdit(false); toast("Profile updated"); }}>
            {fields.map(([k, l]) => <div key={k} className="space-y-2"><Label htmlFor={k}>{l}</Label><Input id={k} value={u[k]} onChange={(e) => setU({ ...u, [k]: e.target.value })} className="h-11" /></div>)}
            <div className="flex gap-2"><Button type="submit">Save changes</Button><Button type="button" variant="ghost" onClick={() => { setU(user); setEdit(false); }}>Cancel</Button></div>
          </form>
        ) : (
          <dl className="divide-y divide-border border-y border-border">
            {[...fields, ["memberId", "Member ID"] as [keyof typeof user, string]].map(([k, l]) => <div key={k} className="grid grid-cols-[140px_minmax(0,1fr)] py-4"><dt className="text-sm text-muted-foreground">{l}</dt><dd>{u[k]}</dd></div>)}
          </dl>
        )}
      </div>
      <aside className="lg:col-span-4 lg:col-start-9">
        <div className="border border-foreground p-6">
          <div className="flex items-start justify-between"><Logo className="h-8" /><span className="eyebrow">Patron card</span></div>
          <div className="mt-10 grid h-16 w-16 place-items-center rounded-full bg-foreground font-display text-3xl text-background">A</div>
          <div className="mt-4 font-display text-2xl">{u.name}</div>
          <div className="text-sm text-muted-foreground">{user.memberId}</div>
          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-border pt-4 text-sm">
            <div><div className="text-xs text-muted-foreground">Membership</div>{user.plan}</div>
            <div><div className="text-xs text-muted-foreground">Status</div><span className="text-success">● Active</span></div>
            <div><div className="text-xs text-muted-foreground">Member since</div>{fmtDate(user.since)}</div>
            <div><div className="text-xs text-muted-foreground">Valid until</div>{fmtDate(user.expires)}</div>
          </div>
        </div>
      </aside>
    </div>
  );
}
