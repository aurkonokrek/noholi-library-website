import { createFileRoute, useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { user } from "@/lib/data";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/account/settings")({ component: Settings });

function Row({ title, desc, children }: { title: string; desc?: string; children: ReactNode }) {
  return <div className="grid gap-4 border-b border-border py-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]"><div><div className="font-medium">{title}</div>{desc && <div className="mt-1 text-sm text-muted-foreground">{desc}</div>}</div><div>{children}</div></div>;
}

function Seg<T extends string>({ value, options, onChange }: { value: T; options: [T, string][]; onChange: (v: T) => void }) {
  return <div className="inline-flex border border-border p-0.5">{options.map(([v, l]) => <button key={v} onClick={() => onChange(v)} className={cn("h-9 px-4 text-sm", value === v ? "bg-foreground text-background" : "text-muted-foreground")}>{l}</button>)}</div>;
}

function Settings() {
  const { theme, setTheme, lang, setLang, logout } = useApp();
  const nav = useNavigate();
  return (
    <div className="max-w-3xl">
      <h1 className="mb-6 text-4xl">Account settings</h1>
      <h2 className="eyebrow mt-10">Profile & account</h2>
      <Row title="Email address" desc="Used for receipts and due-date reminders."><Input defaultValue={user.email} className="h-11" /></Row>
      <Row title="Phone" desc="We send pickup alerts by SMS."><Input defaultValue={user.phone} className="h-11" /></Row>
      <h2 className="eyebrow mt-12">Password & security</h2>
      <Row title="Change password"><div className="grid gap-3"><Label className="sr-only" htmlFor="cp">Current</Label><Input id="cp" type="password" placeholder="Current password" className="h-11" /><Input type="password" placeholder="New password" className="h-11" /><Button variant="outline" className="w-fit" onClick={() => toast("Password updated")}>Update password</Button></div></Row>
      <h2 className="eyebrow mt-12">Notifications</h2>
      {[["Due-date reminders", "Two days before a loan is due", true], ["Reservation ready", "When a held book arrives", true], ["New Noholi publications", "A short note when we publish", false], ["Write Ups digest", "Monthly roundup of new writing", false]].map(([t, d, on]) => (
        <Row key={t as string} title={t as string} desc={d as string}><Switch defaultChecked={on as boolean} aria-label={t as string} /></Row>
      ))}
      <h2 className="eyebrow mt-12">Preferences</h2>
      <Row title="Language"><Seg value={lang} options={[["en", "English"], ["bn", "বাংলা"]]} onChange={setLang} /></Row>
      <Row title="Theme"><Seg value={theme} options={[["light", "Light"], ["dark", "Dark"]]} onChange={setTheme} /></Row>
      <h2 className="eyebrow mt-12">Privacy</h2>
      <Row title="Show my reviews publicly" desc="Your name appears on reviews you write."><Switch defaultChecked aria-label="Public reviews" /></Row>
      <Row title="Keep reading history" desc="Used for Continue Reading and recommendations."><Switch defaultChecked aria-label="Reading history" /></Row>
      <div className="mt-10 flex flex-wrap gap-3"><Button onClick={() => toast("Settings saved")}>Save settings</Button><Button variant="outline" onClick={() => { logout(); nav({ to: "/" }); }}>Log out</Button></div>
    </div>
  );
}
