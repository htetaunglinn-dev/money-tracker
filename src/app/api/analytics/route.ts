import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { ObjectId } from "mongodb"
import clientPromise from "@/lib/mongodb"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "month" // 'week' | 'month' | 'year'
    
    const client = await clientPromise
    const db = client.db("money_tracker")

    const userId = new ObjectId(session.user.id)
    
    // Calculate date range
    const now = new Date()
    let startDate: Date
    
    switch (period) {
      case "week":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)
        break
      case "year":
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
        break
      default: // month
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
    }

    // Get total income and expenses
    const [incomeResult, expenseResult] = await Promise.all([
      db.collection("transactions").aggregate([
        {
          $match: {
            userId,
            type: "income",
            date: { $gte: startDate, $lte: now }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" }
          }
        }
      ]).toArray(),
      
      db.collection("transactions").aggregate([
        {
          $match: {
            userId,
            type: "expense",
            date: { $gte: startDate, $lte: now }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" }
          }
        }
      ]).toArray()
    ])

    const totalIncome = incomeResult[0]?.total || 0
    const totalExpense = expenseResult[0]?.total || 0
    const balance = totalIncome - totalExpense

    // Get expenses by category
    const expensesByCategory = await db.collection("transactions").aggregate([
      {
        $match: {
          userId,
          type: "expense",
          date: { $gte: startDate, $lte: now }
        }
      },
      {
        $lookup: {
          from: "categories",
          localField: "categoryId",
          foreignField: "_id",
          as: "category"
        }
      },
      {
        $unwind: "$category"
      },
      {
        $group: {
          _id: "$categoryId",
          name: { $first: "$category.name" },
          icon: { $first: "$category.icon" },
          color: { $first: "$category.color" },
          total: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { total: -1 }
      }
    ]).toArray()

    // Get recent transactions
    const recentTransactions = await db.collection("transactions").aggregate([
      {
        $match: {
          userId,
          date: { $gte: startDate, $lte: now }
        }
      },
      {
        $lookup: {
          from: "categories",
          localField: "categoryId",
          foreignField: "_id",
          as: "category"
        }
      },
      {
        $unwind: "$category"
      },
      {
        $sort: { date: -1, createdAt: -1 }
      },
      {
        $limit: 10
      },
      {
        $project: {
          amount: 1,
          description: 1,
          type: 1,
          date: 1,
          category: {
            name: 1,
            icon: 1,
            color: 1
          }
        }
      }
    ]).toArray()

    // Get daily spending trend
    const dailyTrend = await db.collection("transactions").aggregate([
      {
        $match: {
          userId,
          date: { $gte: startDate, $lte: now }
        }
      },
      {
        $group: {
          _id: {
            date: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$date"
              }
            },
            type: "$type"
          },
          total: { $sum: "$amount" }
        }
      },
      {
        $group: {
          _id: "$_id.date",
          income: {
            $sum: {
              $cond: [
                { $eq: ["$_id.type", "income"] },
                "$total",
                0
              ]
            }
          },
          expense: {
            $sum: {
              $cond: [
                { $eq: ["$_id.type", "expense"] },
                "$total",
                0
              ]
            }
          }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]).toArray()

    return NextResponse.json({
      summary: {
        totalIncome,
        totalExpense,
        balance,
        period
      },
      expensesByCategory,
      recentTransactions,
      dailyTrend
    })

  } catch (error) {
    console.error("GET analytics error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}