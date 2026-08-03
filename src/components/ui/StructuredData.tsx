import { SITE } from '@lib/constants';

export function OrganizationSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: SITE.company,
          url: SITE.url,
          description: SITE.description,
          email: SITE.email,
          telephone: SITE.phone,
          address: {
            '@type': 'PostalAddress',
            streetAddress: SITE.address,
            addressLocality: 'Bandung',
            addressRegion: 'Jawa Barat',
            postalCode: '40293',
            addressCountry: 'ID',
          },
        }),
      }}
    />
  );
}

export function BreadcrumbListSchema({ items }: { items: { name: string; url?: string }[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: items.map((item, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: item.name,
            item: item.url ?? undefined,
          })),
        }),
      }}
    />
  );
}

export function ItemListSchema({ items }: { items: { name: string; url: string }[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          itemListElement: items.map((item, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: item.name,
            url: item.url,
          })),
        }),
      }}
    />
  );
}

export function FAQPageSchema({ items }: { items: { question: string; answer: string }[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: items.map((item) => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: item.answer,
            },
          })),
        }),
      }}
    />
  );
}

export function ArticleSchema({ article }: { article: { title: string; description: string; datePublished: string; author: string; url: string } }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: article.title,
          description: article.description,
          datePublished: article.datePublished,
          author: {
            '@type': 'Organization',
            name: article.author,
          },
          publisher: {
            '@type': 'Organization',
            name: SITE.company,
          },
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': article.url,
          },
        }),
      }}
    />
  );
}
