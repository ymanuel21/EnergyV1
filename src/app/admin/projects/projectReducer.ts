// Project editor state — reducer-based architecture
// Single source of truth for all editable fields.
// Follows the same pattern as productReducer.ts.

export interface LinkedProduct {
  slug: string;
  name: string;
  brand: string;
  category: string;
  image: string;
  quantity: number;
}

export interface ProjectState {
  // Overview
  title: string;
  slug: string;
  shortDescription: string;
  richDescription: string;
  category: string;
  industry: string;
  systemType: string;
  capacity: string;
  pvModule: string;
  inverter: string;
  battery: string;
  location: string;
  customer: string;
  year: number;
  // Media
  coverImage: string;
  images: string[];
  // Story
  storyChallenge: string;
  storySolution: string;
  storyResult: string;
  // Impact
  impactCo2Reduction: string;
  impactAnnualSavings: string;
  impactEnergyGenerated: string;
  // Products
  linkedProducts: LinkedProduct[];
  // SEO
  seoTitle: string;
  seoDescription: string;
  seoOgImage: string;
  // Settings
  featured: boolean;
  highlights: string[];
  // Dirty tracking
  dirty: boolean;
}

export type ProjectAction =
  // Overview
  | { type: 'SET_TITLE'; value: string }
  | { type: 'SET_SLUG'; value: string }
  | { type: 'SET_SHORT_DESCRIPTION'; value: string }
  | { type: 'SET_RICH_DESCRIPTION'; value: string }
  | { type: 'SET_CATEGORY'; value: string }
  | { type: 'SET_INDUSTRY'; value: string }
  | { type: 'SET_SYSTEM_TYPE'; value: string }
  | { type: 'SET_CAPACITY'; value: string }
  | { type: 'SET_PV_MODULE'; value: string }
  | { type: 'SET_INVERTER'; value: string }
  | { type: 'SET_BATTERY'; value: string }
  | { type: 'SET_LOCATION'; value: string }
  | { type: 'SET_CUSTOMER'; value: string }
  | { type: 'SET_YEAR'; value: number }
  // Media
  | { type: 'SET_COVER_IMAGE'; value: string }
  | { type: 'SET_IMAGES'; value: string[] }
  // Story
  | { type: 'SET_STORY_CHALLENGE'; value: string }
  | { type: 'SET_STORY_SOLUTION'; value: string }
  | { type: 'SET_STORY_RESULT'; value: string }
  // Impact
  | { type: 'SET_IMPACT_CO2'; value: string }
  | { type: 'SET_IMPACT_SAVINGS'; value: string }
  | { type: 'SET_IMPACT_ENERGY'; value: string }
  // Products
  | { type: 'SET_LINKED_PRODUCTS'; value: LinkedProduct[] }
  // SEO
  | { type: 'SET_SEO_TITLE'; value: string }
  | { type: 'SET_SEO_DESCRIPTION'; value: string }
  | { type: 'SET_SEO_OG_IMAGE'; value: string }
  // Settings
  | { type: 'SET_FEATURED'; value: boolean }
  | { type: 'SET_HIGHLIGHTS'; value: string[] }
  // Meta
  | { type: 'MARK_CLEAN' };

export function projectReducer(state: ProjectState, action: ProjectAction): ProjectState {
  const dirty = (updates: Partial<ProjectState>) => ({
    ...state,
    ...updates,
    dirty: true,
  });

  switch (action.type) {
    // Overview
    case 'SET_TITLE':              return dirty({ title: action.value });
    case 'SET_SLUG':               return dirty({ slug: action.value });
    case 'SET_SHORT_DESCRIPTION':  return dirty({ shortDescription: action.value });
    case 'SET_RICH_DESCRIPTION':   return dirty({ richDescription: action.value });
    case 'SET_CATEGORY':           return dirty({ category: action.value });
    case 'SET_INDUSTRY':           return dirty({ industry: action.value });
    case 'SET_SYSTEM_TYPE':        return dirty({ systemType: action.value });
    case 'SET_CAPACITY':           return dirty({ capacity: action.value });
    case 'SET_PV_MODULE':          return dirty({ pvModule: action.value });
    case 'SET_INVERTER':           return dirty({ inverter: action.value });
    case 'SET_BATTERY':            return dirty({ battery: action.value });
    case 'SET_LOCATION':           return dirty({ location: action.value });
    case 'SET_CUSTOMER':           return dirty({ customer: action.value });
    case 'SET_YEAR':               return dirty({ year: action.value });
    // Media
    case 'SET_COVER_IMAGE':        return dirty({ coverImage: action.value });
    case 'SET_IMAGES':             return dirty({ images: action.value });
    // Story
    case 'SET_STORY_CHALLENGE':    return dirty({ storyChallenge: action.value });
    case 'SET_STORY_SOLUTION':     return dirty({ storySolution: action.value });
    case 'SET_STORY_RESULT':       return dirty({ storyResult: action.value });
    // Impact
    case 'SET_IMPACT_CO2':         return dirty({ impactCo2Reduction: action.value });
    case 'SET_IMPACT_SAVINGS':     return dirty({ impactAnnualSavings: action.value });
    case 'SET_IMPACT_ENERGY':      return dirty({ impactEnergyGenerated: action.value });
    // Products
    case 'SET_LINKED_PRODUCTS':    return dirty({ linkedProducts: action.value });
    // SEO
    case 'SET_SEO_TITLE':          return dirty({ seoTitle: action.value });
    case 'SET_SEO_DESCRIPTION':    return dirty({ seoDescription: action.value });
    case 'SET_SEO_OG_IMAGE':       return dirty({ seoOgImage: action.value });
    // Settings
    case 'SET_FEATURED':           return dirty({ featured: action.value });
    case 'SET_HIGHLIGHTS':         return dirty({ highlights: action.value });
    // Meta
    case 'MARK_CLEAN':             return { ...state, dirty: false };
    default: return state;
  }
}

/** Initialize reducer state from a Prisma project record (merged with draftData if applicable). */
export function makeInitialProjectState(project: {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  richDescription: string;
  category: string;
  industry: string;
  systemType: string;
  capacity: string;
  pvModule: string;
  inverter: string;
  battery: string;
  location: string;
  customer: string;
  year: number;
  coverImage: string;
  images: string[];
  highlights: string[];
  productIds: any;
  storyData: any;
  impactData: any;
  seoData: any;
  featured: boolean;
  status: string;
  updatedAt: string;
}): ProjectState {
  // Parse linked products
  const rawIds = project.productIds || [];
  let linkedProducts: LinkedProduct[] = [];
  if (Array.isArray(rawIds)) {
    linkedProducts = rawIds.map((p: any) => {
      if (typeof p === 'string') {
        return { slug: p, name: '', brand: '', category: '', image: '', quantity: 1 };
      }
      return {
        slug: p.slug || p.productId || '',
        name: p.name || '',
        brand: p.brand || '',
        category: p.category || '',
        image: p.image || '',
        quantity: p.quantity || 1,
      };
    });
  }

  const story = (project.storyData as Record<string, string>) || {};
  const impact = (project.impactData as Record<string, string>) || {};
  const seo = (project.seoData as Record<string, string>) || {};

  return {
    title: project.title || '',
    slug: project.slug || '',
    shortDescription: project.shortDescription || '',
    richDescription: project.richDescription || '',
    category: project.category || 'residential',
    industry: project.industry || '',
    systemType: project.systemType || '',
    capacity: project.capacity || '',
    pvModule: project.pvModule || '',
    inverter: project.inverter || '',
    battery: project.battery || '',
    location: project.location || '',
    customer: project.customer || '',
    year: project.year || 2025,
    coverImage: project.coverImage || '',
    images: Array.isArray(project.images) ? project.images : [],
    storyChallenge: story.challenge || '',
    storySolution: story.solution || '',
    storyResult: story.result || '',
    impactCo2Reduction: impact.co2Reduction || '',
    impactAnnualSavings: impact.annualSavings || '',
    impactEnergyGenerated: impact.energyGenerated || '',
    linkedProducts,
    seoTitle: seo.title || '',
    seoDescription: seo.description || '',
    seoOgImage: seo.ogImage || '',
    featured: project.featured || false,
    highlights: Array.isArray(project.highlights) ? project.highlights.filter((h: string) => h.trim()) : [],
    dirty: false,
  };
}

/** Build API payload from reducer state ONLY — never reads from project props. */
export function buildProjectPayload(state: ProjectState) {
  const slug = state.slug
    ? state.slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').substring(0, 100)
    : '';

  return {
    title: state.title,
    slug,
    shortDescription: state.shortDescription,
    richDescription: state.richDescription,
    category: state.category,
    industry: state.industry,
    systemType: state.systemType,
    capacity: state.capacity,
    pvModule: state.pvModule,
    inverter: state.inverter,
    battery: state.battery,
    location: state.location,
    customer: state.customer,
    year: state.year,
    coverImage: state.coverImage,
    images: state.images,
    featured: state.featured,
    storyData: {
      challenge: state.storyChallenge,
      solution: state.storySolution,
      result: state.storyResult,
    },
    impactData: {
      co2Reduction: state.impactCo2Reduction,
      annualSavings: state.impactAnnualSavings,
      energyGenerated: state.impactEnergyGenerated,
    },
    seoData: {
      title: state.seoTitle,
      description: state.seoDescription,
      ogImage: state.seoOgImage,
    },
    productIds: state.linkedProducts.map(p => ({ slug: p.slug, quantity: p.quantity })),
    highlights: state.highlights.filter(h => h.trim()),
  };
}
