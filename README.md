# SahiReach LLP — website

Static single-page site for SahiReach LLP, FMCG super stockist for Kerala.

`index.html` is fully self-contained: styles, scripts, logo, fonts and the coverage map are all inlined. No build step, no dependencies. Open it directly or serve the folder.

`logo.png` sits alongside it as a plain static file — it's only there so the favicon and Open Graph/Twitter link-preview tags (in `<head>`) have a real, crawlable image URL to point at (`https://sahireach.com/logo.png`); social crawlers like WhatsApp's don't run the page's JS, so the inlined/bundled copy of the logo inside `index.html` isn't visible to them.

## Backend

There is no application server. The site is static files on GitHub Pages. The one piece of dynamic behaviour is the "Brand partnership enquiry" form on the contact section, which `fetch()`s directly from the browser to a small [Supabase](https://supabase.com) project (`sahireach-site`, project ref `rfkxgfpoecugcubshwvv`, under the `SahiStart` org) and inserts a row into the `public.enquiries` table. The key embedded in the page is the `anon`/publishable key, which is safe to expose client-side — row-level security on the table only allows anonymous `INSERT`, not `SELECT`/`UPDATE`/`DELETE`, so a visitor can submit an enquiry but can't read anyone else's. View submissions in the Supabase dashboard (Table Editor → `enquiries`) or with the `service_role` key.

## Staff login (`/staff-login/`)

The "Staff Login" link in the site header opens `staff-login/index.html`: a sign-in screen for the SahiReach Order Tool (the web version of the Excel order tool). The page and `app.css` are public and contain no business data.

- **Accounts** live in the same Supabase project as the enquiry form (Supabase Auth). An account only counts as staff if it has a row in `public.staff`; nothing else is readable, even for a signed-in non-staff account.
- **New accounts** are created with a one-time setup code ("Set up your account" on the sign-in screen), never by open sign-up. Codes are stored hashed in `private.staff_invites`, work once and expire after 7 days. The owner can create codes for teammates from the Account panel inside the tool; the database function is `public.staff_invite_create()`.
- **After sign-in** the page calls `public.staff_bootstrap()` (name, role, whether the workspace is loaded) and then `public.staff_workspace_get()`, which returns the tool's code and data to staff only. The workspace lives in `private.staff_workspace`; it is never stored on this website or in this repository. The owner loads it once from the sign-in page (`public.staff_workspace_put()`, owner only).
- **Saving:** every change in the tool is saved a moment later with `public.staff_workspace_save(p_version, p_data)` (any staff). Saves carry the version they started from; if someone else saved in between, the save is refused rather than overwriting their work. The last 30 versions are kept in `private.staff_workspace_history`.
- The screens' code (`staff-login/app.js`, no business data) is served from this site; the data comes from the database after sign-in.
- Database objects: `public.staff`, `private.staff_invites`, `private.staff_workspace`, `private.staff_workspace_history`, and the functions `public.staff_claim`, `public.staff_bootstrap`, `public.staff_invite_create`, `public.staff_workspace_get`, `public.staff_workspace_put`, `public.staff_workspace_save`, `public.staff_workspace_version`.

### Emails from the staff tool

Staff send emails from the tool only when they press Send (sales order, "on its way", back in stock, pick lists to Tropicana). The browser calls the Supabase Edge Function `send-email`, which checks the sender is active staff, sends through Resend and records every attempt in `public.email_log` (300 emails per person per day at most).

Edge Function secrets (Supabase → Edge Functions → Secrets): `RESEND_API_KEY` (required), `EMAIL_FROM` (default `SahiReach <orders@sahireach.com>`; the domain must be verified in Resend), `EMAIL_REPLY_TO` (default `hello@sahireach.com`), `EMAIL_BCC` (optional).

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

- **Enquiry form has no notification.** Submissions land in Supabase but nothing currently pings anyone when a new row arrives — check the dashboard, or wire up a Supabase database webhook/edge function to alert on new rows.
- **Coverage map** currently pins all 11 mainland Kerala districts. Confirm which are live versus on request.
- Copyright year is hard-coded to 2026.
