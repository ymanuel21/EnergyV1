# API Routes Overview

This document lists all **23** API endpoints currently implemented in the `EnergyV1` project. Since the project uses the Next.js App Router, these are defined by `route.ts` files located within the `src/app/api` directory.

## Public / Client APIs (14 Routes)

These endpoints handle public-facing frontend functionality such as catalog browsing, authentication, and user actions.

1. `/api/products` - Handles fetching product catalogs.
2. `/api/asset/[id]` - Handles asset/image retrieval.
3. `/api/quotes` - Handles form submissions for quote requests (inquiries).
4. `/api/auth/[...nextauth]` - Handles NextAuth.js authentication flows.
5. `/api/pricing-display` - Handles dynamic pricing display logic.
6. `/api/brands` - Handles fetching brand data.
7. `/api/projects` - Handles fetching project/portfolio data.
8. `/api/health` - Health check endpoint for monitoring uptime.
9. `/api/navigation` - Handles dynamic navigation data.
10. `/api/search` - Handles global site search queries.
11. `/api/categories` - Handles fetching category hierarchies.
12. `/api/badges` - Handles fetching UI badges for products.
13. `/api/login` - Custom login logic/handler.
14. `/api/upload` - Handles public or user uploads (if applicable).

## Admin / CMS APIs (8 Routes)

These endpoints are protected and serve the internal dashboard for administrative tasks.

15. `/api/admin/products/import-xlsx` - Handles bulk importing products via Excel.
16. `/api/admin/products/export-xlsx` - Handles bulk exporting products to Excel.
17. `/api/admin/projects/delete` - Handles deletion of projects.
18. `/api/admin/projects/create` - Handles creation of new projects.
19. `/api/admin/bulk-products` - Handles bulk updates to products.
20. `/api/admin/search-projects` - Dedicated search for projects within the CMS.
21. `/api/admin/search-products` - Dedicated search for products within the CMS.
22. `/api/admin/session/refresh` - Refreshes the admin session token.

## Analytics API (1 Route)

23. `/api/analytics/track` - Captures telemetry, product views, and user interaction events.
