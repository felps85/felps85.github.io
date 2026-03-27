# Felipe Portfolio Rebuild

This repo contains a static GitHub Pages rebuild of `https://felip.eu/`.

## Commands

- `npm run scrape` pulls the current live portfolio into `data/portfolio.json`
- `npm run download-assets` downloads and renames portfolio images into `docs/assets/`
- `npm run build` generates the static site into `docs/`
- `npm run generate` runs scrape, asset download, and build in sequence

## Deploy to GitHub Pages

1. Create a GitHub repository and add it as this repo's `origin` remote.
2. Push the default branch to GitHub.
3. In GitHub, open `Settings -> Pages`.
4. Set the source to `Deploy from a branch`.
5. Pick your default branch and the `/docs` folder.
6. If you want to keep `felip.eu`, point your domain DNS to GitHub Pages and keep [`docs/CNAME`](/Users/eldorado/Documents/Codex/portfolio/docs/CNAME) in the repo.

## Notes

- All portfolio images are mirrored locally into `docs/assets/projects/<slug>/`.
- The two embedded videos currently open from YouTube, so they do not depend on Adobe Portfolio.
- [`docs/.nojekyll`](/Users/eldorado/Documents/Codex/portfolio/docs/.nojekyll) is included so GitHub Pages serves the static output directly.
