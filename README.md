# telepath-tee

A small, local web app for finding out how your friends think. Each person answers 56 quick statements and immediately gets a visual profile of their **thinking preferences** and **behavioral style**, plus a shareable "How to work with me" card. A group view compares profiles side by side to show team balance and likely communication clashes.

It is inspired by the Emergenetics® model of four thinking attributes and three behavioral attributes.

> **Unofficial.** This is not the Emergenetics Profile. The questionnaire items are original, and the scoring norms are provisional (see [Scoring](#scoring)). Use it as a conversation starter, not an assessment.

![There's a committee in your head](docs/images/01-committee.png)

## Learn the model in five minutes

These graphics summarize the "Teaming Up! With Emergenetics" workshop. They are also available as one scrollable page: [docs/field-guide.html](docs/field-guide.html).

### Four ways of thinking

Everyone uses all four. Your profile shows how much energy you give each one, as a percentage that adds up to 100%. 23% or more counts as a preference.

![The four thinking attributes](docs/images/02-thinking-colors.png)

![Same news, four brains](docs/images/03-comic-plan-change.png)

### Three behaviors

Measured separately from thinking, each as a 0–100 percentile split into thirds. The middle third is the "It Depends" group, who flex with the situation.

![Expressiveness, Assertiveness and Flexibility](docs/images/04-behaviors.png)

### Reading a profile

![Percentage vs percentile](docs/images/05-reading-your-profile.png)

![Profile gallery](docs/images/06-profile-gallery.png)

![Relationship profiles](docs/images/07-comic-relationships.png)

![Can a profile change?](docs/images/08-can-profiles-change.png)

## Features

- **Questionnaire.** 56 statements on a 1–7 agree scale, in 8 short steps. It shows progress, checks each step before moving on, and saves drafts in the browser.
- **Personal report.** Shows the thinking-mix donut, percentile bars and behavior spectrums, plus a written summary, communication tips, ideal environment, interaction strategies and how others can flex toward you. **Print / Save PDF** uses print-specific styles.
- **"How to work with me" card.** Downloadable as a PNG.
- **Group comparison.** Shows each person's thinking mix side by side, a combined-scores dot chart with the group average, and which thinking attributes the group is missing (WE-Team coverage). It also flags pairs likely to clash, with tips, and pairs who think alike.
- **Admin panel.** Passcode-protected table of every submission, with search, group filter, compare-selected and delete. It also shows a survey link for friends on the same Wi-Fi.
- **Runs locally or online.** On your computer, everything stays in `data/db.json`. Online, it uses a free Upstash Redis database (see [Deploy for free](#deploy-for-free)).

## Quick start

Requires Node 20+.

```bash
npm install
cp .env.local.example .env.local   # then set ADMIN_KEY
npm run dev                        # http://localhost:3000
```

For a production server: `npm run build && npm start`. Both listen on `0.0.0.0:3000`, so friends on your network can open the survey. The admin page shows the exact link.

> **On exFAT or other drives without symlinks**, install with `npm install --no-bin-links`. The npm scripts call `node node_modules/...` directly, so they work either way.

## Deploy for free

The app runs on [Vercel](https://vercel.com)'s free Hobby plan. Vercel has no writable disk, so online submissions go to a free [Upstash](https://upstash.com) Redis database instead of `data/db.json`. The app switches automatically when the Redis settings are present. No code changes are needed.

1. **Import the repo.** On Vercel, choose *Add New → Project* and import this GitHub repository. Keep the detected Next.js defaults.
2. **Add a database.** In the project, open *Storage → Create Database → Upstash (Redis)*, choose the free plan and connect it to the project. This adds `KV_REST_API_URL` and `KV_REST_API_TOKEN` for you. (Creating a database directly on upstash.com and setting `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` works too.)
3. **Set the admin passcode.** Under *Settings → Environment Variables*, add `ADMIN_KEY` with a long random value. Without it the admin page stays locked.
4. **Redeploy** so the new settings take effect, then open `https://<your-project>.vercel.app/admin`. The survey link to share is at the top.

| Setting | Required online | Purpose |
|---|---|---|
| `ADMIN_KEY` | Yes | Passcode for `/admin` |
| `KV_REST_API_URL` + `KV_REST_API_TOKEN`, or `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` | Yes | Where submissions are stored |
| `REDIS_KEY_PREFIX` | No | Key prefix, default `tt:`. Lets several deployments share one database |

**Before going public:**
- Anyone with the survey link can submit, and there is no spam protection. Share the link with people you know.
- Each report is readable by anyone who has its link (the IDs are random and unguessable). People's answers are never shown publicly. Only the admin sees emails.
- Vercel's Hobby plan is for personal, non-commercial projects.

Other hosts work if they run Node 20 and either keep a persistent disk (set `DATA_DIR`) or use the Redis settings above. Free tiers without a persistent disk, such as Render's, lose `data/db.json` on every restart, so use Redis there too.

| Command | What it does |
|---|---|
| `npm test` | Unit tests for the scoring engine, group analysis and storage |
| `npm run typecheck` | TypeScript check |
| `npm run seed` | Adds 5 demo profiles (group "Demo") so the compare view has data |
| `npm run reconstruct -- <id> <old-profile.json> <out-dir> [--save]` | Estimates answers that would reproduce an older profile, starting from a current submission (see below) |

## Pages

| Route | Purpose |
|---|---|
| `/` | Introduction to the seven attributes |
| `/assessment` | The questionnaire |
| `/report/:id` | Personal report |
| `/card/:id` | "How to work with me" card |
| `/compare?ids=a,b,c` | Group comparison |
| `/admin` | All submissions (needs `ADMIN_KEY`) |

Report links use unguessable IDs and work as private share links. Only the admin can list everyone.

## Scoring

1. **Raw score.** The mean of the 8 answers for each attribute, on the 1–7 scale. Two of the eight items are reverse-worded (`8 − answer`).
2. **Percentile.** `z = (raw − mean) / sd`, then the normal CDF, clamped to 1–99. This compares you with other people.
3. **Thinking percentage.** Each thinking percentile ÷ the sum of all four, rounded to total 100. This is your own mix. It reproduces the published sample profile exactly: percentiles 95/90/48/5 give 40/38/20/2%. That case is a unit test.
4. **Preference.** A thinking attribute at **≥ 23%**. The number of preferences gives uni-, bi-, tri- or quadra-modal.
5. **Behavior thirds.** 0–33, 34–66 ("It Depends") and 67–100, each with a five-step label such as Quiet → Gregarious.

**Norms are provisional.** The official instrument is normed against a large global population. The means and standard deviations in `src/lib/scoring.ts` (`NORMS`) are reasonable defaults for this item bank. Once you have a few dozen responses, consider replacing them with your group's own values.

### Comparing with an older profile

If someone has an older profile that exists only as published percentiles, `npm run reconstruct` estimates how they would have answered *these* 56 statements. It reverses the scoring, then moves their current answers by the fewest one-point steps needed to reproduce the old percentiles. The output files are a JSON file and a CSV of then-vs-now answers. The estimate is the closest set of answers to today's that fits the old profile, not a record of real answers. See `scripts/old-profile.example.json` for the input format.

## Project layout

```
src/
  lib/
    attributes.ts   # the 7 attributes: definitions, colors, traits, tips
    questions.ts    # 56-item bank and step layout
    scoring.ts      # scoring engine (+ scoring.test.ts)
    insights.ts     # report narrative, interaction strategies, cheat sheet
    team.ts         # group averages, coverage, clashes, allies (+ team.test.ts)
    db.ts           # storage: JSON file locally, Upstash Redis when hosted (+ db.test.ts)
  app/              # Next.js App Router pages and API routes
  components/       # charts, form, admin panel
scripts/            # seed and reconstruct
docs/               # field guide and training graphics
```

**Stack.** Next.js 14 (App Router) with TypeScript, Tailwind CSS, Recharts and lucide-react. Locally, storage is a JSON file that is written to a temp file and then renamed into place, so a crash can't corrupt it. Hosted, it talks to Upstash Redis over its REST API, with no extra dependency. CI (GitHub Actions) runs the tests, a production build and a type check on every push.

**Colors.** The thinking colors follow the Emergenetics convention (Analytical blue, Structural green, Social red, Conceptual yellow), with shades checked for color-vision deficiency. Every chart labels the attributes by name too, because red and green stay close for some readers.

## Credits

The model and terminology come from Emergenetics® (Browning & Williams). Emergenetics® is a registered trademark of Emergenetics International, which has no affiliation with this project. The graphics are original illustrations. Profile mottos and population shares are as presented in the "Teaming Up! With Emergenetics" workshop.
