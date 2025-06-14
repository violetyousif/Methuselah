// userProfile.js
// Created: 6/13/2025 by Mohammad Hoque
// Purpose: Handle MongoDB interaction for user profiles 

import clientPromise from './mongodb'

export async function getUserProfile(walletAddress) {
  const client = await clientPromise
  const db = client.db()
  const user = await db.collection('Users').findOne({ walletAddress })
  return user
}

export async function upsertUserProfile(walletAddress, data) {
  const client = await clientPromise
  const db = client.db()
  const result = await db.collection('Users').updateOne(
    { walletAddress },
    { $set: { ...data } },
    { upsert: true }
  )
  return result
}
