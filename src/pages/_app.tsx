import Head from 'next/head'
import '@/styles/globals.css'
//import 'antd/dist/antd.css'
import type { AppProps } from 'next/app'
import '../styles/globals.css'
import { useEffect, useState } from 'react'

export default function App({ Component, pageProps }: AppProps) {
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
      <Component {...pageProps} />
    </>
  )
}
