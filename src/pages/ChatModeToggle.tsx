//Syed Rabbey, 6/26/2025, Created toggle component for chat modes (direct and conversational).
import * as React from 'react';

interface ChatModeToggleProps {
  mode: 'direct' | 'conversational';
  onChange: (mode: 'direct' | 'conversational') => void;
}

const ChatModeToggle: React.FC<ChatModeToggleProps> = ({ mode, onChange }) => {
  const handleClick = (selectedMode: 'direct' | 'conversational') => {
    if (mode !== selectedMode) {
      onChange(selectedMode);
    }
  };

  return (
    <div className="chat-mode-toggle">
      <div className={`toggle-container ${mode}`}>
        <button
          className={`toggle-option ${mode === 'direct' ? 'active' : ''}`}
          onClick={() => handleClick('direct')}
        >
          Direct
        </button>
        <button
          className={`toggle-option ${mode === 'conversational' ? 'active' : ''}`}
          onClick={() => handleClick('conversational')}
        >
          Conversational
        </button>
      </div>
      <style jsx>{`
        .chat-mode-toggle {
          display: inline-block;
          margin-left: 12px;
        }

        .toggle-container {
          display: flex;
          border: 2px solid #9AB7A9;
          border-radius: 9999px;
          overflow: hidden;
          background-color: #ffffff;
          height: 36px;
        }

        .toggle-option {
          flex: 1;
          padding: 6px 12px;
          border: none;
          background: none;
          color: #318182;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s, color 0.2s;
          font-size: 14px;
        }

        .toggle-option.active {
          background-color: #9AB7A9;
          color: white;
        }

        .toggle-option:hover {
          background-color: #d0e2d8;
        }
      `}</style>
    </div>
  );
};

export default ChatModeToggle;
