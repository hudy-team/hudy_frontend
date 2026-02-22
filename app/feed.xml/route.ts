const SITE_URL = 'https://www.hudy.co.kr'
const SITE_NAME = 'HuDy'
const SITE_DESCRIPTION =
  '대한민국 공휴일 조회, 영업일 계산, 커스텀 공휴일 관리를 위한 REST API 서비스입니다.'

interface FeedItem {
  title: string
  description: string
  url: string
  date: string
}

const feedItems: FeedItem[] = [
  {
    title: 'HuDy API v2 - 대한민국 공휴일 API',
    description:
      '대한민국 법정 공휴일 조회, 영업일 계산, 커스텀 공휴일 관리를 위한 REST API. SDK와 MCP 서버를 지원합니다.',
    url: SITE_URL,
    date: '2026-02-01T00:00:00+09:00',
  },
  {
    title: 'MCP 서버 지원 - Claude, Cursor 등 AI 도구 연동',
    description:
      'HuDy MCP 서버를 통해 Claude Desktop, Cursor 등 AI 도구에서 공휴일 조회와 영업일 계산을 바로 사용할 수 있습니다.',
    url: `${SITE_URL}/#docs`,
    date: '2026-01-15T00:00:00+09:00',
  },
  {
    title: '공식 SDK 출시 - Node.js, Python',
    description:
      'npm install @hudy-sdk/sdk 또는 pip install hudy-sdk 한 줄로 대한민국 공휴일 API를 연동하세요.',
    url: `${SITE_URL}/#docs`,
    date: '2026-01-10T00:00:00+09:00',
  },
  {
    title: '영업일 계산 API - 영업일 수 계산, 더하기, 빼기',
    description:
      '특정 날짜의 영업일 여부 확인, 기간 내 영업일 수 계산, N영업일 후/전 날짜를 REST API로 계산합니다.',
    url: `${SITE_URL}/#docs`,
    date: '2025-12-20T00:00:00+09:00',
  },
]

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function buildRssXml(): string {
  const itemsXml = feedItems
    .map(
      (item) => `    <item>
      <title>${escapeXml(item.title)}</title>
      <description>${escapeXml(item.description)}</description>
      <link>${escapeXml(item.url)}</link>
      <guid isPermaLink="false">${escapeXml(item.url)}</guid>
      <pubDate>${new Date(item.date).toUTCString()}</pubDate>
    </item>`
    )
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_NAME)} - 대한민국 공휴일 API</title>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <link>${SITE_URL}</link>
    <language>ko</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
${itemsXml}
  </channel>
</rss>`
}

export function GET() {
  const xml = buildRssXml()

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
