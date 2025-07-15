import React from 'react'
import { Layout } from 'antd'
import VersionBar from './VersionBar'

const { Footer } = Layout

const FooterBar = () => {
  const footerStyle: React.CSSProperties = {
    margin: 0,
    padding: '16px 0',
    backgroundColor: '#1e1e1e',
    color: '#9ca3af',
    textAlign: 'center'
  }

  const footerContentStyle: React.CSSProperties = {
    fontSize: '14px'
  }

  return (
    <Footer style={footerStyle}>
      <div style={footerContentStyle}>
        <p>LongevityAi &copy; {new Date().getFullYear()}</p>
        <VersionBar />
      </div>
    </Footer>
  )
}

export default FooterBar
