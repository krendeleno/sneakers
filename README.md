# Sneakers

My sneaker collection as a wall of shoeboxes — with 3D models, a wishlist and a size people can actually buy a gift in.

**Live:** https://krendeleno.github.io/sneakers/ (English) · [/ru/](https://krendeleno.github.io/sneakers/ru/) (Russian)

Astro 7 · React 19 islands · Tailwind 4 · shadcn/ui · `@google/model-viewer` · View Transitions · Feature-Sliced Design ·
Vitest · Playwright · Biome · Steiger · GitHub Pages

![The wishlist wall: dashed ghost boxes with aged label stickers](docs/screenshots/wishlist-wall.webp)

| A pair page: 3D model with colorways and hotspots | Mobile |
| --- | --- |
| ![Owned pair page with the 3D model](docs/screenshots/pair-3d.webp) | ![The wall on a phone](docs/screenshots/mobile.webp) |

## What's inside

- **The wall.** Each pair is the end of a shoebox: brand-colored box, lid with an overhang, a label sticker with
  the photo, size and a barcode (generated from the id). Owned pairs are solid boxes, wishlist pairs are dashed
  "ghost" boxes. Old models get yellowed stickers; hovering a box pulls it out of the wall and scans the barcode.
- **Filters that live in the URL.** Collection / Wishlist tabs, search, year, brand and color, sort by
  newest / brand / color — every view is a shareable link. Boxes re-shelve with View Transitions when the
  order changes and are pulled off the shelf when filtered out.
- **The pair page.** Owned pairs: a 3D model (glTF, `KHR_materials_variants` colorways, hotspots, AR on phones).
  Wishlist pairs: a photo gallery with a lightbox. Info is shown as a large box label with a "Where to buy" stamp.
  The poster morphs from the box into the page and back — breadcrumbs and the Back button return to the exact
  filtered view you came from.
- **Two languages without duplicated pages.** One set of routes (`src/pages/[...lang]/`) generates `en` at `/`
  and `ru` at `/ru/`. UI strings are a typed dictionary (Russian must have every English key); content fields
  are `{ en, ru }` in frontmatter, projected to one locale before reaching an island.

## Architecture

Feature-Sliced Design, enforced by Steiger:

```text
src/
  app/        layout, global styles, theme tokens
  pages/      Astro routes (also the FSD pages layer)
  widgets/    shoe-catalog (the wall), shoe-showcase (3D), shoe-gallery (photos)
  features/   filter-shoes (filter model + URL sync), switch-colorway
  entities/   shoe — Zod schema, label/box UI, barcode, box colors, sticker aging
  shared/     ui (shadcn components, model-viewer wrapper), i18n, lib, config
content/shoes/  one markdown file per pair, posters/ and photos/ next to them
```

Decisions worth calling out:

- **Static first.** Everything is prerendered; React only hydrates the catalog, the 3D viewer and the gallery.
  `model-viewer` and three.js load only on owned pair pages.
- **The URL is the filter state.** The catalog reads it with `useSyncExternalStore` and writes it with
  `replaceState`, so the first client render already matches the URL. Static HTML can't know the query, so a tiny
  inline script hides the wall for a filtered URL until the island renders — no flash of the default tab.
- **Back navigation lands in the right box.** Astro's router snapshots the page before islands hydrate, so the
  target box wasn't there for the morph; the router now waits for the catalog to render the URL state first.
- **Content is validated at build time.** Zod enforces the rules: owned pairs need a model, wishlist pairs can't
  have one; photos are wishlist-only; translations must be complete.
- **Assets are budgeted.** Models are optimized with glTF-Transform (WebP textures, no meshopt so no decoder
  from a CDN); posters and photos live in the content collection, typed with `image()`, and go through
  `astro:assets`: box labels and the gallery strip get small WebP copies, full-size images are re-encoded. The project is marked `sideEffects` so each island
  ships only the shadcn components it uses: the wall doesn't download the lightbox or the content schema.

## Quality

Lighthouse (mobile preset, simulated slow 4G, local static build):

| Page | Performance | Accessibility | Best Practices | SEO | LCP | CLS | TBT | JS |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Catalog | 99 | 100 | 100 | 100 | 2.1 s | 0 | 0 ms | 130 KB |
| Wishlist wall | 92 | 100 | 100 | 100 | 3.3 s | 0 | 0 ms | 130 KB |
| Wishlist pair (gallery) | 95 | 100 | 100 | 100 | 2.9 s | 0 | 0 ms | 114 KB |
| Owned pair (3D) | 84 | 100 | 100 | 100 | 3.7 s | 0.01 | 260 ms | 382 KB |

Desktop is 100 across the board. The 3D page pays for three.js (~290 KB gzipped, loaded only there); its LCP is
the preloaded poster, so the page is readable while the model boots. Every page carries a description,
canonical and `hreflang` (incl. `x-default`). axe (WCAG 2.1 A/AA) runs in the e2e suite on the catalog, the
wishlist, `/ru/`, both pair pages (with the lightbox open) and the 404; the stickers' small print is kept at
4.5:1 even on the most aged paper in the darkest corner of the wall.

## Development

```bash
nvm use && corepack enable pnpm && pnpm install
pnpm dev        # http://localhost:4321/sneakers/
pnpm test       # Vitest: schema, filters, URL state, i18n, barcode
pnpm e2e        # Playwright: catalog, filters, URL restore, 3D, gallery, locales, axe a11y
pnpm lint && pnpm steiger
pnpm build      # astro check + static build
```

CI (`.github/workflows/deploy.yml`) runs lint, Steiger, unit and e2e tests on every push and PR, and deploys
`main` to GitHub Pages.

## Adding a pair

1. Scan the shoe (Polycam / KIRI Engine, photo mode, ~100 shots) and export GLB.
2. `npx @gltf-transform/cli optimize scan.glb public/models/<id>.glb --texture-compress webp --compress false --simplify false`
3. Add a 4:3 WebP poster to `content/shoes/posters/` (render of the model on `#1C1C1C`; thumbnails are generated
   on build) and `content/shoes/<id>.md` with `poster: ./posters/<id>.webp` —
   fields are in `src/entities/shoe/model/schema.ts`. Wishlist pairs (`status: wish`) have no model and can
   list `photos: [./photos/<id>-1.webp, ...]` from `content/shoes/photos/`.
4. Push to `main`.

## Credits

Demo model "Materials Variants Shoe" © 2021 Shopify, CC BY 4.0 (KhronosGroup/glTF-Sample-Assets).
Wishlist photos are from Wikimedia Commons (CC0 / CC BY / CC BY-SA / public domain); authors are listed in each
pair's `credit` field and on its page.
