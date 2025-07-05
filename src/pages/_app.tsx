// Mohammad Hoque, 6/2/2025, Applies global theme and font size preferences using <body> dataset attributes
// Updated: Removed localStorage dependency, theme preferences now loaded from database by individual pages

import Head from 'next/head'
import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import '../styles/globals.css'
import { useEffect, useState } from 'react'
import { Layout } from 'antd'
// import Dashboard from './dashboard'
// import Profile from './profile'


export default function App({ Component, pageProps }: AppProps) {
  // Set default theme on initial load - individual pages will override with database preferences
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Set defaults that will be overridden by database preferences
      document.body.dataset.fontsize = 'regular'
      document.body.dataset.theme = 'default'
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


