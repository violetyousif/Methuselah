// Mohammad Hoque, 7/3/2025, Added responsive placeholder text that dynamically adjusts based on screen size for better mobile UX
// Mohammad Hoque, 7/6/2025, Added timestamp functionality to user messages for better chat history tracking

import { KeyboardEventHandler, useRef, useState, useEffect } from 'react'
import { ClearOutlined, SendOutlined, FolderOpenOutlined } from '@ant-design/icons'
import { ChatRole, SendBarProps } from './interface'
import Show from './Show'

const SendBar = (props: SendBarProps) => {
  const { loading, disabled, onSend, onClear, onStop } = props
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [placeholder, setPlaceholder] = useState("Methuselah, I need your wellness wisdom regarding...")

  // Update placeholder based on screen size
  useEffect(() => {
    const updatePlaceholder = () => {
      const width = window.innerWidth
      if (width <= 400) {
        setPlaceholder("Ask Methuselah...")
      } else if (width <= 480) {
        setPlaceholder("Ask for wellness advice...")
      } else if (width <= 600) {
        setPlaceholder("Methuselah, I need advice...")
      } else if (width <= 768) {
        setPlaceholder("Methuselah, I need wellness advice...")
      } else {
        setPlaceholder("Methuselah, I need your wellness wisdom regarding...")
      }
    }

    updatePlaceholder()
    window.addEventListener('resize', updatePlaceholder)
    return () => window.removeEventListener('resize', updatePlaceholder)
  }, [])

  const onInputAutoSize = () => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
      inputRef.current.style.height = inputRef.current.scrollHeight + 'px'
    }
  }

  // const handleClear = () => {
  //   if (inputRef.current) {
  //     inputRef.current.value = ''
  //     inputRef.current.style.height = 'auto'
  //     onClear()
  //   }
  // }

  const handleSend = () => {
    const content = inputRef.current?.value
    if (content) {
      inputRef.current!.value = ''
      inputRef.current!.style.height = 'auto'
      onSend({
        content,
        role: ChatRole.User,
        timestamp: new Date().toISOString(),
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

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const acceptedTypes = [
    'application/pdf',
    'text/csv',
    'application/json',
    'text/plain',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'image/png',
    'image/jpeg'
  ];

  if (!acceptedTypes.includes(file.type)) {
    alert('Unsupported file type. Please upload a PDF, CSV, TXT, JSON, XLSX, PNG, or JPG file.');
    return;
  }

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('http://localhost:8080/api/uploadFile', {
      method: 'POST',
      body: formData,
      credentials: 'include', // needed for auth cookies!
    });

    const data = await response.json();
    if (response.ok) {
      alert(`File uploaded successfully: ${data.fileName}`);
      // Optionally: save uploaded file info in state for later use!
    } else {
      alert('Upload failed: ' + (data.error || 'unknown error'));
    }
  } catch (err: any) {
    alert('Upload failed: ' + err.message);
  }
};

  
  

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

      <div className="send-bar">
        {/* File upload Button */}

      {/* <div
        className="send-bar"
        style={{
          background: '#9AB7A9',
          borderRadius: 12,
          padding: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      > */}
        {/* <button className="button" title="Upload Health Data" disabled={disabled} onClick={handleFileUploadClick}>
          <FolderOpenOutlined className="chat-icon-black-outline" />
        </button> */}
        

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
          className="input sendbar-input-responsive"
          disabled={disabled}
          placeholder={placeholder}
          autoComplete="off"
          rows={1}
          onKeyDown={onKeydown}
          onInput={onInputAutoSize}
        />

        <button className="button" title="Send" disabled={disabled} onClick={handleSend}>
          <SendOutlined className="chat-icon-black-outline" />
        </button>

        {/* <button className="button" title="Clear" disabled={disabled} onClick={handleClear}>
          <ClearOutlined className="chat-icon-black-outline" />
        </button>*/}
      </div>
    </Show>
  )
}

export default SendBar
