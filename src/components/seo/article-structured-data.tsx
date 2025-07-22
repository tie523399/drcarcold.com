import Script from 'next/script'

interface ArticleStructuredDataProps {
  title: string
  description: string
  datePublished: string
  dateModified: string
  author: string
  image?: string
  url: string
}

export function ArticleStructuredData({
  title,
  description,
  datePublished,
  dateModified,
  author,
  image,
  url
}: ArticleStructuredDataProps) {
  const structuredData: any = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": description,
    "datePublished": datePublished,
    "dateModified": dateModified,
    "author": {
      "@type": "Person",
      "name": author
    },
    "publisher": {
      "@type": "Organization",
      "name": "車冷博士",
      "logo": {
        "@type": "ImageObject",
        "url": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://drcarcold.com'}/images/logo.png`
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": url
    }
  }

  if (image) {
    structuredData.image = {
      "@type": "ImageObject",
      "url": image
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
} 