import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Proxy is minimal — auth protection is handled client-side via useEffect in each page.
// This just passes through all requests.
export default function proxy(_request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
