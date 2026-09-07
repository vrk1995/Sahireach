# SahiReach LLP — website

Static single-page site for SahiReach LLP, FMCG super stockist for Kerala.

`index.html` is fully self-contained: styles, scripts, logo, fonts and the coverage map are all inlined. No build step, no dependencies. Open it directly or serve the folder.

`logo.png` sits alongside it as a plain static file — it's only there so the favicon and Open Graph/Twitter link-preview tags (in `<head>`) have a real, crawlable image URL to point at (`https://sahireach.com/logo.png`); social crawlers like WhatsApp's don't run the page's JS, so the inlined/bundled copy of the logo inside `index.html` isn't visible to them.

## Backend

There is no application server. The site is static files on GitHub Pages. The one piece of dynamic behaviour is the "Brand partnership enquiry" form on the contact section, which `fetch()`s directly from the browser to a small [Supabase](https://supabase.com) project (`sahireach-site`, project ref `rfkxgfpoecugcubshwvv`, under the `SahiStart` org) and inserts a row into the `public.enquiries` table. The key embedded in the page is the `anon`/publishable key, which is safe to expose client-side — row-level security on the table only allows anonymous `INSERT`, not `SELECT`/`UPDATE`/`DELETE`, so a visitor can submit an enquiry but can't read anyone else's. View submissions in the Supabase dashboard (Table Editor → `enquiries`) or with the `service_role` key.

## Deployment

Pushes to `main` deploy automatically to GitHub Pages via `.github/workflows/deploy-pages.yml`.

One-time setup still needed in the GitHub UI (not scriptable via the API used to push this code):

1. **Settings → Pages → Build and deployment → Source**: set to "GitHub Actions".
2. **Settings → Pages → Custom domain**: enter `sahireach.com` (the `CNAME` file in this repo already declares it, so GitHub should pick it up on the first deploy) and enable "Enforce HTTPS" once the certificate is issued.
3. **At your domain registrar / DNS provider for sahireach.com**, add:
   - An `A` record for the apex (`@`) pointing to GitHub Pages' IPs:
     `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - (Optional) a `CNAME` record for `www` pointing to `<your-github-username>.github.io`, if you also want `www.sahireach.com` to work.

DNS propagation and certificate issuance can take anywhere from a few minutes to a few hours.

## Before launch

- **Not responsive yet** — the layout is desktop-only below ~1100px.
- **Enquiry form has no notification.** Submissions land in Supabase but nothing currently pings anyone when a new row arrives — check the dashboard, or wire up a Supabase database webhook/edge function to alert on new rows.
- **Coverage map** currently pins all 11 mainland Kerala districts. Confirm which are live versus on request.
- Copyright year is hard-coded to 2026.
