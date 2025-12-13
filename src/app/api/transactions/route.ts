import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { ObjectId } from "mongodb"
import clientPromise from "@/lib/mongodb"
import { Transaction } from "@/lib/models"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const type = searchParams.get("type") // 'income' | 'expense' | null
    const categoryId = searchParams.get("categoryId")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    const client = await clientPromise
    const db = client.db("money_tracker")

    // Build filter
    const filter: any = {
      userId: new ObjectId(session.user.id)
    }

    if (type) filter.type = type
    if (categoryId) filter.categoryId = new ObjectId(categoryId)
    if (startDate || endDate) {
      filter.date = {}
      if (startDate) filter.date.$gte = new Date(startDate)
      if (endDate) filter.date.$lte = new Date(endDate)
    }

    const skip = (page - 1) * limit

    const transactions = await db.collection<Transaction>("transactions")
      .find(filter)
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    const total = await db.collection("transactions").countDocuments(filter)

    return NextResponse.json({
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error("GET transactions error:", error)
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
    const { amount, description, type, categoryId, date, location, tags } = body

    if (!amount || !description || !type || !categoryId) {
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

    const transaction = {
      amount: parseFloat(amount),
      description,
      type,
      categoryId: new ObjectId(categoryId),
      userId: new ObjectId(session.user.id),
      date: date ? new Date(date) : new Date(),
      location,
      tags: tags || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("transactions").insertOne(transaction)

    return NextResponse.json(
      { 
        message: "Transaction created successfully",
        id: result.insertedId
      },
      { status: 201 }
    )

  } catch (error) {
    console.error("POST transaction error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}