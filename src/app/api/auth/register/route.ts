import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import clientPromise from "@/lib/mongodb"
import { User } from "@/lib/models"

export async function POST(request: NextRequest) {
  try {
    const { email, username, password } = await request.json()

    if (!email || !username || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db("money_tracker")

    // Check if user already exists
    const existingUser = await db.collection<User>("users").findOne({
      email
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const result = await db.collection("users").insertOne({
      email,
      username,
      password: hashedPassword,
      currency: "USD",
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    // Create default categories for the new user
    const defaultCategories = [
      { name: "Food & Dining", icon: "utensils", color: "#ef4444", type: "expense" as const },
      { name: "Transportation", icon: "car", color: "#3b82f6", type: "expense" as const },
      { name: "Shopping", icon: "shopping-bag", color: "#8b5cf6", type: "expense" as const },
      { name: "Entertainment", icon: "film", color: "#f59e0b", type: "expense" as const },
      { name: "Bills & Utilities", icon: "receipt", color: "#ef4444", type: "expense" as const },
      { name: "Healthcare", icon: "heart", color: "#ec4899", type: "expense" as const },
      { name: "Salary", icon: "banknote", color: "#10b981", type: "income" as const },
      { name: "Freelance", icon: "briefcase", color: "#059669", type: "income" as const },
      { name: "Investments", icon: "trending-up", color: "#0d9488", type: "income" as const },
    ]

    await db.collection("categories").insertMany(
      defaultCategories.map(category => ({
        ...category,
        userId: result.insertedId,
        isDefault: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }))
    )

    return NextResponse.json(
      { message: "User created successfully" },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}