# Caterly

Caterly is a responsive, static catering management website for presenting event
services, collecting booking inquiries, and managing those inquiries through an
owner dashboard.

## Features

- Editorial homepage with responsive layouts, scroll reveals, animations, and image gallery
- Service catalogue with event-category filtering
- Contact form for wedding, celebration, corporate, and private-event inquiries
- Login, registration, and password-reset form validation
- Client-side customer and owner sessions stored in the browser
- Owner dashboard with booking search, filters, metrics, status updates, and CRUD actions
- Reduced-motion support for the homepage marquee

## Run locally

Caterly has no build step or external runtime dependencies. Serve the repository
with any static file server so that relative links and browser storage work as
expected.

```bash
python3 -m http.server 8000
```

Open [http://localhost:8000](http://localhost:8000) in a browser. The homepage
is available at `/index.html`.

## Project structure

```text
.
├── index.html                 # Homepage
├── pages/
│   ├── services.html          # Service catalogue
│   ├── contact.html           # Booking inquiry form
│   ├── login.html             # Sign-in form
│   ├── register.html          # Registration form
│   ├── forgot-password.html   # Password reset form
│   └── dashboard.html         # Owner booking dashboard
├── css/                       # Shared and page-specific styles
├── js/                        # Navigation, forms, auth, and dashboard logic
└── assets/images/             # Catering and event photography
```

## Demo authentication

Authentication is intentionally front-end only and is suitable for demos or
prototypes, not production use. Sessions and bookings are stored in
`localStorage` and are isolated to the current browser.

- Any valid email can sign in as a customer.
- An email ending in `@caterly.com` is treated as an owner account and can open
  the dashboard.
- No credentials are sent to a server and no backend database is configured.

## Browser support

Caterly uses standard HTML, CSS, and JavaScript APIs, including
`IntersectionObserver`, `localStorage`, and `matchMedia`. A modern browser is
recommended.
