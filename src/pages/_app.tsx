// Mohammad Hoque, 6/2/2025, Applies global theme and font size preferences using <body> dataset attributes
// Updated: Removed localStorage dependency, theme preferences now loaded from database by individual pages
// Violet Yousif, 6/2/2025, Added global footer with copyright notice
// Violet Yousif, 7/5/2025, Modified to move Mohammad's viewport meta tag for mobile responsiveness from _document.tsx to _app.tsx

import Head from 'next/head'
import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import '../styles/globals.css'
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
// import Dashboard from './dashboard'
// import Profile from './profile'

// Dynamically import Layout with no SSR to prevent useLayoutEffect warnings
const Layout = dynamic(() => import('antd').then(mod => ({ default: mod.Layout })), {
  ssr: false,
  loading: () => (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1 }}>Loading...</div>
      <footer>LongevityAI © 2025</footer>
    </div>
  )
})

export default function App({ Component, pageProps }: AppProps) {
  const [mounted, setMounted] = useState(false)

  // Set default theme on initial load - individual pages will override with database preferences
  useEffect(() => {
    setMounted(true)
    // Set defaults that will be overridden by database preferences
    if (typeof window !== 'undefined') {
      document.body.dataset.fontsize = 'regular'
      document.body.dataset.theme = 'default'
    }
  }, [])

  // Show a loading state during initial hydration
  if (!mounted) {
    return (
      <>
        <Head>
          <meta
            name="viewport"
            content="width=device-width, height=device-height, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes"
          />
        </Head>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1 }}>Loading...</div>
          <footer>LongevityAI © 2025</footer>
        </div>
      </>
    )
  }

  return (
    <>
    <Head>
      <meta
        name="viewport"
        content="width=device-width, height=device-height, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes"
      />
    </Head>
    <Layout>
      <Component {...pageProps} />
      <footer>LongevityAI © 2025</footer>
    </Layout>
    </>
  )
}
