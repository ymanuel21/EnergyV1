export type Nullable<T> = T | null | undefined;

export interface PageProps<P = Record<string, string>> {
  params: Promise<P>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export interface MetadataParams {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: 'website' | 'product' | 'article';
  noIndex?: boolean;
}
