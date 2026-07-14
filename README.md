# Automation consulting website (Next.js, light theme)

Single-page scroll site focused on independent consulting, EU funding, and the
vetted-integrator model. 3D cobot cell hero (react-three-fiber, IK pick-and-place),
HR/EN toggle, process, funding band, team, FAQ accordion, contact form.

## Run
    npm install
    npm run dev        # http://localhost:3000

## Customize
- **site.config.js** — company name, email, phone, city (placeholders!)
- **lib/i18n.js** — ALL page copy (HR + EN side by side), incl. team bios & FAQ
- **app/globals.css** — brand tokens in :root
- **Team photos** — put images in public/team/ and in components/Sections.jsx
  swap the initials avatar for: <div className="avatar"><img src="/team/jon.jpg" alt={m.name}/></div>

## Contact form
Currently opens the visitor's e-mail client pre-filled (mailto) — zero backend, works
anywhere. For real form delivery, sign up at formspree.io (free tier), then in
components/Sections.jsx replace the submit handler with a fetch POST to your Formspree
endpoint. Takes ~10 minutes.

## Deploy
Vercel: push to GitHub → import. Works out of the box.
