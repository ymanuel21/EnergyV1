import { z } from 'zod';

// Product
export const productSchema = z.object({
  name: z.string().min(1, 'Name required'),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens'),
  description: z.string().default(''),
  price: z.number().int().min(0),
  originalPrice: z.number().int().optional(),
  brandId: z.string().min(1),
  categoryId: z.string().optional(),
  isActive: z.boolean().default(true),
  images: z.array(z.string()).default([]),
  specifications: z.any().default([]),
});

// Homepage Section
export const homepageSectionSchema = z.object({
  type: z.enum(['hero', 'category-grid', 'featured-products', 'brands', 'cta', 'projects', 'testimonials', 'system-types']),
  title: z.string().default(''),
  subtitle: z.string().default(''),
  enabled: z.boolean().default(true),
  status: z.enum(['draft', 'published']).default('draft'),
  sortOrder: z.number().int().default(0),
  settings: z.record(z.string(), z.any()).default({}),
});

// Navigation Link
export const navigationLinkSchema = z.object({
  group: z.enum(['header', 'footer_belanja', 'footer_layanan', 'footer_legal', 'mobile', 'utility']),
  label: z.string().min(1),
  href: z.string().min(1).startsWith('/'),
  sortOrder: z.number().int().default(0),
  enabled: z.boolean().default(true),
});

// Brand
export const brandSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  logo: z.string().default(''),
  isActive: z.boolean().default(true),
});

// Category
export const categorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  parentId: z.string().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

// Landing Page
export const landingPageSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  description: z.string().default(''),
  published: z.boolean().default(false),
});

// Project
export const projectSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  category: z.enum(['residential', 'commercial', 'industrial', 'government', 'school']).default('residential'),
  capacity: z.string().default(''),
  location: z.string().default(''),
  customer: z.string().default(''),
  year: z.number().int().min(2000).max(2100).default(2025),
  description: z.string().default(''),
  published: z.boolean().default(false),
});

// Testimonial
export const testimonialSchema = z.object({
  name: z.string().min(1),
  quote: z.string().min(1),
  company: z.string().default(''),
  role: z.string().default(''),
  rating: z.number().int().min(1).max(5).default(5),
  published: z.boolean().default(false),
});

// Theme / Appearance
export const themeSchema = z.object({
  primary: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Invalid hex color'),
  primary_hover: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  surface: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  muted: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  border: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  accent: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  dark_bg: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  radius_sm: z.string().regex(/^\d+$/),
  radius_md: z.string().regex(/^\d+$/),
  radius_lg: z.string().regex(/^\d+$/),
  container: z.string().regex(/^\d+$/),
});

// Query params
export const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(24),
  offset: z.coerce.number().int().min(0).default(0),
  sort: z.enum(['newest', 'price_asc', 'price_desc', 'name']).default('newest'),
  search: z.string().optional(),
  brandId: z.string().optional(),
  categoryId: z.string().optional(),
});

export type PaginationParams = z.infer<typeof paginationSchema>;
