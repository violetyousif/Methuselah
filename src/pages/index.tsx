// Mizanur Mizan, 6/2/25, Created the landing page to introduce users to Methuselah
// Violet Yousif, 6/2/25, Reformatted code to change landing page design functionality (leads to login and register pages)
// Violet Yousif, 6/16/25, Changed landing page connect to login and register pages instead of chatBot


import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import styles from '@/styles/Landing.module.css'

export default function Home() {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [fadeOut, setFadeOut] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Force light mode for landing page since user hasn't logged in yet
  useEffect(() => {
    document.body.dataset.theme = 'default';
  }, []);

  // const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   try {
  //     const userMessage = e.target.value
  //     if (userMessage.trim() === '') return

  //     // Save input message to local storage
  //     localStorage.setItem('initialMessage', userMessage)

  //     // Wait 2 seconds before starting fade animation
  //     setTimeout(() => {
  //         setFadeOut(true)

  //     // wait for fade animation to complete (0.6s), then route
  //     setTimeout(() => {
  //       router.push('/chatBot')
  //     }, 600)
  //     }, 2000)
  //   } catch (err) {
  //     setError('An unexpected error occurred. Please try again.')
  //   }
  // }

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('http://localhost:8080/api/checkAuth', {
          method: 'GET',
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          if (data.role === 'user') {
            router.push('/chatBot');
          } else if (data.role === 'admin') {
            router.push('/admin/adminUpload.tsx');
          }
        }
      } catch (err) {
        console.error("Auth check failed:", err);
      }
    };

    checkAuth();
  }, []);


  useEffect(() => {
    const handleKey = () => {
      try {
        inputRef.current?.focus()
      } catch {
        // Swallow focus errors silently
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  return (
    <div className={`${styles.landing} ${fadeOut ? styles.fadeOut : ''}`}>
      <div className={styles.overlay}>
        <h1 className={styles.title}>Hello, I am <span className={styles.name}>Methuselah</span></h1>
        <p className={styles.subtitle}>Your personalized AI health and wellness advisor.</p>
        <p className={styles.prompt}>Ask me for what you seek and I shall share my wisdom.</p>
        {/* <input
          ref={inputRef}
          onInput={handleInput}
          className={styles.input}
          placeholder="Ask Methuselah anything..."
        /> */}
        {error && <div style={{ color: 'red', marginBottom: 16 }}>{error}</div>}
        <div className={styles.navButtons}>
          <a href="/login" className={styles.navButton}>
            LOGIN
          </a>
          
          <a href="/register" className={styles.navButton}>
            REGISTER
          </a>
        </div>
      </div>

    </div>
  )

}