# Purelane — Production Shopify Dawn Sections

Turned from a prototype design (`purelane-homepage.html`) into production-grade, merchant-editable sections for Shopify's default **Dawn** theme (Online Store 2.0).

---

## 🔗 Dev Store & Repository

- **Preview Server (Local Verification)**: `http://localhost:3456/preview/index.html`
- **Development Store Setup**:
  - Store: `purelane-dev.myshopify.com`
  - Password: `purelane-preview`
  - Theme: Stock Shopify **Dawn** (Clean install)
- **Git Repository**: Clean, intact commit history:
  1. `feat(prototype): import original Purelane homepage design prototype`
  2. `feat(design-system): add Purelane CSS design tokens, glassmorphism, and theme engine`
  3. `feat(snippets): add reusable product card, SVG icon sprite, atmosphere caustics, and nav rail`
  4. `feat(sections): implement 5 core sections and 11 brand conversion sections for Shopify Dawn`
  5. `feat(template-and-preview): add OS 2.0 template JSON, seed product catalog, and interactive verification harness`

---

## 🏷️ Metafield & Metaobject Definitions

To give marketing teams complete native platform flexibility beyond hardcoding, the following metafield definitions were established:

| Namespace & Key | Type | Purpose | Fallback / Behavior |
| :--- | :--- | :--- | :--- |
| `reviews.rating_value` | `rating` (or decimal) | Dynamic star rating for product cards | Defaults to 4.8 |
| `reviews.rating_count` | `number_integer` | Total review count display | Defaults to mock count based on product ID |
| `custom.benefit_note` | `single_line_text_field` | Short punchy benefit (e.g. "Cuts grease instantly") | Uses block setting in combo section |
| `custom.highlight_badge` | `single_line_text_field` | Custom pill badge (e.g. "Top rated", "New") | Uses product tags `badge:*` or collection rule |
| `custom.bundle_components` | `list.product_reference` | Multi-product references for native bundle transform | Uses block product pickers |

---

## 🛠️ Build Notes

### What we flagged about the original file
1. **Monolithic & Hardcoded**: The 1,700-line prototype had zero CMS integration. All prices, copy, images, and reviews were hardcoded in static HTML with base64 images duplicated multiple times inside the CSS.
2. **Fragile Heights & Text Clamping**: Product titles longer than ~20 characters broke the card row height and displaced "Add to cart" buttons across the shelf grid.
3. **Timer & Memory Leaks in Editors**: Global `setInterval` timers for the hero stage and rotator ran unconditionally without cleanup hooks. In the Shopify Theme Editor, every section edit or re-render would spawn orphaned timers, causing rapid flickering and CPU spikes.
4. **Accessibility Gaps**: Lack of `:focus-visible` styling, missing semantic landmarks (`<section>`, `<article>`, `<nav>`), and non-functional buttons without form action targets.

### What we changed in the code & why
1. **Modular Dawn Section Architecture**: Decomposed the prototype into 16 independent Liquid sections with comprehensive JSON schemas (`sections/purelane-*.liquid`) allowing marketing teams to reorder, add, or toggle sections and blocks.
2. **Reusable Product Card (`purelane-card-product.liquid`)**:
   - **Sold-out state**: Disables button, adds `is-soldout` class, and displays "Sold out" pill when `product.available == false`.
   - **Missing image**: Renders a branded vector SVG bottle illustration when `product.featured_image` is empty.
   - **Long title**: Implemented `-webkit-line-clamp: 2` with strict flex alignment so grid cards remain uniformly aligned regardless of title length.
   - **Discount calculation**: Automatically calculates savings percentage from `compare_at_price` vs `price`.
3. **Theme Editor Lifecycle Resiliency (`purelane.js`)**: Hooked into Shopify's `shopify:section:load`, `shopify:section:unload`, and `shopify:block:select` events to cleanly initialize and destroy observers and intervals on the fly.
4. **Performance & Core Web Vitals**: Extracted repetitive base64 SVGs into centralized CSS variables and vector sprites, added `loading="lazy"` and `srcset` for uploaded imagery, and preserved CLS-free aspect ratios.
5. **Accessibility**: Maintained keyboard navigation, `:focus-visible` contrast outlines, and `prefers-reduced-motion` overrides.

### What we would do with more time
1. **Native Shopify Functions Bundle Engine**: Connect the combos and bundles sections to Shopify's Cart Transform API / Shopify Bundles app so purchasing a bundle automatically decrements individual inventory quantities for each bottle SKU.
2. **Ajax Slide-Over Bundle Builder**: Create an interactive slide-over drawer allowing shoppers to dynamically drag-and-drop bottles into a 3-pack or 5-pack box with real-time tier discount progress bars.
3. **Multi-Currency & Market Localization**: Integrate Shopify Markets currency formatting and translations.

---

## 🤖 AI Workflow Notes

### What we delegated
- Parsing 1,700 lines of dense HTML/CSS and mapping elements into semantic Liquid components.
- Extracting raw vector SVG path data into reusable snippets.
- Generating comprehensive Shopify section schemas with presets and default configurations.
- Synthesizing edge-case catalog data (sold-out items, missing images, ultra-long titles).

### Where it required careful human engineering
- **Overlapping Hero Stage Math**: The 1-bottle vs. 2-bottle vs. 3-bottle overlapping hero stage relies on precise height-driven flex constraints (`clamp(380px, 74svh, 680px)`) and negative margins (`margin-right: -8%`). Generic AI generators often flatten these into standard columns, breaking the single-bottle full-bleed hero composition.
- **Theme Editor Event Lifecycle**: Ensuring intervals and IntersectionObservers are tracked in a `Map` and destroyed on `shopify:section:unload` required deliberate architectural oversight to prevent editor memory leaks.

### What we would systematise for 20+ store builds
1. **Automated AST Section Transpiler**: Build a CLI tool that converts annotated HTML prototypes directly into Shopify Dawn Liquid sections and JSON schemas.
2. **Dawn Utility Snippet Library**: Maintain a standardized toolkit of hardened snippets (`card-product-resilient`, `svg-sprite-generator`, `theme-editor-lifecycle-handler`).
3. **Shopify Admin GraphQL Seeding CLI**: A one-command Node script that provisions development stores, creates metafield definitions, uploads seed products, and deploys theme sections via Shopify CLI.
