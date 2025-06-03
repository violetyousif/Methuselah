import Head from 'next/head'
import '@/styles/globals.css'
//import 'antd/dist/antd.css'
import type { AppProps } from 'next/app'
import '../styles/globals.css'

import { useEffect, useState } from 'react'
import { Layout } from 'antd'
// import Dashboard from './dashboard'
// import Profile from './profile'

export default function App({ Component, pageProps }: AppProps) {
  // const [profileVisible, setProfileVisible] = useState(false);
  // const [dashboardVisible, setDashboardVisible] = useState(false);
  // const [walletAddress, setWalletAddress] = useState<string>('');

  useEffect(() => {
    const storedFont = typeof window !== 'undefined' && localStorage.getItem('fontSize')
    if (storedFont) {
      document.body.dataset.fontsize = storedFont
    }
  }, [])

  return (
    <>
    <Head>
      <meta
        name="viewport"
        content="width=device-width,height=device-height,initial-scale=1.0,maximum-scale=1.0,user-scalable=no"
      />
    </Head>
    <Layout>
      <Component {...pageProps} />
      <footer>LongevityAI © 2025</footer>
    </Layout>
    </>
  )
}


