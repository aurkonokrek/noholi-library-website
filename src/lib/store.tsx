import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { audiobooks, initialBorrowRequests, initialContributions, initialRecommendations, type Audio, type BorrowRequest, type Contribution, type Recommendation } from "./data";
import { dict, type Lang } from "./i18n";
import memberPhoto from "@/assets/member-aurko.jpg";


type Ctx = {
  theme: "light" | "dark"; toggleTheme: () => void; setTheme: (t: "light" | "dark") => void;
  lang: Lang; setLang: (l: Lang) => void; t: (k: keyof typeof dict.en) => string;
  loggedIn: boolean; login: () => void; logout: () => void;
  avatar: string | null; setAvatar: (url: string | null) => void;
  memberPrompt: string | null; askMember: (reason: string) => void; closeMemberPrompt: () => void;
  /** Runs fn for members; otherwise opens the Member Access prompt with the given reason. */
  requireMember: (reason: string, fn: () => void) => void;
  removeContribution: (id: string) => void;
  wishlist: string[]; toggleWish: (id: string) => void; inWish: (id: string) => boolean;
  borrowRequests: BorrowRequest[]; addBorrowRequest: (r: Omit<BorrowRequest, "id" | "submitted" | "status">) => string;
  contributions: Contribution[]; addContribution: (c: Omit<Contribution, "id" | "updated">) => string;
  recommendations: Recommendation[]; addRecommendation: (r: Omit<Recommendation, "id" | "date" | "status">) => string;
  player: { track: Audio | null; playing: boolean; pos: number; speed: number; volume: number; expanded: boolean };
  play: (id: string) => void; togglePlay: () => void; seek: (s: number) => void; skip: (d: number) => void;
  setSpeed: (n: number) => void; setVolume: (n: number) => void; setExpanded: (b: boolean) => void;
  next: () => void; prev: () => void; closePlayer: () => void;
};

const today = () => new Date().toISOString().slice(0, 10);

// Keep one context instance across hot reloads; otherwise an edit to this file creates a new
// context while the mounted provider still uses the old one ("useApp outside provider").
const g = globalThis as unknown as { __noholiCtx?: React.Context<Ctx | null> };
const AppCtx = g.__noholiCtx ?? (g.__noholiCtx = createContext<Ctx | null>(null));

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeS] = useState<"light" | "dark">("light");
  const [lang, setLangS] = useState<Lang>("en");
  const [loggedIn, setLoggedIn] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(memberPhoto);
  const [memberPrompt, setMemberPrompt] = useState<string | null>(null);
  const [wishlist, setWishlist] = useState<string[]>(["khoabnama", "a-gitanjali", "nodir-naam", "sapiens", "pather-panchali"]);
  const [borrowRequests, setBorrowRequests] = useState<BorrowRequest[]>(initialBorrowRequests);
  const [contributions, setContributions] = useState<Contribution[]>(initialContributions);
  const [recommendations, setRecommendations] = useState<Recommendation[]>(initialRecommendations);
  const [player, setPlayer] = useState<Ctx["player"]>({ track: null, playing: false, pos: 0, speed: 1, volume: 0.8, expanded: false });
  const hydrated = useRef(false);

  useEffect(() => {
    const s = sessionStorage;
    const th = s.getItem("noholi-theme") as "light" | "dark" | null;
    if (th) setThemeS(th);
    const l = s.getItem("noholi-lang") as Lang | null;
    if (l) setLangS(l);
    if (s.getItem("noholi-auth") === "1") setLoggedIn(true);
    hydrated.current = true;
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    if (hydrated.current) sessionStorage.setItem("noholi-theme", theme);
  }, [theme]);
  useEffect(() => {
    document.documentElement.lang = lang === "bn" ? "bn" : "en";
    if (hydrated.current) sessionStorage.setItem("noholi-lang", lang);
  }, [lang]);

  useEffect(() => {
    if (!player.playing || !player.track) return;
    const iv = setInterval(() => {
      setPlayer((p) => p.track ? { ...p, pos: Math.min(p.track.duration, p.pos + p.speed) } : p);
    }, 1000);
    return () => clearInterval(iv);
  }, [player.playing, player.track]);

  const t = useCallback((k: keyof typeof dict.en) => dict[lang][k] ?? dict.en[k], [lang]);

  const value = useMemo<Ctx>(() => ({
    theme, toggleTheme: () => setThemeS((x) => (x === "dark" ? "light" : "dark")), setTheme: setThemeS,
    lang, setLang: setLangS, t,
    loggedIn,
    login: () => { setLoggedIn(true); sessionStorage.setItem("noholi-auth", "1"); },
    logout: () => { setLoggedIn(false); sessionStorage.removeItem("noholi-auth"); toast("You have been logged out."); },
    avatar, setAvatar,
    memberPrompt, askMember: setMemberPrompt, closeMemberPrompt: () => setMemberPrompt(null),
    requireMember: (reason, fn) => { if (loggedIn) fn(); else setMemberPrompt(reason); },
    removeContribution: (id) => setContributions((x) => x.filter((c) => c.id !== id)),
    wishlist,
    inWish: (id) => loggedIn && wishlist.includes(id),
    toggleWish: (id) => {
      if (!loggedIn) { setMemberPrompt("Log in or become a free member to save books to your wishlist."); return; }
      setWishlist((w) => {
        const has = w.includes(id);
        toast(has ? "Removed from wishlist" : "Saved to wishlist");
        return has ? w.filter((x) => x !== id) : [id, ...w];
      });
    },
    borrowRequests,
    addBorrowRequest: (r) => { const id = `BR-26-0${420 + borrowRequests.length}`; setBorrowRequests((x) => [{ ...r, id, submitted: today(), status: "Pending Review" }, ...x]); return id; },
    contributions,
    addContribution: (c) => { const id = `C-${1183 + contributions.length}`; setContributions((x) => [{ ...c, id, updated: today() }, ...x]); return id; },
    recommendations,
    addRecommendation: (r) => { const id = `RQ-00${94 + recommendations.length}`; setRecommendations((x) => [{ ...r, id, date: today(), status: "Submitted" }, ...x]); return id; },
    player,
    play: (id) => {
      const tr = audiobooks.find((a) => a.id === id) ?? null;
      setPlayer((p) => p.track?.id === id ? { ...p, playing: !p.playing } : { ...p, track: tr, playing: true, pos: 0 });
    },
    togglePlay: () => setPlayer((p) => ({ ...p, playing: !p.playing })),
    seek: (s) => setPlayer((p) => ({ ...p, pos: s })),
    skip: (d) => setPlayer((p) => p.track ? { ...p, pos: Math.max(0, Math.min(p.track.duration, p.pos + d)) } : p),
    setSpeed: (n) => setPlayer((p) => ({ ...p, speed: n })),
    setVolume: (n) => setPlayer((p) => ({ ...p, volume: n })),
    setExpanded: (b) => setPlayer((p) => ({ ...p, expanded: b })),
    next: () => setPlayer((p) => { const i = audiobooks.findIndex((a) => a.id === p.track?.id); return { ...p, track: audiobooks[(i + 1) % audiobooks.length] ?? null, pos: 0 }; }),
    prev: () => setPlayer((p) => { if (p.pos > 5) return { ...p, pos: 0 }; const i = audiobooks.findIndex((a) => a.id === p.track?.id); return { ...p, track: audiobooks[(i - 1 + audiobooks.length) % audiobooks.length] ?? null, pos: 0 }; }),
    closePlayer: () => setPlayer((p) => ({ ...p, track: null, playing: false, expanded: false })),
  }), [theme, lang, t, loggedIn, avatar, memberPrompt, wishlist, borrowRequests, contributions, recommendations, player]);

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export const useApp = () => {
  const c = useContext(AppCtx);
  if (!c) throw new Error("useApp outside provider");
  return c;
};
