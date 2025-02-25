import React from 'react'
import { Layout } from 'antd'
import VersionBar from './VersionBar'
import styles from './index.module.less'

const { Footer } = Layout

const FooterBar = () => {
  return (
    <Footer className={styles.footer}>
      <div className={styles.footerContent}>
        <p className={styles.footerText}>LongevityAi &copy; {new Date().getFullYear()}</p>
 
      </div>
    </Footer>
  )
}

export default FooterBar
