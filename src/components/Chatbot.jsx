import React, { useState, useEffect } from 'react';
import './Chatbot.css';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  TextField,
  Button,
  Fade,
  Avatar,
  CircularProgress,
} from '@mui/material';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);

  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('mobillm_chat_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.length > 0
          ? parsed
          : [{ sender: 'bot', text: '👋 Hi! I\'m MobiLLM, your GenAI assistant. How can I help you today?' }];
      }
      return [{ sender: 'bot', text: '👋 Hi! I\'m MobiLLM, your GenAI assistant. How can I help you today?' }];
  });

  // Save messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('mobillm_chat_history', JSON.stringify(messages));
  }, [messages]);

  const handleClearHistory = () => {
    localStorage.removeItem('mobillm_chat_history');
    setMessages([{ sender: 'bot', text: '👋 Hi! I\'m MobiLLM, your GenAI assistant. How can I help you today?' }]);
  };

  const toggleOpen = () => {
    if (!open) {
      const saved = localStorage.getItem('mobillm_chat_history');
      if (saved) {
        setMessages(JSON.parse(saved));
      } else {
        setMessages([{ sender: 'bot', text: '👋 Hi! I\'m MobiLLM, your GenAI assistant. How can I help you today?' }]);
      }
    }
    setOpen(!open);
  };

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text) return;
    setMessages(prev => [...prev, { sender: 'user', text }]);
    setInputText('');
    setIsBotTyping(true);

    try {
      const res = await fetch("http://localhost:8080/mobillm/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Chat error');
      setMessages(prev => [...prev, { sender: 'bot', text: data.reply }]);
    } catch (e) {
      setMessages(prev => [...prev, { sender: 'bot', text: 'Error: could not get reply' }]);
    }
    setIsBotTyping(false);
  };


  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box sx={{ position: 'fixed', bottom: 32, right: 32, zIndex: 1300 }}>
      <Fade in={!open}>
        <Box>
          <IconButton
            color="primary"
            size="large"
            onClick={toggleOpen}
            sx={{
              background: 'rgba(255,255,255,0.7)',
              boxShadow: 3,
              backdropFilter: 'blur(6px)',
              '&:hover': { backgroundColor: 'grey.100' },
            }}
          >
            <ChatBubbleOutlineIcon fontSize="large" />
          </IconButton>
        </Box>
      </Fade>
      <Fade in={open}>
        <Paper
          elevation={8}
          sx={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: 400,
            height: 500,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 4,
            overflow: 'hidden',
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(200,200,200,0.3)',
          }}
        >
          {/* Header */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'linear-gradient(90deg, #1976d2 60%, #42a5f5 100%)',
              color: 'primary.contrastText',
              px: 2,
              py: 1.2,
              borderBottom: '1px solid #e3e3e3',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SmartToyIcon sx={{ fontSize: 28, color: 'white' }} />
              <Typography variant="subtitle1" fontWeight="bold" sx={{ color: 'white' }}>
                MobiLLM Chat
              </Typography>
            </Box>
            <Box>
              <IconButton size="small" onClick={handleClearHistory} sx={{ color: 'white' }} title="Clear chat history">
                <DeleteOutlineIcon />
              </IconButton>
              <IconButton size="small" onClick={toggleOpen} sx={{ color: 'white' }}>
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
          {/* Messages */}
          <Box
            sx={{
              flex: 1,
              p: 2,
              overflowY: 'auto',
              bgcolor: 'transparent',
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
            }}
          >
            {messages.map((msg, idx) => (
              <Box
                key={idx}
                sx={{
                  display: 'flex',
                  flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row',
                  alignItems: 'flex-end',
                  gap: 1,
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: msg.sender === 'user' ? 'primary.main' : 'grey.300',
                    width: 32,
                    height: 32,
                  }}
                >
                  {msg.sender === 'user' ? <PersonIcon /> : <SmartToyIcon color="primary" />}
                </Avatar>
                <Box
                  sx={{
                    bgcolor: msg.sender === 'user' ? 'primary.light' : 'grey.100',
                    color: 'text.primary',
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    maxWidth: '75%',
                    whiteSpace: 'pre-line',
                    fontSize: 15,
                    boxShadow: 1,
                  }}
                >
                  {msg.text}
                </Box>
              </Box>
            ))}
            {isBotTyping && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <Avatar sx={{ bgcolor: 'grey.300', width: 32, height: 32 }}>
                  <SmartToyIcon color="primary" />
                </Avatar>
                <Box
                  sx={{
                    bgcolor: 'grey.100',
                    color: 'text.primary',
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    fontSize: 15,
                    boxShadow: 1,
                  }}
                >
                  <CircularProgress size={18} sx={{ mr: 1 }} /> MobiLLM is thinking...
                </Box>
              </Box>
            )}
          </Box>
          {/* Input */}
          <Box
            component="form"
            onSubmit={e => { e.preventDefault(); handleSend(); }}
            sx={{
              display: 'flex',
              alignItems: 'center',
              p: 1.2,
              borderTop: '1px solid #eee',
              bgcolor: 'background.paper',
              gap: 1,
            }}
          >
            <TextField
              variant="outlined"
              size="small"
              placeholder="Type your message…"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              sx={{
                flex: 1,
                bgcolor: 'white',
                borderRadius: 2,
                '& .MuiOutlinedInput-root': { pr: 0 },
              }}
              autoFocus
            />
            <Button
              variant="contained"
              color="primary"
              endIcon={<SendIcon />}
              onClick={handleSend}
              disabled={!inputText.trim() || isBotTyping}
              sx={{ minWidth: 0, px: 2, borderRadius: 2, boxShadow: 1 }}
            >
              Send
            </Button>
          </Box>
        </Paper>
      </Fade>
    </Box>
  );
}