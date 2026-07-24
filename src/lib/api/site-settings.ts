import { SITE } from '@/lib/constants';

export async function getSiteSettings() {
  return {
    name: SITE.name,
    tagline: SITE.tagline,
    description: SITE.description,
    email: SITE.email,
    phone: SITE.phone,
    whatsapp: SITE.whatsapp,
    address: SITE.address,
    url: SITE.url,
  };
}
