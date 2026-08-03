// Universal Module Registry
// Every admin module registers here — sidebar, dashboard, search, permissions all derive from this.

export interface ModuleDefinition {
  id: string;
  label: string;
  icon: string;
  group: string;       // 'catalog' | 'content' | 'website' | 'settings'
  route: string;
  description: string;
  permission: string;  // future RBAC key
  searchFields: string[]; // fields to search across
  crudRoutes?: { new?: string; edit?: string };
}

export const moduleRegistry: Record<string, ModuleDefinition> = {
  dashboard: {
    id: 'dashboard',
    label: 'Dashboard',
    icon: '📊',
    group: 'overview',
    route: '/admin',
    description: 'Admin panel overview and statistics',
    permission: 'view_dashboard',
    searchFields: ['label'],
  },
  homepage: {
    id: 'homepage',
    label: 'Homepage',
    icon: '🏠',
    group: 'website',
    route: '/admin/homepage',
    description: 'Build and manage homepage sections',
    permission: 'manage_homepage',
    searchFields: ['title', 'subtitle', 'type'],
  },
  navigation: {
    id: 'navigation',
    label: 'Navigation',
    icon: '🧭',
    group: 'website',
    route: '/admin/navigation',
    description: 'Manage header, footer, and mobile navigation links',
    permission: 'manage_navigation',
    searchFields: ['label', 'href'],
  },
  appearance: {
    id: 'appearance',
    label: 'Appearance',
    icon: '🎨',
    group: 'website',
    route: '/admin/appearance',
    description: 'Customize colors, typography, and layout',
    permission: 'manage_appearance',
    searchFields: ['label'],
  },
  products: {
    id: 'products',
    label: 'Produk',
    icon: '📦',
    group: 'catalog',
    route: '/admin/products',
    description: 'Manage products, pricing, and inventory',
    permission: 'manage_products',
    searchFields: ['name', 'slug', 'description'],
    crudRoutes: { new: '/admin/products/new' },
  },
  categories: {
    id: 'categories',
    label: 'Kategori',
    icon: '📂',
    group: 'catalog',
    route: '/admin/categories',
    description: 'Manage category hierarchy',
    permission: 'manage_categories',
    searchFields: ['name', 'slug'],
  },
  brands: {
    id: 'brands',
    label: 'Brand',
    icon: '🏢',
    group: 'catalog',
    route: '/admin/brands',
    description: 'Manage brand logos and information',
    permission: 'manage_brands',
    searchFields: ['name', 'slug'],
  },
  badges: {
    id: 'badges',
    label: 'Badges',
    icon: '🏷️',
    group: 'catalog',
    route: '/admin/badges',
    description: 'Manage product badges',
    permission: 'manage_badges',
    searchFields: ['name'],
  },
  articles: {
    id: 'articles',
    label: 'Artikel',
    icon: '📝',
    group: 'content',
    route: '/admin/articles',
    description: 'Manage blog articles and guides',
    permission: 'manage_articles',
    searchFields: ['title', 'content'],
    crudRoutes: { new: '/admin/articles/new' },
  },
  faq: {
    id: 'faq',
    label: 'FAQ',
    icon: '❓',
    group: 'content',
    route: '/admin/faq',
    description: 'Manage frequently asked questions',
    permission: 'manage_faq',
    searchFields: ['question', 'answer'],
  },
  pages: {
    id: 'pages',
    label: 'Halaman',
    icon: '📄',
    group: 'content',
    route: '/admin/pages',
    description: 'Manage static pages (About, Terms, etc.)',
    permission: 'manage_pages',
    searchFields: ['title', 'content', 'slug'],
  },
  projects: {
    id: 'projects',
    label: 'Projects',
    icon: '☀️',
    group: 'content',
    route: '/admin/projects',
    description: 'Manage solar installation portfolio',
    permission: 'manage_projects',
    searchFields: ['title', 'description', 'location'],
  },
  testimonials: {
    id: 'testimonials',
    label: 'Testimonials',
    icon: '💬',
    group: 'content',
    route: '/admin/testimonials',
    description: 'Manage customer testimonials',
    permission: 'manage_testimonials',
    searchFields: ['name', 'quote', 'company'],
  },
  quotes: {
    id: 'quotes',
    label: 'Quote Requests',
    icon: '📋',
    group: 'content',
    route: '/admin/quotes',
    description: 'Manage quotation requests pipeline',
    permission: 'manage_quotes',
    searchFields: ['name', 'email', 'company', 'message'],
  },
  activity: {
    id: 'activity',
    label: 'Activity',
    icon: '📜',
    group: 'settings',
    route: '/admin/activity',
    description: 'View admin activity log',
    permission: 'view_activity',
    searchFields: ['action', 'entity'],
  },
  media: {
    id: 'media',
    label: 'Media',
    icon: '🖼️',
    group: 'content',
    route: '/admin/media',
    description: 'Browse and manage uploaded assets',
    permission: 'manage_media',
    searchFields: ['filename'],
  },
  settings: {
    id: 'settings',
    label: 'Pengaturan',
    icon: '⚙️',
    group: 'settings',
    route: '/admin/settings',
    description: 'Site name, contact info, SEO defaults',
    permission: 'manage_settings',
    searchFields: ['label'],
  },
};

// Groups for sidebar ordering
export const MODULE_GROUPS: Record<string, string> = {
  overview: 'Overview',
  website: 'Website',
  catalog: 'Catalog',
  content: 'Content',
  settings: 'Settings',
};

// All modules as a flat array for search/dashboard
export const modules = Object.values(moduleRegistry);
