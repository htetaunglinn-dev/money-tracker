import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { ObjectId } from "mongodb"
import clientPromise from "@/lib/mongodb"
import { Category } from "@/lib/models"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") // 'income' | 'expense' | null

    const client = await clientPromise
    const db = client.db("money_tracker")

    const filter: any = {
      userId: new ObjectId(session.user.id)
    }

    if (type) {
      filter.type = type
    }

    const categories = await db.collection<Category>("categories")
      .find(filter)
      .sort({ name: 1 })
      .toArray()

    return NextResponse.json({ categories })

  } catch (error) {
    console.error("GET categories error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, icon, color, type } = body

    if (!name || !icon || !color || !type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    if (type !== "income" && type !== "expense") {
      return NextResponse.json(
        { error: "Type must be income or expense" },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db("money_tracker")

    // Check if category name already exists for this user
    const existingCategory = await db.collection<Category>("categories").findOne({
      name,
      userId: new ObjectId(session.user.id)
    })

    if (existingCategory) {
      return NextResponse.json(
        { error: "Category name already exists" },
        { status: 409 }
      )
    }

    const category = {
      name,
      icon,
      color,
      type,
      userId: new ObjectId(session.user.id),
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("categories").insertOne(category)

    return NextResponse.json(
      { 
        message: "Category created successfully",
        id: result.insertedId
      },
      { status: 201 }
    )

  } catch (error) {
    console.error("POST category error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}