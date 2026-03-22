# Wedding Portal

Private planning portal for Paul & Jordan.

## Stack
- **React + Vite** — frontend framework
- **React Router** — client-side routing
- **Netlify** — hosting + identity (auth)
- **Supabase** — database + file storage *(coming soon)*

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Run dev server
npm run dev

# 3. Open http://localhost:5173
```

## Deploy to Netlify

1. Push this repo to GitHub
2. Connect the repo in Netlify → New site from Git
3. Build command: `npm run build`
4. Publish directory: `dist`
5. The `netlify.toml` handles all of this automatically

## Project structure

```
src/
  components/
    Nav.jsx          # Sidebar navigation
  pages/
    Dashboard.jsx    # Home dashboard with countdown
    Finance.jsx      # Finance tracker (full)
    Vendors.jsx      # Vendor tracker (stub)
    Checklist.jsx    # Wedding checklist (stub)
    Guests.jsx       # Guest list (stub)
  App.jsx            # Routes
  main.jsx           # Entry point
  index.css          # Global design tokens + layout
```

## Roadmap

- [ ] Netlify Identity auth (Paul/Jordan full access, planner read-only)
- [ ] Supabase wired into Finance tracker for persistence
- [ ] Vendor tracker with document uploads
- [ ] Wedding checklist & timeline
- [ ] Guest list with RSVP tracking
