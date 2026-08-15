# Purelane — Shopify Dawn Theme Sections

Production-ready, merchant-editable sections for Shopify's default **Dawn** theme (Online Store 2.0), built for **Purelane** — a plant-based homecare brand.

Converted from a design prototype into a modular section library that marketing teams can customize directly in the Shopify Theme Editor without writing code.

---

## Features

- **Native Dawn Architecture**: Built as standard Online Store 2.0 sections and snippets with full Liquid schema settings and presets.
- **Theme Editor Resilient**: JavaScript lifecycle listeners (`shopify:section:load`, `shopify:section:unload`) prevent duplicate timers, memory leaks, or broken animations when customizing in the editor.
- **Edge-Case Handled**:
  - **Sold Out State**: Disables buttons and shows custom badges when inventory is zero.
  - **Missing Image Fallback**: Automatically renders a branded vector SVG illustration if no image is uploaded.
  - **Long Title Resilience**: Line-clamped to 2 lines with strict alignment so product cards remain uniform.
- **Interactive UI**:
  - 3-slide dynamic Hero product stage with hover-pause and price flags
  - Infinite auto-scrolling customer review marquee
  - Product benefit rotator with animated stats
  - Horizontal scroll-snap combos rail with multi-product stacks
  - 3-tier bundle pricing grid
- **Performance & Accessibility**: Inline SVG vector sprite library, `prefers-reduced-motion` compliance, `:focus-visible` states, and zero third-party dependencies.

---

## Sections Included

| Section | Template / Anchor | Description |
| :--- | :--- | :--- |
| **01. Hero** | `section.hero` | Dynamic 3-slide product stage, promise rails, price flags, and dual CTAs |
| **02. Shop / Grid** | `#shop` | 4-column product grid supporting dynamic collections and curated blocks |
| **03. Combos** | `#combos` | Horizontal scroll-snap rail with multi-product stacks and savings badges |
| **04. Bundles** | `#bundles` | 3-tier bundle pricing cards (Starter, Most Popular, Whole Home) |
| **05. Reviews Rail** | `#reviews` | Infinite CSS marquee with aggregate rating proof and verified testimonials |
| **Header & Ticker** | `header` | Fixed floating glassmorphic nav pill with announcement ticker |
| **Botanical Ingredients** | `#ingredients` | 5-column ingredient grid with custom vector line art |
| **Value Pillars** | `#how` | 3 brand value proposition cards |
| **Proof & Rotator** | `#proof` | "Why it works" interactive product rotator + 4 stat rings |
| **Range Shelf** | `#range` | 10-bottle lineup of the complete product range |
| **Why Bundles** | `#whybundles` | 4-column bundle value proposition grid |
| **Categories** | `#categories` | Visual directory for room-specific bundles |
| **Trust Bar** | `#trust` | 4-item reassurance trust signal strip |
| **Newsletter** | `#newsletter` | Purelane Club email capture with discount incentive |
| **Sticky CTA** | `aside.sticky` | Mobile-only bottom conversion bar |
| **Footer** | `footer` | Multi-column brand footer with navigation, contact info, and legal links |

---

## File Structure

```text
├── assets/
│   ├── purelane.css                     # Design tokens, glassmorphism & responsive rules
│   └── purelane.js                      # Theme engine with Theme Editor lifecycle integration
├── layout/
│   └── theme.liquid                     # Base Shopify layout
├── sections/                            # 16 modular Liquid sections
├── snippets/
│   ├── purelane-card-product.liquid     # Reusable edge-case resilient product card
│   ├── purelane-svg-icons.liquid        # Vector sprite library
│   ├── purelane-atmosphere.liquid       # Multi-scene background & animated water caustics
│   └── purelane-nav-rail.liquid         # Section progress rail
├── templates/                           # Shopify OS 2.0 JSON templates
├── data/
│   └── seed-products.json               # Seed catalog with test edge cases
└── preview/
    ├── index.html                       # Local interactive verification harness
    └── server.js                        # Static preview server
```

---

## Quick Start

### 1. Install on Shopify
1. Download or use `purelane-theme.zip` from this repository.
2. In Shopify Admin, go to **Online Store** → **Themes**.
3. Click **Add theme** → **Upload zip file**.
4. Click **Publish** (or **Customize** in the Theme Editor).

### 2. Or Push via Shopify CLI
```bash
npx shopify theme push --store your-store.myshopify.com
```

### 3. Run Local Preview
```bash
node preview/server.js
```
Open `http://localhost:3456/preview/index.html` in your browser.

---

## License

MIT
