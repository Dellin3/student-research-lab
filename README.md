# Research Starter Lab

A practical pathway from curiosity to a real student research project.

Research Starter Lab is an independent educational website for high school students. It guides students through choosing a direction, reviewing literature, using AI responsibly, forming questions, building toy models, finding public data, contacting mentors, revising work, and producing a meaningful final output.

## Pages

- Home
- Start Here
- Learn hub
- Tools hub
- Find a Direction
- Research Workflow
- AI & Literature
- Build a Project
- Outreach
- Research Record (served at `/worksheet`)
- Case Studies

The Research Record is interactive, printable, and saved only in the student's browser. The central route configuration defines 12 crawlable public routes, including the Learn and Tools hubs, and supplies the prerender and metadata pipeline.

## Development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run check:seo
npm run check:prerender
```

The production build compiles the Vite client and then pre-renders every public route from the central route configuration. Each route receives its own static `index.html` with page content and metadata, then hydrates as the same React application in the browser.

The site uses React, Vite, React Router, and React Helmet Async. Vercel serves the generated route directories directly.
