# Get Baited La

A minimal React home page for learning to recognise phishing emails. Built with React and Vite.

## Run locally

Requires Node.js 20.19+ or 22.12+ and pnpm.

```sh
pnpm install
pnpm dev
```

Open the local address printed by Vite. Use `pnpm build` to create a production build and `pnpm preview` to preview it.

## This iteration

- Responsive home page with a start-session action and selectable phishing tips that fade within a stable reading area.
- A short practice session with one fictional email and immediate answer feedback.
- An accessible “How it works” dialog.

This is a frontend prototype. Login, accounts, saved progress, and a full email question bank are not implemented. The home page is the intended post-login landing page. Session state stays in memory and resets on refresh. All practice domains use `.example`; email links are inactive. Google Fonts provides DM Sans and Manrope, with local sans-serif fallbacks.
