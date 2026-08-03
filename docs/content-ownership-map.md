# EnergyV1 — Content Ownership Map

All public content on https://energyv1.vercel.app comes from these CMS modules.

| Content | Managed by | Admin URL | DB Table | Public Route |
|---------|-----------|-----------|----------|-------------|
| Homepage hero, sections, CTA | Homepage CMS | /admin/homepage | homepage_sections | / |
| Homepage testimonials section | Testimonials CMS | /admin/testimonials | testimonials | / (via Homepage) |
| Homepage brand logos | Brands CMS | /admin/brands | brands | / (via Homepage) |
| Featured products on homepage | Products CMS | /admin/products | products | / (via Homepage) |
| Project gallery on homepage | Projects CMS | /admin/projects | projects | / (via Homepage) |
| Product catalog | Products CMS | /admin/products | products | /produk/[slug] |
| Product pricing | Products CMS + Settings | /admin/products, /admin/settings | products + site_settings | /produk/[slug] |
| Brand pages | Brands CMS | /admin/brands | brands | /brand/[slug] |
| Category pages | Categories CMS | /admin/categories | categories | /kategori/[slug] |
| Project detail pages | Projects CMS | /admin/projects | projects | /proyek/[slug] |
| Articles / blog | Articles CMS | /admin/articles | articles | /artikel/[slug] |
| FAQ | FAQ CMS | /admin/faq | faqs | /faq |
| Navigation (header, footer, mobile) | Navigation CMS | /admin/navigation | navigation_links | All pages |
| Landing / marketing pages | Landing Pages CMS | /admin/pages | landing_pages | /[slug] |
| About, Privacy, Terms, Shipping, Returns | Static Pages CMS | /admin/static-pages | pages | /halaman/[slug] |
| Site name, tagline, email, phone, WhatsApp, address | Settings | /admin/settings | settings | All pages |
| Copyright text | Settings (SITE_CONFIG.name + year) | /admin/settings | (derived) | Footer |
| Logo (letter, text) | Settings (fallback defaults) | — | (not yet DB-backed) | Header, Footer |
| SEO metadata (title, description, OG) | Settings + per-page metadata | /admin/settings | site_settings | All pages |
| Theme / appearance | Appearance | /admin/appearance | settings | All pages |
| Testimonials | Testimonials CMS | /admin/testimonials | testimonials | /testimoni |
| RFQ form | Permintaan Penawaran (hardcoded form) | — | quote_requests | /permintaan-penawaran |
| Checkout | Checkout (reads Settings) | — | — | /checkout |
