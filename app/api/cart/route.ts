import { NextResponse } from 'next/server'
import { getDbCart } from '@/lib/actions/cart'

export async function GET() {
  const items = await getDbCart()
  return NextResponse.json(items)
}
