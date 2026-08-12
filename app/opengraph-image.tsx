import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'HuDy - 대한민국 공휴일 API'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// edge runtime 에는 시스템 한글 폰트가 없으므로 렌더링 시점에 subset 폰트를 주입한다.
// text 파라미터로 실제 사용하는 글자만 요청해 폰트 용량을 최소화한다.
const FONT_TEXT = 'HuDy대한민국공휴일API조회영업계산커스텀MCP서버·hudy.co.kr'

async function loadNotoSansKR(text: string): Promise<ArrayBuffer | null> {
  try {
    const cssUrl = `https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@700&text=${encodeURIComponent(text)}`
    const css = await fetch(cssUrl, {
      headers: {
        // woff2 대신 truetype 을 받기 위해 구형 UA 를 사용한다 (satori 는 ttf/otf/woff 만 지원).
        'User-Agent':
          'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.85 Safari/537.36',
      },
    }).then((res) => (res.ok ? res.text() : null))

    if (!css) return null

    const match = css.match(/src:\s*url\((https:\/\/[^)]+)\)/)
    if (!match) return null

    const font = await fetch(match[1])
    if (!font.ok) return null

    return await font.arrayBuffer()
  } catch {
    return null
  }
}

export default async function OgImage() {
  const fontData = await loadNotoSansKR(FONT_TEXT)

  // 한글 폰트를 못 받아온 경우 글자가 깨지므로 영문 카피로 폴백한다.
  const headline = fontData ? '대한민국 공휴일 API' : 'Korean Holiday API'
  const subline = fontData
    ? '공휴일 조회 · 영업일 계산 · 커스텀 공휴일 · MCP 서버'
    : 'Holidays · Business days · Custom holidays · MCP server'

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0a0a0a',
          position: 'relative',
          fontFamily: fontData ? 'Noto Sans KR' : 'sans-serif',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(212, 64, 56, 0.12) 0%, transparent 70%)',
          }}
        />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 20,
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              color: '#fafafa',
              letterSpacing: '-2px',
            }}
          >
            HuDy
          </div>
          <div
            style={{
              fontSize: 32,
              fontWeight: 700,
              color: '#d44038',
            }}
          >
            {headline}
          </div>
          <div
            style={{
              fontSize: 20,
              color: '#a1a1aa',
              marginTop: 8,
              textAlign: 'center',
              maxWidth: 600,
            }}
          >
            {subline}
          </div>
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 18,
            color: '#71717a',
          }}
        >
          hudy.co.kr
        </div>
      </div>
    ),
    {
      ...size,
      fonts: fontData
        ? [{ name: 'Noto Sans KR', data: fontData, weight: 700 as const, style: 'normal' as const }]
        : undefined,
    },
  )
}
