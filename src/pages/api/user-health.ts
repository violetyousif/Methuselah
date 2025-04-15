// src/pages/api/user-data.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { UserData } from '../../models'

// In-memory storage
const userDataStore: Record<string, UserData> = {}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { walletAddress } = req.method === 'GET' ? req.query : req.body

  if (!walletAddress || typeof walletAddress !== 'string') {
    return res.status(400).json({ message: 'Wallet address is required' })
  }

  if (req.method === 'GET') {
    const data = userDataStore[walletAddress] || null
    return res.status(200).json(data)
  }

  if (req.method === 'POST') {
    const { name, email, age, weight, height, activityLevel, sleepHours } = req.body as UserData
    if (!age || !weight || !height || !activityLevel || !sleepHours) {
      return res.status(400).json({ message: 'All health fields are required' })
    }

    userDataStore[walletAddress] = {
      name: name || userDataStore[walletAddress]?.name, // Preserve existing if not provided
      email: email || userDataStore[walletAddress]?.email,
      age,
      weight,
      height,
      activityLevel,
      sleepHours
    }
    return res.status(200).json({ message: 'User data saved' })
  }

  return res.status(405).json({ message: 'Method not allowed' })
}
