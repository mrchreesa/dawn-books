# Dawn Treader Book Shop: two website concepts

Front-end demos for the client to choose a direction. Static HTML, CSS and JS; no build step.

| Page | What it is |
| --- | --- |
| `index.html` | Chooser: both concepts side by side |
| `rare-room/` | **Concept A, The Rare Room.** Dark green leather, gold tooling, lamplight. Title-page hero where the logo draws itself in gold and a lamp follows the cursor; the shop's books on a shelf that scrolls sideways through five centuries. |
| `voyage/` | **Concept B, The Voyage.** The ship sails from night into sunrise as you scroll, then a sea chart where a route draws itself from port to port. |

## Run it locally

```sh
python3 -m http.server 5178
```

Then open http://localhost:5178. Opening the files directly also works.

## Before sharing the link

Social previews need the full address of the hosted site. After deploying (Netlify Drop, Vercel, GitHub Pages…), run:

```sh
sh scripts/set-site-url.sh https://your-site-address
```

That fills in `og:image`, `og:url` and `canonical` on all three pages. The share images themselves are in `assets/og/` (1200×630).

## What's in `assets/`

- `brand/`: the shop's logo traced to vector from their JPEG (`wordmark.svg`, `emblem.svg`, `ship.svg`), plus the JS versions the pages animate.
- `img/books/`: the shop's own Book of the Week photographs, resized to WebP. `img/src/` holds the originals as downloaded.
- `img/scene/shelves.webp`: a duotone montage of the shelves behind the counter in those photos, used for the lamplight in concept A.
- `icons/`, `og/`: favicons, touch icon and share images.

## Libraries

GSAP 3.12.5 with ScrollTrigger, and Lenis 1.1.13, both from CDNs with integrity hashes. Fonts are from Google Fonts: IM Fell English and EB Garamond (A), Gloock and Hanken Grotesk (B).

## Demo-only bits

- The gift certificate button shows a "design preview" note instead of checking out.
- The "Concept A/B" pill in the corner of each page is for the client review; remove it for launch.
- Copy is paraphrased from shop.dawntreaderbooks.com; the address comes from public listings.
