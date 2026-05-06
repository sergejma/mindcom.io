# mindcom.io

Marketing site for [mindcom.io](https://mindcom.io) — AI-driven health solutions.

Static HTML/CSS/JS, deployed via GitHub Pages.

## Local preview

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Structure

```
.
├── index.html          # home
├── terms.html          # Terms of Service
├── privacy.html        # Privacy Policy
├── assets/
│   ├── css/style.css
│   └── js/app.js
├── CNAME               # custom domain (mindcom.io)
├── .nojekyll           # disable Jekyll processing
├── robots.txt
└── sitemap.xml
```

## Deployment

Pushes to `main` deploy automatically via GitHub Pages once Pages is enabled
in repo settings (Source: `main` branch, root). Custom domain `mindcom.io`
is configured via the `CNAME` file plus the DNS records pointed at GitHub
Pages IPs.
