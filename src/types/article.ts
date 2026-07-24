export interface Article {
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  category: string | null;
  image: string | null;
  author: string;
  readTime: number | null;
  /** Static data uses `date`, Prisma uses `publishedAt` */
  date?: string;
  publishedAt?: string | null;
  createdAt?: string | Date;
}
