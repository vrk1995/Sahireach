# SahiReach LLP — website

Static single-page site for SahiReach LLP, FMCG super stockist for Kerala.

`index.html` is fully self-contained: styles, scripts, logo, fonts and the coverage map are all inlined. No build step, no dependencies. Open it directly or serve the folder.

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
- **Enquiry form has no backend.** It currently opens the visitor's mail client via `mailto:`, which silently fails for anyone without one configured. Wire it to Formspree, Resend, or a serverless function.
- **Coverage map** currently pins all 11 mainland Kerala districts. Confirm which are live versus on request.
- Copyright year is hard-coded to 2026.
