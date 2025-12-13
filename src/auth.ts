import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import bcrypt from "bcryptjs"
import clientPromise from "@/mongodb"
import { User } from "@/models"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const client = await clientPromise
        const db = client.db("money_tracker")
        
        const user = await db.collection<User>("users").findOne({
          email: credentials.email
        })

        if (!user) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user._id!.toString(),
          email: user.email,
          name: user.username,
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
    signUp: "/auth/signup",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
      }
      return session
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        const client = await clientPromise
        const db = client.db("money_tracker")
        
        const existingUser = await db.collection<User>("users").findOne({
          email: user.email!
        })

        if (!existingUser) {
          await db.collection("users").insertOne({
            email: user.email!,
            username: user.name!,
            password: "", // No password for Google users
            currency: "USD",
            createdAt: new Date(),
            updatedAt: new Date(),
          })
        }
      }
      return true
    }
  }
}