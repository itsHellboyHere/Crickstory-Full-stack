
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const target = searchParams.get('url')
  if (!target) return NextResponse.json({ error: 'Missing url' }, { status: 400 })

  const res = await fetch(target)
  const body = await res.json()
  return NextResponse.json(body)
}
