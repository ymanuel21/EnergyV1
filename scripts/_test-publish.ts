// Test saveDraft + publishEntity with new productIds format
import { saveDraft, publishEntity } from '@/lib/services/content-versioning';

(async () => {
  const id = 'cms6tlw3o0009gncbnk89y9ro';
  try {
    await saveDraft({
      entity: 'project',
      id,
      data: {
        title: 'PLTS Klinik Papua 1.5 kWp',
        slug: 'plts-klinik-papua-15-kwp',
        category: 'social',
        location: 'Wamena, Papua',
        year: 2024,
        productIds: [{ slug: 'ecoflow-160w-lightweight-solar-panel', quantity: 2 }],
      },
    });
    console.log('saveDraft: OK');
    await publishEntity({ entity: 'project', id });
    console.log('publishEntity: OK');
  } catch (e: any) {
    console.error('ERROR:', e.message);
    console.error('Stack:', e.stack?.substring(0, 300));
  }
})();
