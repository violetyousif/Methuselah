// Mohammad Hoque, 6/2/2025, Applies global theme and font size preferences using <body> dataset attributes

import Head from 'next/head'
import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import '../styles/globals.css'
import { useEffect, useState } from 'react'
import { Layout } from 'antd'
// import Dashboard from './dashboard'
// import Profile from './profile'


export default function App({ Component, pageProps }: AppProps) {
  // On first render, apply saved theme and font size to <body> for global styling
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedFont = localStorage.getItem('fontSize') || 'regular'
      const storedTheme = localStorage.getItem('theme') || 'default'

      document.body.dataset.fontsize = storedFont
      document.body.dataset.theme = storedTheme
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


