# Family Health Planner (v0.6.0)

A single-page, rules-based tool: enter age, habits, your own conditions and what runs in the family, and it shows what to be aware of, which tests to ask about, what to take care of, and how to plan for health costs.

- **Awareness, not diagnosis.** Every rule is deterministic and tagged: Guideline, Scored tool, General advice or Prototype rule. Sources link to Indian guidelines first (MoHFW NP-NCD, ICMR, ICMR-NIN, CSI, IDRS), then international ones.
- **Private.** Nothing is sent anywhere. Profiles live in the browser's localStorage; there is a "delete everything" button.
- **Not reviewed by a doctor yet.** `review.html` lists all rules and 30 worked scenarios so a doctor can mark Agree / Disagree / Unsure.

## Files
- `index.html` – the whole app (no build step, no dependencies)
- `review.html` – clinician review sheet
- `test.js` – engine tests (`npm install && npm test`)
- `vercel.json` – clean URLs (`/review`)

## Deploy
Static hosting. Push to `main`; Vercel serves it as is.

## Changing a rule
Edit the rule in `index.html`, add or update a test in `test.js`, bump `APP_VERSION` and `RULES_DATE`, and add a line to `CHANGELOG.md`.
