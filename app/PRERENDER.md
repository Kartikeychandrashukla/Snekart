# Pre-rendered pages, 404s and redirects

snekart.in is a Render **Static Site**. Search engines and AI crawlers read the HTML file a URL
returns, so every public page is built as its own HTML file with its title, description,
canonical, Open Graph tags and full content already in it. React then takes over in the browser
("hydration") so the cart, checkout and login work as before.

## How the build works

`npm run build` runs three steps:

| Step | Command | Output |
|---|---|---|
| 1 | `vite build` | `dist/`: the browser app (`dist/index.html` is the template) |
| 2 | `vite build --ssr src/entry-server.jsx --outDir dist-ssr` | `dist-ssr/entry-server.js`, which renders one route to HTML |
| 3 | `node scripts/prerender.js` | the pages below |

Step 3 fetches categories, products and blog posts from `VITE_API_HOST`, then writes:

- `dist/index.html`, `dist/about.html` + `dist/about/index.html`, … for each public page:
  `/`, `/about`, `/blog`, `/emotions`, `/festivals`, `/occasions`, every
  `/emotions|festivals|occasions/<slug>`, every `/shop/<slug>` and every `/blog/<slug>`
- `dist/404.html`: "Page not found" (`noindex`). Render serves it **with HTTP 404** for any URL
  that has no file and no rule.
- `dist/app-shell.html`: the empty app with `noindex`, for `/cart`, `/checkout`, `/login`,
  `/register`, `/my-orders`, `/order-confirmation/*` and `/admin*` (via rewrite rules).
- `dist/sitemap.xml`: exactly the pages written above. All are canonical and all return 200.
  Blog posts include `<lastmod>`.

**If the API is slow:** each request has a 30 s timeout and up to 6 attempts, waiting 2, 4, 8, 16
and 30 s between them. That's enough for a sleeping API to wake up.

**If the API is down or returns no products:** the build **fails** and Render keeps the current
site live. It never publishes a site with pages missing.

The page-title and description rules live in one place, [src/components/Seo.jsx](src/components/Seo.jsx) and
[src/seo/site.js](src/seo/site.js):

- **Product:** title `<Name> – Gift Hamper Delivery in Lucknow | Snekart`. The description is a
  140–155 character summary (opening sentences + what's inside + delivery).
- **Occasion / Festival / Emotion:** the admin's "SEO title" and "description" (Admin →
  Categories → Page content) if set. Otherwise `<Name> Gift Hampers in Lucknow – Snekart`.
- **Blog post:** title `<Post title> – Snekart Blog`. The description is the post's excerpt.
- **Homepage:** title `Snekart – Gift Hampers & Personalised Gifts in Lucknow`.

## Environment variables

| Where | Name | Value |
|---|---|---|
| Render → **snekart** (static site) → Environment | `VITE_API_HOST` | `https://api.snekart.in` (required; the build fails without it) |
| same (optional) | `PRERENDER_FETCH_TIMEOUT_MS` | default `30000` |
| same (optional) | `PRERENDER_FETCH_ATTEMPTS` | default `6` |
| same (optional, emergencies only) | `PRERENDER_ALLOW_EMPTY` | `1` lets the build publish with zero products/categories |
| Render → **snekart-api** → Environment | `RenderDeployHookUrl` | the static site's Deploy Hook URL |
| same (optional) | `DeployHookDelaySeconds` | default `120` |
| GitHub → repo → Settings → Secrets and variables → Actions | `RENDER_DEPLOY_HOOK_URL` | the same Deploy Hook URL |

## How pages are rebuilt when content changes

1. **Automatic:** after an admin creates, edits or deletes a product, blog post or category, the API
   waits 2 minutes after the *last* change and then calls the Deploy Hook once
   ([DeployHookService.cs](../SnekartApi/Services/DeployHookService.cs)). The new pages are live
   about 3–5 minutes later. Reviews don't trigger a rebuild; they load in the browser.
2. **Weekly safety net:** [.github/workflows/weekly-rebuild.yml](../.github/workflows/weekly-rebuild.yml)
   calls the Deploy Hook every Monday at 03:00 IST. You can also run it by hand from the GitHub
   **Actions** tab.
3. **Manual:** Render → snekart → **Manual Deploy → Deploy latest commit**.

**Until the rebuild finishes:**
- A brand-new product's URL returns 404 to search engines. Visitors still see the product,
  because the 404 page loads the full app.
- A deleted product's old page stays up until the rebuild.

## Render dashboard rules (snekart static site → Redirects/Rewrites)

How Render serves a URL (checked against the live site):
1. A file at the **exact** path. A folder's `index.html` only counts when the URL ends in `/`.
2. Otherwise, the rules below, top to bottom (first match wins).
3. Otherwise, `<path>.html` if it exists: `/shop/x` → `shop/x.html`.
4. Otherwise, `404.html` with HTTP 404.

So every page is written as both `shop/x.html` (for `/shop/x`) and `shop/x/index.html` (for
`/shop/x/`), and pre-rendered pages need **no** rules.

**Never rewrite to a file that might not exist.** For example, `/shop/:slug` →
`/shop/:slug/index.html` is wrong: Render answers a missing rewrite target with **200 and an
empty body**, which turns every fake product URL into a blank page.

The final set, in this order:

| # | Source | Destination | Action |
|---|---|---|---|
| 1 | `/how-it-works` | `/about` | Redirect (301) |
| 2 | `/cart` | `/app-shell.html` | Rewrite |
| 3 | `/checkout` | `/app-shell.html` | Rewrite |
| 4 | `/login` | `/app-shell.html` | Rewrite |
| 5 | `/register` | `/app-shell.html` | Rewrite |
| 6 | `/my-orders` | `/app-shell.html` | Rewrite |
| 7 | `/order-confirmation/*` | `/app-shell.html` | Rewrite |
| 8 | `/admin` | `/app-shell.html` | Rewrite |
| 9 | `/admin/*` | `/app-shell.html` | Rewrite |

There must be **no** `/*` catch-all rule. A catch-all is what made every wrong URL return 200.

**What can't be done on a Render Static Site:**
- **`?e=` links** (`/emotions?e=happy`): rules can't match query strings. The page redirects in
  the browser to `/emotions/happy`, and its canonical already points at the clean URL.
- **Trailing slashes** (`/about/`): these return the same page with a canonical of `/about`.
  Render has no rule for "remove the trailing slash", so they can't be 301'd.
- **www and http:** Render already 301s `www.snekart.in` and `http://` to `https://snekart.in`.

## Testing locally

```bash
cd app
VITE_API_HOST=https://api.snekart.in npm run build   # read-only GET requests to the live API
npm run serve:prod                                   # serves dist/ like Render, on :4173
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:4173/this-page-does-not-exist-xyz  # 404
```

[scripts/serve-like-render.js](scripts/serve-like-render.js) uses the same rule list as the table
above. If you change one, change the other.

**Browser test with the live API:** the API only allows requests from snekart.in (CORS). On
localhost, API calls from the browser fail, but pages still show their build-time data. For a full
local test, run the API locally with `FrontendUrl=http://localhost:4173` and build with
`VITE_API_HOST=http://localhost:5084`.
