# RP · Revolutionary Planning

**Road works have no memory. We give every site one.**

Planning-tool prototype for **RPM Hire**, FEIT Hackathon 2026, Problem 3: *Digital Tool for Temporary Infrastructure* (also touches Problems 1 and 2).

Lay out a work zone on a map, check it against what RPM's sensors measured at similar sites, see the estimated cost and a plan safety score **before** anything is deployed, then let every job build a snapshot that improves the next plan.

| Screen | What it shows |
|---|---|
| `Main-v5.dc.html` · Sites | Filter and search sites, List / Map, cost and client score by status |
| `Plan-v5.dc.html` · Plan | Drag equipment onto the map, barrier evidence check, cost, safety score |
| `Client.html` · Client portal | Client view: own projects only, request form, plan review (limited drag and drop, confirm, amendments), live reports with RPM approval, snapshot and team notes |
| `Map-bend.html` · Map | Real Eastern Fwy geometry at the Bulleen Bend (OSM), zoomable; shared by Plan and Live |
| `Live-v5.dc.html` · Live | Layered map (traffic, safety, community, equipment), zoom, events + assets search, Action → job |
| `Snapshot-v5.dc.html` · Snapshot | Metrics, chart, lessons learned automatically, team notes |
| `Place-v5.dc.html`, `Job-v5.dc.html` | Mobile views for the crew |

> Sample data shaped like RPM Hire's MySQL schema. Rates, safety score and severity rules are placeholders.

---

## Run it on your computer

**Easiest:** double-click **`Start (Mac).command`**. It opens http://localhost:3000.
(First time, macOS may block it: right-click the file → **Open** → **Open**.)

**Or with a terminal:**
```bash
cd site-memory
npm start            # needs Node.js; or: python3 -m http.server 3000
```

**Or offline:** just double-click `index.html`. Everything, including React, is bundled in this folder.

---

## Deploy (pick one)

### A. GitHub Pages (recommended: the hackathon needs a public repo anyway)
1. On github.com create a new **empty public** repository, e.g. `site-memory`.
2. Double-click **`Deploy to GitHub (Mac).command`** and paste the repo URL when asked.
   (Or in a terminal: `git init -b main && git add . && git commit -m "v5" && git remote add origin <URL> && git push -u origin main`)
3. On GitHub: **Settings → Pages → Source: GitHub Actions**. The included workflow publishes it.
4. Live at `https://<your-username>.github.io/site-memory/` (about 1 minute). Every later push redeploys.

### B. Vercel
```bash
npm run deploy:vercel      # log in when prompted, accept the defaults (no build step)
```

### C. Netlify
```bash
npm run deploy:netlify     # log in when prompted; publish directory is "."
```
Or drag this whole folder onto https://app.netlify.com/drop.

---

## How it works
- Each screen is a template file (`*.dc.html`) with `{{holes}}`, `<sc-for>` loops, `<sc-if>` conditions and a small logic class.
- `support.js` loads React (bundled in `vendor/`) and **`dc-lite.js`**, our ~150-line runtime that turns each template into React components and scales the screen to fit the window.
- No build step, no server code: any static host works.
- URL options: `Live-v5.dc.html?startZoom=0.6`, `?showSafety=true`, `?startTab=assets`, `Main-v5.dc.html?startView=map`.

## Next step: the real build
TypeScript + React (Next.js) · MySQL 8 (RPM's database) with spatial functions · MapLibre + OpenStreetMap · Turf.js · OSRM for detours · Python for synthetic data. See the team's *Tech Stack Recommendation* note.

## Credits
React 18 (MIT licence, `vendor/LICENSE-react.txt`). Fonts: IBM Plex via Google Fonts. Map drawing is illustrative; no third-party map data is used.


---

## Versions

This folder is a git repo. Each prototype version is a tagged commit.

| Tag | Date | What |
|---|---|---|
| `v5.1` | 30 Sep 2026, 14:40 | Renamed RP · Revolutionary Planning, working Sites filters and + New site, published as an app |
| `v6.2` | 30 Sep 2026, 16:05 | Client portal as a second tab (RPM team · Client); client reports appear in RPM Live with Approve |
| `v6.1` | 30 Sep 2026, 15:20 | Real Bulleen Bend map shared by Plan and Live, closure switch (detour only on full closure), queue and travel time calculated, CCTV live view, barrier swap fix |

```bash
git log --oneline --decorate     # see versions
git diff v5.1 v6.1 --stat        # what changed
git checkout v5.1                # look at an old version (git checkout main to come back)
```
