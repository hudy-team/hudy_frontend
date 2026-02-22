import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'HuDy - 대한민국 공휴일 API'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OgImage() {
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
              fontWeight: 800,
              color: '#fafafa',
              letterSpacing: '-2px',
            }}
          >
            HuDy
          </div>
          <div
            style={{
              fontSize: 32,
              fontWeight: 600,
              color: '#d44038',
            }}
          >
            대한민국 공휴일 API
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
            공휴일 조회 · 영업일 계산 · 커스텀 공휴일 · MCP 서버
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
    { ...size },
  )
}
