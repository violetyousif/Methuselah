import React, { KeyboardEventHandler, useRef } from 'react'
import { ClearOutlined, SendOutlined, FolderOpenOutlined } from '@ant-design/icons'
import { ChatRole, SendBarProps } from './interface'
import Show from './Show'

const SendBar = (props: SendBarProps) => {
  const { loading, disabled, onSend, onClear, onStop } = props
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const onInputAutoSize = () => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
      inputRef.current.style.height = inputRef.current.scrollHeight + 'px'
    }
  }

  const handleClear = () => {
    if (inputRef.current) {
      inputRef.current.value = ''
      inputRef.current.style.height = 'auto'
      onClear()
    }
  }

  const handleSend = () => {
    const content = inputRef.current?.value
    if (content) {
      inputRef.current!.value = ''
      inputRef.current!.style.height = 'auto'
      onSend({
        content,
        role: ChatRole.User,
      })
    }
  }

  const onKeydown: KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.shiftKey) return
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) handleSend()
  }

  const handleFileUploadClick = () => {
    if (fileInputRef.current) fileInputRef.current.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const acceptedTypes = [
      'application/pdf',
      'text/csv',
      'application/json',
      'text/plain',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'image/png',
      'image/jpeg'
    ]

    if (!acceptedTypes.includes(file.type)) {
      alert('Unsupported file type. Please upload a PDF, CSV, TXT, JSON or XLSX file, OR Image (PNG, JPG, JPEG) file.')
      return
    }

    console.log('Uploaded file:', file)
    // TODO: Upload logic
  }
  

  return (
    <Show
      fallback={
        <div className="thinking">
          <span>Please wait ...</span>
          <div className="stop" onClick={onStop}>Stop</div>
        </div>
      }
      loading={loading}
    >
      <div
        className="send-bar"
        style={{
          background: '#9AB7A9',
          borderRadius: 12,
          padding: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        {/* File upload Button */}
        <button className="button" title="Upload Health Data" disabled={disabled} onClick={handleFileUploadClick}>
          <FolderOpenOutlined className="chat-icon-black-outline" />
        </button>

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
          accept=".pdf,.csv,.txt,.xlsx"
        />

        {/* Text Input */}
        <textarea
          ref={inputRef}
          className="input"
          disabled={disabled}
          placeholder="Methuselah, I need your wellness wisdom regarding..."
          autoComplete="off"
          rows={1}
          style={{
            flex: 1,
            border: 'none',
            borderRadius: 8,
            padding: '8px',
            backgroundColor: '#F1F1EA',
            color: '#1E1E1E'
          }}
          onKeyDown={onKeydown}
          onInput={onInputAutoSize}
        />

        <button className="button" title="Send" disabled={disabled} onClick={handleSend}>
          <SendOutlined className="chat-icon-black-outline" />
        </button>

        <button className="button" title="Clear" disabled={disabled} onClick={handleClear}>
          <ClearOutlined className="chat-icon-black-outline" />
        </button>
      </div>
    </Show>
  )
}

export default SendBar
