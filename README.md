# Blackline Society: The motor cult.

A private underground motorcycle society for South India riders (Karnataka, Kerala, Tamil Nadu, Andhra Pradesh, Telangana and Puducherry).

## Brand identity
| Token | Hex | Use |
|---|---|---|
| Carbon Black | #080808 | Page background |
| Matte Graphite | #121212 | Cards, panels |
| Dark Oxblood | #260B10 | Highlights, glows |
| Blood Maroon | #3A0D15 | Hover states, alerts |
| Burnt Burgundy | #501018 | Buttons, redline, "not legal" |
| Gunmetal Grey | #77716A | Muted text, icons |
| Brushed Steel | #B0A69A | Body text, metal details |

Headlines use **Barlow Condensed**, body text **Barlow**, technical labels **JetBrains Mono**. Fonts are bundled with the project, so the site looks right even offline during a demo.

**Photography:** drop a dark, moody bike photo you own (or one with a free licence, e.g. from Unsplash) at `public/photos/hero.jpg` and the home page uses it automatically as a cinematic background.


A full stack website for motorcycle riders in South India.

- **Find your state**: on the first visit the site asks for the rider's location (GPS) and picks their state, or they choose it from a list. Everything below then shows that state. A "📍 State · Change" button in the top bar switches it.
- **Bikes**: the top bikes for the rider's state, with specs and rider-reported common issues (upvote "I had this too")
- **Mod Lab**: stack mods (exhaust, ECU remap, air filter, sprockets, LED, tyres, horn) and see how power, mileage and noise change, plus whether it is legal in India, with the law sections, sources and any local notes for the rider's state
- **Forum (The Pit Stop)**: Reddit-style posts, comments and upvotes. Verified mechanics get a badge and their answers are shown first
- **Verified mechanics**: garages apply, get matched against Google Business (Google Places API), and an admin approves them. Shown on a map
- **Roadside assistance**: official helplines for each brand

**Tech stack:** Next.js 15 (React) + Tailwind CSS on the frontend, Next.js server actions as the backend, Supabase (PostgreSQL + Auth) as the database, Leaflet for maps, Vercel for hosting.

---

## 1. Run it on your laptop (5 minutes, no database needed)

You need **Node.js 20 or newer**. Download it from https://nodejs.org (choose "LTS").

1. Unzip the project and open the `blackline-society` folder in **VS Code**.
2. Open the terminal in VS Code: menu **Terminal → New Terminal**.
3. Run:
   ```
   npm install
   npm run dev
   ```
4. Open http://localhost:3000 in your browser.

The site runs in **demo mode**: you can browse everything with sample data. Login, posting and voting turn on once you connect Supabase (step 2).

---

## 2. Connect the database (Supabase, free)

1. Go to https://supabase.com, sign up and click **New project**. Pick region **South Asia (Mumbai)**. Save the database password somewhere.
2. When the project is ready, open **SQL Editor** (left menu) → **New query**.
3. Open `supabase/schema.sql` from this project, copy everything, paste it, click **Run**.
4. New query again. Copy everything from `supabase/seed.sql`, paste, click **Run**. This adds the bikes, issues, mods, laws and helplines.
5. Go to **Project Settings → API**. Copy the **Project URL** and the **anon public** key.
6. In the project folder, make a copy of `.env.example` and name it `.env.local`. Fill it in:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   GOOGLE_PLACES_API_KEY=
   ```
7. Stop the app (Ctrl + C in the terminal) and run `npm run dev` again. The demo banner disappears.

**Tip for testing:** in Supabase go to **Authentication → Sign In / Providers → Email** and turn off **Confirm email**. Then sign up works instantly without checking your inbox.

### Make yourself admin
Sign up on the site first. Then in the Supabase SQL Editor run (use your username, shown in the top bar):
```sql
update public.profiles set role = 'admin' where username = 'your_username_1234';
```
Refresh the site. You now see **Admin** in the top bar, where you approve mechanics.

### Try the full mechanic flow for your demo
1. Log in with a second account (another email), go to **Mechanics → List your garage** and apply.
2. Log in as admin, open **Admin**, click **Approve**.
3. That account now has the green **Verified mechanic** badge on the forum.

---

## 3. Optional extras

**Google Places verification:** create an API key at https://console.cloud.google.com, enable **Places API (New)** (billing must be enabled, there is a free monthly credit). Put the key in `GOOGLE_PLACES_API_KEY`. When a mechanic applies, the app searches Google for the garage and saves the place ID, rating and location. Without a key, the admin checks the Google Maps link by hand.

**Login with Google:** in Supabase go to **Authentication → Sign In / Providers → Google** and follow the steps there. The "Continue with Google" button already works once this is set up.

---

## 4. Put it online (Vercel, free)

1. Push the project to a GitHub repository (do **not** upload `.env.local`, it is already in `.gitignore`).
2. Go to https://vercel.com, log in with GitHub, click **Add New → Project**, choose the repo.
3. Under **Environment Variables**, add the same values as your `.env.local`.
4. Click **Deploy**. You get a link like `blackline-society.vercel.app`.
5. In Supabase, **Authentication → URL Configuration**: set **Site URL** to your Vercel link and add `https://your-link.vercel.app/auth/callback` to **Redirect URLs**.

---

## 5. How the code is organised

Think of it like a bike: `app/` is the body you see, `lib/` is the engine, `supabase/` is the fuel tank.

```
app/                   Pages. Each folder is a URL.
  page.js              Home page  (/)
  bikes/               Bike list (/bikes) and bike detail (/bikes/re-classic-350)
  mod-lab/             The Mod Lab (/mod-lab)
  forum/               Forum list, new post, single post
  mechanics/           Mechanic map and "join" form
  roadside/            Brand helplines
  login/, auth/        Login, sign up, Google login callback
  admin/               Approve mechanics (admins only)
  actions.js           The backend: every "save" (post, comment, vote, review, apply)
components/            Reusable UI pieces (bike card, navbar, map, Mod Lab screen)
lib/
  data.js              Reads data from Supabase, or from sample data in demo mode
  mods.js              Maths for the Mod Lab (adds up the % changes)
  supabase/            Connects to Supabase
data/seed-data.mjs     All bike, issue, mod, law and helpline data in one place
supabase/schema.sql    Database tables and security rules
supabase/seed.sql      Generated from seed-data.mjs
```

### How the state is picked
- `lib/states.mjs` lists the six states and about 150 reference towns. The rider's GPS position is matched to the nearest town, and that town's state is used. Towns just outside South India (Goa, Maharashtra, Chhattisgarh, Odisha) are in the list too, so riders near a border are not put in the wrong state. Anyone more than 100 km from every town is told the site only covers South India for now.
- This check runs in the rider's own browser. Their exact location is never sent to the server or to any other company. Only the chosen state is saved, in a cookie called `bls_state`.
- GPS only works on `localhost` or on an `https://` address (Vercel gives you https automatically).

### Changing the top bikes for a state
1. Open `data/seed-data.mjs` and find `stateTopBikes`. Each state has a list of bike slugs, most popular first.
2. **Where the order comes from:** the government's VAHAN dashboard (https://vahan.parivahan.gov.in/vahan4dashboard/), which counts two-wheeler registrations by brand for each state. The 2025 figures are written above `stateTopBikes`. VAHAN does not split figures by model, so each brand's main bike is ranked by that brand's registrations in the state, and second bikes from the same brand (Raider, Hunter, MT-15, 390 Duke) follow in order of national sales. Honda and TVS figures include their scooters.
3. Run `npm run seed:sql` and run the new `seed.sql` in Supabase, as below.

### Adding a local rule for one state
In `data/seed-data.mjs`, add a `state_notes` entry to the mod, like the Karnataka note on the aftermarket exhaust. It only shows to riders in that state.

### Adding or editing a bike, issue or mod
1. Edit `data/seed-data.mjs`.
2. Run `npm run seed:sql` to regenerate `supabase/seed.sql`.
3. Run the new `seed.sql` in the Supabase SQL Editor. It updates bikes, brands and mods in place and keeps users, posts, reviews and rider-reported issues.

### Database tables
| Table | What it stores |
|---|---|
| profiles | Every user, with role: rider, mechanic or admin |
| states | The South India states the site covers |
| brands | Bike brands and their roadside assistance numbers |
| bikes | Bike models and specs |
| state_bikes | Top bikes in each state, with their rank |
| mod_state_notes | Local legal or police notes for one state |
| issues, issue_votes | Common issues and who upvoted them |
| mod_parts | Mods, their effect ranges and legal status per state |
| mod_reviews | Riders' real results after doing a mod |
| posts, comments, post_votes | The forum |
| mechanics | Garage applications and verified mechanics (with their state) |

Security uses Supabase **Row Level Security**: anyone can read, only logged-in users can post, users can only delete their own content, and only admins can approve mechanics.

---

## 6. Important notes for your report

- Mod numbers are **estimated ranges** from typical results, not dyno tests.
- Legal info summarises the Motor Vehicles Act 1988 (Sec. 52, 182A, 190), CMVR 1989 (Rules 119, 120) and the 2019 Supreme Court ruling (RTO v. K. Jayachandra). It is not legal advice. Each mod links to its source.
- Specs and prices are approximate.
- Roadside numbers were collected from official brand pages in November 2026 and may change.
- The two mechanics on the map in demo mode are sample listings.

## Ideas for later
The rest of India (add states and towns to `lib/states.mjs` and lists to `stateTopBikes`), bike photos, mechanic ratings, push alerts for recalls, a Kannada language option.
