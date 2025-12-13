import { ObjectId } from "mongodb"

export interface User {
  _id?: ObjectId
  email: string
  username: string
  password: string
  currency: string
  createdAt: Date
  updatedAt: Date
}

export interface Transaction {
  _id?: ObjectId
  userId: ObjectId
  amount: number
  category: string
  description: string
  date: Date
  type: "income" | "expense"
  createdAt: Date
  updatedAt: Date
}