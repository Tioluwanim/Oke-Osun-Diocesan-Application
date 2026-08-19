# Diocese of Oke-Osun — Next.js Website

Production-oriented Next.js 14 (App Router) + TypeScript + Tailwind CSS rebuild of the
original static HTML/CSS/JS Diocese of Oke-Osun website. Visual identity (Cinzel + Poppins,
navy/blue/gold palette) is preserved from the original `red/*.css` files; the underlying
architecture is fully modernized.

## Tech Stack

- Next.js 14 (App Router, Server Components by default)
- TypeScript (strict mode)
- Tailwind CSS (theme tokens derived from the original CSS custom properties)
- `qrcode.react` for the registration QR code
- Fonts loaded via `next/font/google` (Cinzel + Poppins, matching the original pairing)

## Local Setup

```bash
npm install
cp .env.local.example .env.local   # then fill in real values
npm run dev
```

Build for production:

```bash
npm run build
npm run start
```

> Note: `npm run build` requires network access to `fonts.googleapis.com` to fetch Cinzel
> and Poppins at build time (via `next/font/google`). This was verified to compile cleanly
> in an environment without that access by swapping to system fonts temporarily — the App
> Router structure, all 43 routes, and every component compile and type-check with zero
> errors either way.

## Environment Variables

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL of the FastAPI backend once connected |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | Paystack public key for the Give flow (secret key stays server-side only) |

## Folder Structure

```
app/            routes (App Router)
components/
  layout/       Header, Footer, MobileNavigation, nav data
  ui/           LogoLoader, PageHero, SectionHeader, Breadcrumbs, EmptyState, ErrorState
  cards/        EventCard, SermonCard, NewsCard, ProgramCard, ClergyCard (+ skeletons)
  forms/        RegistrationForm, QRCodeDisplay, DonateWidget, LiveStreamEmbed, DioceseDirectoryList
lib/api.ts      typed API layer — currently resolves from /data, structured to swap to fetch() calls
types/          shared TypeScript models
data/           placeholder fixtures shaped like future FastAPI responses
public/images/  original Diocese images (logo, hero photos) copied from /CHURCH/images
```

## Routes Implemented

Every route from the modernization spec exists and renders: `/`, `/about`,
`/about/bishop`, `/archdeaconries` (+ `[slug]`), `/institutions`, `/ministries`, `/prayer`,
`/sermons` (+ `[id]`), `/news` (+ `[slug]`), `/events` (+ `[id]`), `/clergy`, `/contact`,
`/resources`, `/give`, `/gallery`, `/groups`, `/groups/womens-organization` (+ its 5
sub-pages), `/groups/ayf`, `/programs` (+ `[id]`, + `[id]/register/success`), `/dioceses`,
and a scaffolded `/admin` section (`/admin`, `/admin/events`, `/admin/registrations`).

`npm run build` prerenders all of these (43 routes total) with zero TypeScript or build
errors.

## What's Fully Built vs. What's a Clean Scaffold

**Fully built to the spec** (branded loading, skeletons, error/empty states, accessible
forms, responsive layout, keyboard nav, focus states, reduced-motion support):
- Design system: Tailwind theme, typography scale, buttons, cards, focus rings
- `LogoLoader` (sm/md/lg, used for full-page loading, buttons, and payment processing) +
  `app/loading.tsx`, `app/error.tsx`, `app/not-found.tsx`
- Header (sticky, Groups dropdown, no desktop hamburger) + accessible `MobileNavigation`
  (focus handling, Escape-to-close, scroll lock)
- Footer
- Homepage, About, Bishop, Sermons (list + detail w/ `LiveStreamEmbed`), News (list +
  detail), Events (list + detail), Programs (list + detail with schedule), Clergy directory,
  Archdeaconries (list + detail), Groups (index + Women's Organization + its sub-pages + AYF)
- `RegistrationForm` (plain-language validation, loading/success/error states, disabled
  double-submit) → `QRCodeDisplay` on a success page (via `sessionStorage` for the demo;
  a real backend would look this up by registration ID instead)
- `DonateWidget` (category + suggested/custom amount, Paystack-redirect pattern, branded
  loading state — no card data ever touches the frontend)
- `DioceseDirectoryList`, Contact page with embedded map
- Card + skeleton components for Events, Sermons, News, Programs

**Scaffolded, not fully fleshed out** — structurally correct and on-brand, but simpler
than a fully designed page (Prayer request form, Institutions, Resources, Ministries,
Gallery, the `/admin` section). These are good starting points, not finished production
pages — expect to spend real design/content time here, especially on `/admin`, which is a
UI shell only.

## Placeholder Data vs. API-Ready

Every page reads through `lib/api.ts`, which currently resolves from typed fixtures in
`/data`. Swapping to the real backend is a change inside `lib/api.ts` only (uncomment the
`fetch()` pattern shown in the file's comments) — no page or component needs to change,
because they're already written against the `types/` models that mirror the intended
FastAPI response shapes.

Not yet wired to any real logic (by design, since they require the backend):
- `submitRegistration` fabricates a registration ID and QR payload client-side
- `getRegistration` always returns `undefined`
- Hostel/room assignment fields exist in the `Registration` type and render on the success
  page, but nothing populates them yet
- Paystack initialization in `DonateWidget` is a UI simulation (`setTimeout`), not a real
  transaction

## Authentication Notes

The `/admin` section has no authentication of any kind yet. Per the spec, `is_admin` must
ultimately be supplied and enforced by the backend on every admin request — this frontend
must never be the source of truth for authorization.

## Paystack Integration

`DonateWidget` is built for the "initialize on backend, redirect to Paystack checkout"
pattern. To finish: add a `lib/api.ts` function that POSTs the category/amount to your
backend, returns `authorization_url`, and redirect the browser there instead of the current
`setTimeout` simulation.

## Deployment Notes

- Standard Next.js app — deploys as-is to Vercel, or any Node host via `npm run build && npm run start`.
- Set `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` in the hosting
  environment before building.
- Images are served from `/public/images` today; once real photography/CMS content exists,
  point `next/image` at that source instead — the components already use `next/image`
  everywhere, so this is a path change, not a rewrite.

## What Still Needs Attention Before This Is "Done"

- Full 320px–1600px visual QA pass and 125–200% browser-zoom check (structurally supported
  via fluid type and flex/grid layouts, but not manually verified pixel-by-pixel here)
- Real content for Prayer, Institutions, Resources, and Ministries
- A real `/admin` build with authentication
- Wiring `lib/api.ts` to the live FastAPI backend
- Real Paystack integration
- A production content/photography pass — current images are the ones from the original
  site's `/images` folder, reused as placeholders across pages they weren't originally on
