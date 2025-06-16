// Mizanur Mizan, 6/2/25, Created the landing page to introduce users to Methuselah

// pages/index.tsx

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import styles from '@/styles/landing.module.css'

export default function Home() {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [fadeOut, setFadeOut] = useState(false)

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const userMessage = e.target.value
    if (userMessage.trim() === '') return

    // Save input message to local storage
    localStorage.setItem('initialMessage', userMessage)

    // Wait 2 seconds before starting fade animation
    setTimeout(() => {
        setFadeOut(true)

    // wait for fade animation to complete (0.6s), then route
    setTimeout(() => {
      router.push('/chatBot')
    }, 600)
    }, 2000)
    }

  useEffect(() => {
    const handleKey = () => {
      inputRef.current?.focus()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  return (
    <div className={`${styles.landing} ${fadeOut ? styles.fadeOut : ''}`}>
      <div className={styles.overlay}>
        <h1 className={styles.title}>Hello, I am <span className={styles.name}>Methuselah</span></h1>
        <p className={styles.subtitle}>Your personalized AI health and wellness advisor.</p>
        <p className={styles.prompt}>Ask me what you shall seek and I will share my wisdom.</p>
        <input
          ref={inputRef}
          onInput={handleInput}
          className={styles.input}
          placeholder="Ask Methuselah anything..."
        />
          <a href="/chatBot">
            Enter Home Screen
            </a>
      </div>


    </div>
  )


}