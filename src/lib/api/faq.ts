import 'server-only';
import { getPrisma } from '@/lib/db';
import { applyEnList } from '@/lib/i18n/apply-en';

export interface FaqItem {
  question: string;
  answer: string;
}

/**
 * Fallback FAQ used when the database is unavailable.
 *
 * The database copy is the source of truth; these entries mirror it and are translated here so
 * the fallback is English too.
 */
const STATIC_FAQ: FaqItem[] = [
  { question: 'How do I buy a product on EBTPlaza?', answer: 'Choose the product you want, add it to your cart, then continue to checkout. You will be asked to enter your shipping details and choose a payment method.' },
  { question: 'Which payment methods are available?', answer: 'We accept bank transfer (BCA, Mandiri, BRI, BNI), Virtual Account, and QRIS for certain regions.' },
  { question: 'How long does shipping take?', answer: 'Shipping usually takes 2–7 business days depending on your location. Large products such as solar panels may take longer because they are shipped as cargo.' },
  { question: 'Is there a warranty?', answer: 'Yes, every product carries a different warranty. Warranty information is listed on each product detail page. It is typically 12 years for solar panels and 5–10 years for inverters.' },
  { question: 'How do I submit a request for quotation (RFQ) for a project?', answer: 'Visit the Request a Quote page, fill in the form with your project details, and our team will get back to you with a price quotation.' },
  { question: 'Does EBTPlaza provide installation services?', answer: 'We can recommend installation partners. Tick the "I need installation services" option when filling in the RFQ form and we will help connect you.' },
  { question: 'What is the return policy?', answer: 'Returns can be requested within 7 days of receiving the product, provided the product is in its original condition with complete packaging. See the Return Policy page for full details.' },
];

export async function getAllFaqs(): Promise<FaqItem[]> {
  try {
    if (process.env.DATABASE_URL) {
      const prisma = await getPrisma();
      const rows = await prisma.faq.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' }, select: { id: true, question: true, answer: true } });
      if (rows.length > 0) {
        // Overlay is keyed by row id, so the id is selected for matching and dropped on the way out.
        return applyEnList('faqs', rows).map((r) => ({ question: r.question, answer: r.answer }));
      }
    }
  } catch (e) { console.error('Prisma getAllFaqs failed:', (e as Error).message); }
  return STATIC_FAQ;
}
