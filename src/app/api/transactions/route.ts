import { NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import clientPromise from "@/mongodb"
import { Transaction } from "@/models"
import { getSessionUserId } from "@/lib/mobile-auth"

export async function GET(request: NextRequest) {
  try {
    const userId = await getSessionUserId(request)

    if (!userId) {
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

    const filter: Record<string, unknown> = {
      userId: new ObjectId(userId)
    }

    if (type) filter.type = type
    if (categoryId) filter.categoryId = new ObjectId(categoryId)
    if (startDate || endDate) {
      const dateFilter: Record<string, Date> = {}
      if (startDate) dateFilter.$gte = new Date(startDate)
      if (endDate) dateFilter.$lte = new Date(endDate)
      filter.date = dateFilter
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
    const userId = await getSessionUserId(request)

    if (!userId) {
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
      userId: new ObjectId(userId),
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
