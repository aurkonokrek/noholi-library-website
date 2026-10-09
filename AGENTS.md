<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# Project rules

- Frontend-only prototype: all data is mock data in `src/lib/data.ts`; app state (auth, wishlist, theme, language, audio player) lives in the `AppProvider` context in `src/lib/store.tsx`. Why: the brief asks for a UI demo with no backend.
- Book covers are drawn in code (`Cover` in `src/components/noholi.tsx`) from `--cover-N` tokens rather than images. Why: consistent, lightweight covers for dozens of titles.
- Member pages are nested under the `/account` layout, which gates on the demo login. Why: one place for the patron shell and access check.
- Search uses one index/ranker (`src/lib/search.ts`) and one autocomplete component (`SearchBox`), including picker mode via `onPick`. Why: the brief requires a single consistent search pattern everywhere.
- Borrowing is a multi-step Borrow Request (`/account/borrow/$id`), never a checkout; member submissions and book recommendations always start in a review status. Why: library-first product rules — no payments, nothing auto-published.
- Member-only actions call `requireMember` / `MemberButton`, which open the single `MemberPromptHost` dialog mounted in the root. Why: one consistent "Member Access Required" prompt instead of disabled buttons.
- Initial loading belongs in the document shell, with inline critical styles and a bundle-independent failure watchdog; only the first mounted, idle route signals readiness. Why: prevent partial-content flashes and recover from failed downloads without replaying the screen on navigation.
