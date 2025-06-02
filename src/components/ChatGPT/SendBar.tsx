
import React, { KeyboardEventHandler, useRef } from 'react'
import { ClearOutlined, SendOutlined } from '@ant-design/icons'
import { ChatRole, SendBarProps } from './interface'
import Show from './Show'

const SendBar = (props: SendBarProps & { inputColor?: string }) => {
  const { loading, disabled, onSend, onClear, onStop, inputColor = '#9AB7A9' } = props
  const inputRef = useRef<HTMLTextAreaElement>(null)

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
    if (e.shiftKey) {
      return
    }

    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      handleSend()
    }
  }

  return (
    <Show
      fallback={
        <div className="thinking">
          <span>Please wait ...</span>
          <div className="stop" onClick={onStop}>
            Stop
          </div>
        </div>
      }
      loading={loading}
    >
      <div className="send-bar" style={{ background: inputColor, borderRadius: 12, padding: '12px', display: 'flex' }}>
        <textarea
          ref={inputRef}
          className="input"
          disabled={disabled}
          placeholder="Shift + Enter for new line"
          autoComplete="off"
          rows={1}
          style={{ flex: 1, border: 'none', borderRadius: 8, padding: '8px', color:'#000000' }}
          onKeyDown={onKeydown}
          onInput={onInputAutoSize}
        />
        <button className="button" title="Send" disabled={disabled} onClick={handleSend}>
          <SendOutlined />
        </button>
        <button className="button" title="Clear" disabled={disabled} onClick={handleClear}>
          <ClearOutlined />
        </button>
      </div>
    </Show>
  )
}

export default SendBar
