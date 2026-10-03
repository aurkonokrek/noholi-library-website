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
