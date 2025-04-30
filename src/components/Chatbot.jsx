import React, { useState } from 'react';
import './Chatbot.css';
import { fetchChatSummary } from '../backend/fetchUserData';

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [summary, setSummary] = useState('');

  const toggleOpen = async () => {
    if (!open) {
      try {
        const data = await fetchChatSummary();
        setSummary(generateSummary(data));
      } catch (e) {
        setSummary('Fetch data failed');
      }
    }
    setOpen(!open);
  };

  const generateSummary = (data) => {
    const bsCount = data.base_station_count;
    const ueCount = data.ue_count;
    return `Base stations: ${bsCount}\nUEs: ${ueCount}`;
  };

  return (
    <div className="chatbot-container">
      <button className="chatbot-toggle" onClick={toggleOpen}>
        {open ? '×' : '💬'}
      </button>
      {open && (
        <div className="chatbot-window">
          <div className="chatbot-header">Network Status Summary</div>
          <div className="chatbot-body">
            {summary.split('\n').map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
