// Mohammad Hoque, 7/3/2025, Added essential viewport meta tag for proper mobile responsiveness
import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
