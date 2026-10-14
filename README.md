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
- A 12-email practice session with seven phishing attempts and five safe messages, context for each email, and immediate explanations for both correct and incorrect answers.
- Answer locking, session progress, a Next button, and a completion summary with takeaways for missed answers and a replay action.
- An accessible “How it works” dialog.

This is a frontend prototype. Login, accounts, and saved progress are not implemented. The home page is the intended post-login landing page. Session state stays in memory and resets on refresh or returning home. The 12 fictional scenarios live in `src/emails.js`; classifications refer to the background supplied with each email. All practice domains use `.example`; email links and attachments are inactive. Google Fonts provides DM Sans and Manrope, with local sans-serif fallbacks.
