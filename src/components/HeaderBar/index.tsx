'use client' // Ensure this runs only on the client-side in Next.js

import React, { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { Layout, Space, Typography, Button, message } from 'antd'

import styles from './index.module.less'

const { Link } = Typography
const { Header } = Layout

const HeaderBar: React.FC = () => {
  const [address, setAddress] = useState<string>('')
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)

  useEffect(() => {
    checkWalletConnection()
  }, [])

  const checkWalletConnection = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const provider = new BrowserProvider(window.ethereum)
        const accounts = await provider.listAccounts()
        if (accounts.length > 0) {
          setAddress(accounts[0].address)
          setIsAuthenticated(true)
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error)
      }
    }
  }

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        message.error('No crypto wallet found. Please install Metamask!')
        return
      }

      const provider = new BrowserProvider(window.ethereum)
      const accounts = await provider.send('eth_requestAccounts', [])
      
      if (!accounts || accounts.length === 0) {
        message.error('No account found')
        return
      }

      const userAddress = accounts[0]
      setAddress(userAddress)

      // Request the nonce
      const nonceRes = await fetch(`/api/web3-auth?address=${userAddress}`)
      if (!nonceRes.ok) {
        message.error('Failed to get nonce from server')
        return
      }

      const { nonce } = await nonceRes.json()
      if (!nonce) {
        message.error('No nonce returned by server')
        return
      }

      const signer = await provider.getSigner()
      const signature = await signer.signMessage(nonce)

      // Verify signature
      const verifyRes = await fetch('/api/web3-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: userAddress, signature }),
      })

      if (verifyRes.ok) {
        setIsAuthenticated(true)
        message.success('Wallet connected and signature verified!')
      } else {
        const errData = await verifyRes.json()
        message.error(`Verification failed: ${errData.error || 'Unknown error'}`)
        setIsAuthenticated(false)
      }
    } catch (err) {
      console.error(err)
      message.error('Something went wrong with wallet connection')
      setIsAuthenticated(false)
    }
  }

  const disconnectWallet = () => {
    setAddress('')
    setIsAuthenticated(false)
    message.info('Wallet disconnected')
  }

  return (
    <>
      <Header className={styles.header}>
        <div className={styles.logoBar}>
          <Link href="/">
            <img alt="logo" src="/logo.jpg" />
            <h1>MethuSelah</h1>
          </Link>
        </div>

        <Space className={styles.right} size={0}>
          {isAuthenticated ? (
            <>
              <span className={styles.wallet}>
                Connected as {address.substring(0, 6)}...{address.substring(address.length - 4)}
              </span>
              <Button danger onClick={disconnectWallet}>
                Disconnect
              </Button>
            </>
          ) : (
            <Button type="primary" onClick={connectWallet}>
              Connect Wallet
            </Button>
          )}
        </Space>
      </Header>
      <div className={styles.vacancy} />
    </>
  )
}
  )
}

export default HeaderBar
