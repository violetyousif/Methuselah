import { NextApiRequest, NextApiResponse } from 'next'
import { ethers } from 'ethers'

/**
 * In-memory store of nonces for each address.
 * A real production app would store this in a database or cache.
 */
const nonceStore: Record<string, string> = {}

/** Generate a random nonce string */
function generateNonce() {
  return Math.floor(Math.random() * 1000000).toString() // e.g., '389021'
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, query, body } = req

  if (method === 'GET') {
    // Expecting /api/web3-auth?address=0x123...
    const address = typeof query.address === 'string' ? query.address : ''
    if (!address) {
      return res.status(400).json({ error: 'Missing address parameter' })
    }

    const nonce = generateNonce()
    nonceStore[address.toLowerCase()] = nonce

    return res.status(200).json({ nonce })
  }

  else if (method === 'POST') {
    // Expecting a JSON body: { address: string, signature: string }
    const { address, signature } = body

    if (!address || !signature) {
      return res.status(400).json({ error: 'Missing address or signature' })
    }

    const storedNonce = nonceStore[address.toLowerCase()]
    if (!storedNonce) {
      return res.status(400).json({ error: 'No nonce for this address' })
    }

    // Recover the signer address from the signature
    let recoveredAddr
    try {
      recoveredAddr = ethers.utils.verifyMessage(storedNonce, signature)
    } catch (err) {
      return res.status(400).json({ error: 'Signature verification failed' })
    }

    if (recoveredAddr.toLowerCase() === address.toLowerCase()) {
      // Clear the nonce to prevent re-use
      delete nonceStore[address.toLowerCase()]

      // In a real app, you might create a JWT or session here
      // For now, we’ll just return success
      return res.status(200).json({ success: true })
    } else {
      return res.status(401).json({ error: 'Signature does not match address' })
    }
  }

  else {
    return res.status(405).json({ error: 'Method not allowed' })
  }
}
