import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard/', '/auth/', '/api/', '/checkout/success'],
      },
      {
        userAgent: 'Yeti',
        allow: '/',
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
      },
    ],
    sitemap: 'https://www.hudy.co.kr/sitemap.xml',
    host: 'https://www.hudy.co.kr',
  }
}
