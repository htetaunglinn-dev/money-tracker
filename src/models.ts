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

export interface Category {
  _id?: ObjectId
  name: string
  icon: string
  color: string
  type: "income" | "expense"
  userId: ObjectId
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Transaction {
  _id?: ObjectId
  userId: ObjectId
  amount: number
  categoryId: ObjectId
  description: string
  type: "income" | "expense"
  date: Date
  location?: string
  tags?: string[]
  createdAt: Date
  updatedAt: Date
}
