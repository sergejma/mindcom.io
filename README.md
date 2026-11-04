# mindcom.io

Company site of mindcom: the apps Face it, Dials and becertain (AEVO Prüfung, 34a Sachkunde).

Plain HTML, CSS and JS with no build step, deployed through GitHub Pages from `main`.
System font, no external requests. Motion follows Emil Kowalski's skills (github.com/emilkowalski/skills).

## Local preview

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Structure

```
.
├── index.html            home
├── privacy-policy/       privacy policy
├── terms-of-service/     terms of service
├── imprint/              Impressum
├── dials/                Dials site with its own CSS and JS
├── assets/
│   ├── css/style.css     home and legal pages
│   ├── js/app.js         home, progressive enhancement only
│   ├── apps/             app icons and screenshots
│   └── logo/             brand exports
├── CNAME                 custom domain
├── .nojekyll             disables Jekyll
├── robots.txt
└── sitemap.xml
```

When CSS or JS changes, raise the `?v=` parameter in the HTML files, otherwise browsers and the CDN keep the old file.

## When a becertain app goes live

In `index.html`, section `#becertain`: replace the pill "Coming soon" with "On the App Store" and link the row to the store listing. The 34a row has no link until becertain.app/34a/ is online.
