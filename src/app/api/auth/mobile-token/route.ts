/**
 * POST /api/auth/mobile-token
 *
 * Mobile-only credentials sign-in route.
 * Validates email + password against MongoDB, then returns a signed JWT
 * (same secret as NextAuth) directly in the response body — no cookie.
 *
 * Flutter stores this token in flutter_secure_storage and sends it as
 * `Authorization: Bearer <token>` on every subsequent request.
 */
import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { SignJWT } from "jose"
import clientPromise from "@/mongodb"
import { User } from "@/models"

const secret = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET ?? "dev-secret-change-before-production"
)

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 })
    }

    if (!process.env.MONGODB_URI) {
      return NextResponse.json({ message: "Database not configured" }, { status: 503 })
    }

    const client = await clientPromise
    const db = client.db("money_tracker")

    const user = await db.collection<User>("users").findOne({ email })

    if (!user) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 })
    }

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 })
    }

    const userId = user._id!.toString()

    const token = await new SignJWT({ id: userId, email: user.email })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("30d")
      .sign(secret)

    return NextResponse.json({
      token,
      user: {
        id: userId,
        email: user.email,
        name: user.username,
        currency: user.currency ?? "USD",
      },
    })
  } catch (error) {
    console.error("[mobile-token] error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
