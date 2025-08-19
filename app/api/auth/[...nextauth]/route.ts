// The Better Auth handler is now at /api/auth/[...all]/route.ts
import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({ error: "This endpoint has been replaced by Better Auth at /api/auth" }, { status: 404 })
}

export async function POST() {
  return NextResponse.json({ error: "This endpoint has been replaced by Better Auth at /api/auth" }, { status: 404 })
}
