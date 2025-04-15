'use client' // Ensure this runs only on the client-side in Next.js

import React, { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { Layout, Space, Typography, Button, message } from 'antd'

import styles from './index.module.less'

const { Link } = Typography
const { Header } = Layout

const HeaderBar: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null)

  useEffect(() => {
    checkWalletConnection()
  }, [])

  const checkWalletConnection = async () => {
    if (typeof window !== 'undefined' && window.ethereum && window.ethereum.isTrust) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const accounts = await provider.listAccounts()
        if (accounts.length > 0) {
          setWalletAddress(accounts[0].address)
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error)
      }
    }
  }

  const connectWallet = async () => {
    if (!window.ethereum || !window.ethereum.isTrust) {
      message.error('Trust Wallet is not installed or not detected!')
      return
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const accounts = await provider.send('eth_requestAccounts', [])
      setWalletAddress(accounts[0])
      message.success('Trust Wallet connected successfully!')
    } catch (error) {
      console.error('Error connecting to Trust Wallet:', error)
      message.error('Failed to connect to Trust Wallet')
    }
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
          {walletAddress ? (
            <span className={styles.wallet}>
              {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </span>
          ) : (
            <Button type="primary" onClick={connectWallet}>
              Connect Trust Wallet
            </Button>
          )}
        </Space>
      </Header>
      <div className={styles.vacancy} />
    </>
  )
}

export default HeaderBar
