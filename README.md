# Get Baited La

A minimal React home page for learning to recognise phishing emails. Built with React and Vite.

## Run locally

Requires Node.js 20.19+ or 22.12+ and pnpm.

```sh
pnpm install
pnpm dev
```

Open the local address printed by Vite. Use `pnpm build` to create a production build and `pnpm preview` to preview it.

If dependencies are already installed and `pnpm` is unavailable in your terminal:

```sh
node node_modules/vite/bin/vite.js --configLoader runner --host 127.0.0.1
```

Run the session data, summary and persistence checks with `node --test src/sessionUtils.test.js src/sessionHistory.test.js`.

## This iteration

- Responsive home page with a start-session action and selectable phishing tips that fade within a stable reading area.
- One “Start a session” action goes straight to 10 mixed emails. The first six completed sessions use all 60 Singapore scenarios without repeats; there is no category chooser.
- Both phishing and safe examples, background context, and immediate explanations for correct and incorrect answers.
- Larger reading text, clear answer buttons, keyboard focus, reduced-motion support, progress, and a Next button.
- Short personalised summaries: what went well, what to watch for, and one practical tip. Full answer feedback is available in a collapsed review.
- Completed results, answer choices, email snapshots and feedback are saved in this browser on this device and survive refresh. Reopen them under Saved sessions, or start another session directly from a summary.
- An accessible “How it works” dialog.

This is a frontend prototype without login, cloud storage or cross-device sync. Only completed sessions are saved; unfinished answers reset when leaving or refreshing. Completed results use localStorage, with read/write failures shown to the user. Each saved record includes its original emails and explanations so later content changes do not alter past reviews. Once all six sets are completed, the UI explicitly explains that a new session will repeat earlier emails. Clearing browser site data removes the history.

The examples include Singapore locations, S$ amounts, PayNow, GIRO, community activities, clinics, parcels, and impersonation of Singpass, CPF, IRAS, CDC vouchers and HDB. All messages and events are fictional; sample providers and `.example` addresses are for training. Email links and attachments are inactive. Classifications refer to the background supplied with each email. Guidance was checked against official [CPF scam safeguards](https://www.cpf.gov.sg/member/account-services/fighting-scams/cpf-account-safeguards), [IRAS refund-scam guidance](https://www.iras.gov.sg/news-events/announcements/scam-advisory/tax-refund-scam), [CDC voucher FAQs](https://vouchers.cdc.gov.sg/residents/faq/), and [Singpass security tips](https://portal.singpass.gov.sg/home/ui/assets/pdf/Singpass_Registration_Guide.pdf). Google Fonts provides DM Sans and Manrope, with local sans-serif fallbacks.

## Future session generation

`src/emailBank.js` contains 60 local scenarios; `src/sessions.js` distributes them into six mixed, serialisable sets. `PracticeSession` receives a run containing a session definition; it does not generate emails or depend on an AI provider. `validateSessions` checks 10 messages per set, both classifications, uniqueness, fictional addresses and destinations, and explanation fields. `summariseSession` derives feedback from actual answers. `sessionHistory.js` handles progression, immutable completion snapshots and persistence. A future server-side generator can return the same shape and pass validation before rendering, using history to avoid repeats. No AI API or secret-key handling is wired up.
