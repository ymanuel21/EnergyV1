import { homepageRepo } from '@/lib/repositories/index';

export class HomepageService {
  async getSection(sectionId: string) {
    const sections = await homepageRepo.findAll();
    return sections.find((x: any) => x.id === sectionId);
  }
}

export const homepageService = new HomepageService();
