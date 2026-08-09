import { Helmet } from 'react-helmet-async'
import { absoluteUrl, SITE } from '../config/site.js'

export default function Seo({
  title = SITE.defaultTitle,
  description = SITE.defaultDescription,
  pathname = '/',
  image,
  type = 'website',
  noindex = false,
  jsonLd = [],
}) {
  const canonicalUrl = absoluteUrl(pathname)
  const imageUrl = image
    ? image.startsWith('https://')
      ? image
      : absoluteUrl(image)
    : null
  const robots = `${noindex ? 'noindex' : 'index'}, follow`
  const webPageData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${canonicalUrl}#webpage`,
    url: canonicalUrl,
    name: title,
    description,
    isPartOf: {
      '@id': `${SITE.origin}/#website`,
    },
  }
  const webSiteData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE.origin}/#website`,
    url: `${SITE.origin}/`,
    name: SITE.name,
    description: SITE.defaultDescription,
  }

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      <meta name="robots" content={robots} />

      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE.name} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      {imageUrl && <meta property="og:image" content={imageUrl} />}

      <meta name="twitter:card" content={imageUrl ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {imageUrl && <meta name="twitter:image" content={imageUrl} />}

      <script type="application/ld+json">{JSON.stringify(webPageData)}</script>
      {pathname === '/' && (
        <script type="application/ld+json">{JSON.stringify(webSiteData)}</script>
      )}
      {jsonLd.map((entry, index) => (
        <script
          // Additional page-specific schema (BreadcrumbList, WebApplication, etc.)
          key={`jsonld-${index}`}
          type="application/ld+json"
        >
          {JSON.stringify(entry)}
        </script>
      ))}
    </Helmet>
  )
}
