/**
 * POST /api/auth/mobile-google
 *
 * Mobile-only Google OAuth route.
 * Receives a Google ID token from the flutter google_sign_in package,
 * verifies it against Google's tokeninfo endpoint, then finds-or-creates
 * the user in MongoDB (identical logic to auth.ts signIn callback),
 * and returns a signed JWT.
 */
import { NextRequest, NextResponse } from "next/server"
import { SignJWT } from "jose"
import clientPromise from "@/mongodb"
import { User } from "@/models"

const secret = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET ?? "dev-secret-change-before-production"
)

interface GoogleTokenInfo {
  sub: string
  email: string
  name?: string
  picture?: string
  aud: string
  exp: string
}

async function verifyGoogleToken(idToken: string): Promise<GoogleTokenInfo> {
  const url = `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`
  const res = await fetch(url)

  if (!res.ok) {
    throw new Error("Invalid Google ID token")
  }

  const info = (await res.json()) as GoogleTokenInfo

  // Verify the token was issued for our app
  const clientId = process.env.GOOGLE_CLIENT_ID
  if (clientId && info.aud !== clientId) {
    throw new Error("Token audience mismatch")
  }

  if (Date.now() / 1000 > Number(info.exp)) {
    throw new Error("Google token has expired")
  }

  return info
}

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json()

    if (!idToken) {
      return NextResponse.json({ message: "idToken is required" }, { status: 400 })
    }

    let tokenInfo: GoogleTokenInfo
    try {
      tokenInfo = await verifyGoogleToken(idToken)
    } catch (err) {
      return NextResponse.json(
        { message: err instanceof Error ? err.message : "Google token verification failed" },
        { status: 401 }
      )
    }

    if (!process.env.MONGODB_URI) {
      return NextResponse.json({ message: "Database not configured" }, { status: 503 })
    }

    const client = await clientPromise
    const db = client.db("money_tracker")

    let user = await db.collection<User>("users").findOne({ email: tokenInfo.email })

    if (!user) {
      // Auto-create Google user — mirrors auth.ts signIn callback
      const result = await db.collection("users").insertOne({
        email: tokenInfo.email,
        username: tokenInfo.name ?? tokenInfo.email,
        password: "",
        currency: "USD",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      user = await db.collection<User>("users").findOne({ _id: result.insertedId })
    }

    if (!user) {
      return NextResponse.json({ message: "Failed to create user" }, { status: 500 })
    }

    const userId = user._id!.toString()

    const jwt = await new SignJWT({ id: userId, email: user.email })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("30d")
      .sign(secret)

    return NextResponse.json({
      token: jwt,
      user: {
        id: userId,
        email: user.email,
        name: user.username,
        currency: user.currency ?? "USD",
        avatar: tokenInfo.picture,
      },
    })
  } catch (error) {
    console.error("[mobile-google] error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
