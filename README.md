# Atelier North

Small static fashion website with a curated landing page, quick cart, theme toggle, and GitHub Pages deployment workflow.

## Run Locally

1. Open the folder in VS Code.
2. Run the page with any static server or open index.html directly.

Example with Node.js:

```bash
npx serve .
```

## Features

- Responsive layout for mobile and desktop
- Editorial hero, featured products, and lookbook
- Quick cart with local storage persistence
- Dark and light theme toggle with saved preference
- Product detail modal for each featured item
- Stripe checkout redirect from the cart button
- Scroll reveal animations
- SEO and social tags (Open Graph + Twitter card)
- Custom SVG favicon

## Configure Checkout

1. Open script.js.
2. Replace STRIPE_PAYMENT_LINK with your Stripe Payment Link URL.
3. Commit and push to deploy.

This project uses a static-site-friendly redirect approach, so no backend is required for checkout handoff.

## SEO Assets

- Update meta description and social tags in index.html.
- Replace the default favicon at assets/favicon.svg if needed.

## Deploy To GitHub Pages

1. Push changes to the main branch.
2. In repository settings, set Pages source to GitHub Actions.
3. The workflow in .github/workflows/deploy-pages.yml will publish the site.
