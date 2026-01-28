# Ranger

**Local intelligence for the modern neighbor.**

Ranger delivers weekly intelligence briefings covering crime, development, elections, and more for your county. No doomscrolling. No toxic comments. Just what happened, what it means, and what to watch.

## Current Coverage

- McHenry County, IL (310,000 residents, 24 municipalities)

## Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS 4
- **Animations**: GSAP + Framer Motion
- **Smooth Scroll**: Lenis
- **Typography**: IBM Plex Sans/Mono + Bebas Neue

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Project Structure

```
ranger/
├── app/
│   ├── globals.css      # Design tokens & base styles
│   ├── layout.tsx       # Root layout with fonts
│   └── page.tsx         # Landing page
├── components/
│   ├── hero-section.tsx
│   ├── categories-section.tsx
│   ├── how-it-works-section.tsx
│   ├── coverage-section.tsx
│   ├── footer-section.tsx
│   ├── side-nav.tsx
│   ├── split-flap-text.tsx
│   ├── highlight-text.tsx
│   ├── bitmap-chevron.tsx
│   ├── smooth-scroll.tsx
│   └── animated-noise.tsx
├── lib/
│   └── utils.ts         # Utility functions
└── public/              # Static assets
```

## Deployment

Deploy to Vercel:

```bash
npm install -g vercel
vercel
```

## License

Proprietary - All rights reserved.
