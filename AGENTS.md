# Repository instructions

- Work only in this Marketplace checkout unless the user explicitly expands scope. Do not modify `_reference/` or sibling repos.
- `data/marketplace/catalog.json` is the sole editorial source. Regenerate derived files with `npm run generate`; never hand-edit generated files or `CANONICAL-SITEMAP.txt`.
- Preserve noindex in metadata, `X-Robots-Tag`, and empty staging sitemap. Do not enable indexing by environment alone. A release needs a separate source and quality review.
- Do not create provider facts, offers, referral destinations, rankings, reviews, ratings, approval claims or prices without specific dated sources. Fictional demo records stay in `data/fixtures`, visibly labeled and disconnected from public profile routes.
- Use only currently verified sibling preview links. Proposed domains are configuration notes, not live destinations.
- Keep directory inside Marketplace with the same catalog. Do not add a parallel directory database, CMS, redirect handler, analytics vendor or intake backend.
- Run `npm run check`, a production HTTP route audit, browser checks, `git diff --check` and `git status` before reporting completion. Report what was actually tested.
- Do not commit, push, deploy, configure DNS, alter Wix or create external resources without a separate user request.
