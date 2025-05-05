import React, { useState } from 'react';
import './Chatbot.css';
import { fetchChatSummary } from '../backend/fetchUserData';

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');

  /**
   * Toggle chat window open/closed.
   * When opening, send initial prompt from bot.
   */
  const toggleOpen = () => {
    if (!open) {
      // Initial bot greeting when chat opens
      setMessages([{ sender: 'bot', text: 'How can I help you?' }]);
    }
    setOpen(!open);
  };

  /**
   * Handle user sending a message.
   * Add user msg, then bot replies with static summary.
   */
  const handleSend = async () => {
    const text = inputText.trim();
    if (!text) return;

    // Add user message
    setMessages(prev => [...prev, { sender: 'user', text }]);
    setInputText('');

    // Bot replies with static summary
    try {
      const data = await fetchChatSummary();
      const summaryText = formatSummary(data);
      setMessages(prev => [...prev, { sender: 'bot', text: summaryText }]);
    } catch (e) {
      setMessages(prev => [...prev, { sender: 'bot', text: 'Fetch data failed' }]);
    }
  };

  /** Send on Enter key press */
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  /** Format summary data into lines */
  const formatSummary = (data) => {
    return `Base stations: ${data.base_station_count}\nUEs: ${data.ue_count}`;
  };

  return (
    <div className="chatbot-container">
      <button className="chatbot-toggle" onClick={toggleOpen}>
        {open ? '×' : '💬'}
      </button>

      {open && (
        <div className="chatbot-window">
          <div className="chatbot-header">MobiLLM Chat</div>
          <div className="chatbot-body">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={
                  msg.sender === 'user'
                    ? 'chatbot-message user'
                    : 'chatbot-message bot'
                }
              >
                {msg.text.split('\n').map((line, i) => (
                  <div key={i}>{line}</div>
                ))}
              </div>
            ))}
          </div>
          <div className="chatbot-input-container">
            <input
              className="chatbot-input"
              type="text"
              placeholder="Type a message..."
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              className="chatbot-send-button"
              onClick={handleSend}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
