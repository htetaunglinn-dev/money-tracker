import NextAuth, { type DefaultSession } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import bcrypt from "bcryptjs"
import clientPromise from "@/mongodb"
import { User } from "@/models"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
    } & DefaultSession["user"]
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Fallback secret allows the app to run without .env.local in development.
  // Always set NEXTAUTH_SECRET in production.
  secret: process.env.NEXTAUTH_SECRET ?? "dev-secret-change-before-production",
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        username: { label: "Username", type: "text" },
        localUser: { label: "Local User", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        // Session-storage user: skip DB, trust credentials passed from client
        if (credentials.localUser === "true") {
          return {
            id: `local-${credentials.email}`,
            email: credentials.email as string,
            name: (credentials.username as string) || (credentials.email as string),
          }
        }

        if (!process.env.MONGODB_URI) return null

        const client = await clientPromise
        const db = client.db("money_tracker")

        const user = await db.collection<User>("users").findOne({
          email: credentials.email as string,
        })

        if (!user) return null

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isPasswordValid) return null

        return {
          id: user._id!.toString(),
          email: user.email,
          name: user.username,
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id as string
      }
      return session
    },
    async signIn({ user, account }) {
      if (account?.provider === "google" && process.env.MONGODB_URI) {
        const client = await clientPromise
        const db = client.db("money_tracker")

        const existingUser = await db.collection<User>("users").findOne({
          email: user.email!,
        })

        if (!existingUser) {
          await db.collection("users").insertOne({
            email: user.email!,
            username: user.name!,
            password: "",
            currency: "USD",
            createdAt: new Date(),
            updatedAt: new Date(),
          })
        }
      }
      return true
    },
  },
})
