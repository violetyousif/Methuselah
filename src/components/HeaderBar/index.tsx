import React, { useState } from 'react'
import { Layout, Space, Typography, Button } from 'antd'
import { BrowserProvider } from 'ethers' // v6 import

import styles from './index.module.less'

const { Link } = Typography
const { Header } = Layout

const HeaderBar = () => {
  const [address, setAddress] = useState<string>('')
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert('No crypto wallet found. Please install Metamask!')
        return
      }

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      if (!accounts || accounts.length === 0) {
        alert('No account found')
        return
      }

      const userAddress = accounts[0]
      setAddress(userAddress)

      // Request the nonce
      const nonceRes = await fetch(`/api/web3-auth?address=${userAddress}`)
      if (!nonceRes.ok) {
        alert('Failed to get nonce from server')
        return
      }
      const { nonce } = await nonceRes.json()
      if (!nonce) {
        alert('No nonce returned by server')
        return
      }

      // In v6, use BrowserProvider
      const provider = new BrowserProvider(window.ethereum)
      // getSigner() is now async in v6
      const signer = await provider.getSigner()

      const signature = await signer.signMessage(nonce)

      // Verify
      const verifyRes = await fetch('/api/web3-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: userAddress, signature }),
      })

      if (verifyRes.ok) {
        setIsAuthenticated(true)
        alert('Wallet connected and signature verified!')
      } else {
        const errData = await verifyRes.json()
        alert(`Verification failed: ${errData.error || 'Unknown error'}`)
        setIsAuthenticated(false)
      }
    } catch (err) {
      console.error(err)
      alert('Something went wrong with wallet connection')
      setIsAuthenticated(false)
    }
  }

  const disconnectWallet = () => {
    setAddress('')
    setIsAuthenticated(false)
  }

  return (
    <Header className={styles.header}>
      <div className={styles.logoBar}>
        <Link href="/">
          <img alt="logo" src="/logo.jpg" />
          <h1>MethuSelah</h1>
        </Link>
      </div>

      <Space className={styles.right} size={0}>
        {!isAuthenticated ? (
          <Button type="primary" onClick={connectWallet}>
            Connect Wallet
          </Button>
        ) : (
          <>
            <span style={{ marginRight: '1rem' }}>
              Connected as {address.substring(0, 6)}...
              {address.substring(address.length - 4)}
            </span>
            <Button danger onClick={disconnectWallet}>
              Disconnect
            </Button>
          </>
        )}
      </Space>
    </Header>
  )
}

export default HeaderBar
