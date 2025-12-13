import { ObjectId } from 'mongodb'

export interface User {
  _id?: ObjectId
  email: string
  username: string
  password: string
  avatar?: string
  currency: string
  createdAt: Date
  updatedAt: Date
}

export interface Category {
  _id?: ObjectId
  name: string
  icon: string
  color: string
  type: 'expense' | 'income'
  userId: ObjectId
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Transaction {
  _id?: ObjectId
  amount: number
  description: string
  type: 'expense' | 'income'
  categoryId: ObjectId
  userId: ObjectId
  date: Date
  location?: string
  tags?: string[]
  createdAt: Date
  updatedAt: Date
}

export interface Budget {
  _id?: ObjectId
  name: string
  amount: number
  period: 'monthly' | 'weekly' | 'yearly'
  categoryIds: ObjectId[]
  userId: ObjectId
  startDate: Date
  endDate: Date
  createdAt: Date
  updatedAt: Date
}