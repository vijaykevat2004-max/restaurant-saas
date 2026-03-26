import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const url = searchParams.get('url')

    if (!url) {
      return NextResponse.json({ error: 'URL required' }, { status: 400 })
    }

    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`

    const response = await fetch(qrApiUrl)
    
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to generate QR' }, { status: 500 })
    }

    const imageBuffer = await response.arrayBuffer()

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400'
      }
    })
  } catch (error) {
    console.error('QR generation error:', error)
    return NextResponse.json({ error: 'Failed to generate QR' }, { status: 500 })
  }
}
