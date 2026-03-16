/**
 * getSessionUserId
 *
 * Unified auth helper for API routes that must serve both:
 *  - Web clients (NextAuth cookie/session via `auth()`)
 *  - Flutter mobile clients (Bearer JWT signed with NEXTAUTH_SECRET)
 *
 * Returns the userId string, or null if unauthenticated.
 */
import { NextRequest } from "next/server"
import { jwtVerify } from "jose"
import { auth } from "@/auth"

const secret = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET ?? "dev-secret-change-before-production"
)

interface MobileJwtPayload {
  id: string
  email: string
}

export async function getSessionUserId(request: NextRequest): Promise<string | null> {
  // 1. Try NextAuth session (web cookie flow)
  const session = await auth()
  if (session?.user?.id) {
    return session.user.id
  }

  // 2. Fall back to Bearer JWT (Flutter mobile flow)
  const authHeader = request.headers.get("authorization")
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7)
    try {
      const { payload } = await jwtVerify(token, secret)
      const id = (payload as unknown as MobileJwtPayload).id
      return id ?? null
    } catch {
      return null
    }
  }

  return null
}
