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
  useTheme,
} from '@mui/material';
import { sendChatMessage } from '../backend/fetchUserData';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';

export default function Chatbot() {
  const theme = useTheme();
  const c = theme.custom;
  const isDarkMode = theme.palette.mode === "dark";
  const [open, setOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const panelBg = isDarkMode ? 'rgba(7, 21, 40, 0.94)' : 'rgba(255,255,255,0.85)';
  const headerBg = c.chatHeaderGradient;
  const bodyText = c.textPrimary;
  const mutedText = c.textMuted;
  const borderColor = isDarkMode ? 'rgba(143, 190, 245, 0.24)' : 'rgba(200,200,200,0.3)';
  const userBubbleBg = isDarkMode ? c.primaryMain : c.accent;
  const botBubbleBg = isDarkMode ? c.bgElevated : c.bgSurface;
  const inputBg = c.bgInput;
  const accentColor = c.accentStrong;

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
      const data = await sendChatMessage(text);
      setMessages(prev => [...prev, { sender: 'bot', text: data.output }]);
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
              background: isDarkMode ? 'rgba(35, 79, 138, 0.92)' : 'rgba(17,24,46,0.85)',
              color: '#fff',
              boxShadow: isDarkMode ? '0 10px 24px rgba(0, 0, 0, 0.38)' : 3,
              backdropFilter: 'blur(6px)',
              border: isDarkMode ? '1px solid rgba(143, 190, 245, 0.35)' : '1px solid transparent',
              '&:hover': { backgroundColor: isDarkMode ? '#2f66ad' : '#2d3c6b' },
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
            background: panelBg,
            backdropFilter: 'blur(12px)',
            border: `1px solid ${borderColor}`,
            boxShadow: isDarkMode ? '0 18px 48px rgba(0, 0, 0, 0.46)' : undefined,
          }}
        >
          {/* Header */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: headerBg,
              color: 'primary.contrastText',
              px: 2,
              py: 1.2,
              borderBottom: `1px solid ${borderColor}`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SupportAgentIcon sx={{ fontSize: 28, color: accentColor }} />
              <Typography variant="subtitle1" fontWeight="bold" sx={{ color: 'white' }}>
                MobiLLM Chat
              </Typography>
            </Box>
            <Box>
              <IconButton size="small" onClick={handleClearHistory} sx={{ color: 'white', '&:hover': { backgroundColor: 'rgba(255,255,255,0.12)' } }} title="Clear chat history">
                <DeleteOutlineIcon />
              </IconButton>
              <IconButton size="small" onClick={toggleOpen} sx={{ color: 'white', '&:hover': { backgroundColor: 'rgba(255,255,255,0.12)' } }}>
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
              bgcolor: isDarkMode ? 'rgba(0, 10, 25, 0.42)' : 'transparent',
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
                    bgcolor: msg.sender === 'user' ? userBubbleBg : botBubbleBg,
                    color: msg.sender === 'user' ? '#ffffff' : accentColor,
                    border: isDarkMode && msg.sender !== 'user' ? `1px solid ${borderColor}` : 'none',
                    width: 32,
                    height: 32,
                  }}
                >
                  {msg.sender === 'user'
                    ? <PersonIcon sx={{ color: 'white' }} />
                    : <SupportAgentIcon sx={{ color: msg.sender === 'user' ? 'white' : accentColor }} />}
                </Avatar>
                <Box
                  sx={{
                    bgcolor: msg.sender === 'user' ? userBubbleBg : botBubbleBg,
                    color: msg.sender === 'user' ? '#fff' : bodyText,
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    maxWidth: '75%',
                    whiteSpace: 'pre-line',
                    fontSize: 15,
                    boxShadow: isDarkMode ? '0 4px 12px rgba(0, 0, 0, 0.24)' : 1,
                    border: msg.sender === 'user'
                      ? `1px solid ${isDarkMode ? 'rgba(143, 190, 245, 0.28)' : '#11182E'}`
                      : `1px solid ${isDarkMode ? borderColor : '#e0e4ef'}`,
                  }}
                >
                  {msg.text}
                </Box>
              </Box>
            ))}
            {isBotTyping && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <Avatar sx={{ bgcolor: botBubbleBg, color: accentColor, border: isDarkMode ? `1px solid ${borderColor}` : 'none', width: 32, height: 32 }}>
                  <SupportAgentIcon sx={{ color: accentColor }} />
                </Avatar>
                <Box
                  sx={{
                    bgcolor: botBubbleBg,
                    color: bodyText,
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    fontSize: 15,
                    boxShadow: isDarkMode ? '0 4px 12px rgba(0, 0, 0, 0.24)' : 1,
                    border: isDarkMode ? `1px solid ${borderColor}` : 'none',
                  }}
                >
                  <CircularProgress size={18} sx={{ mr: 1, color: accentColor }} /> MobiLLM is thinking...
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
                borderTop: `1px solid ${borderColor}`,
                bgcolor: isDarkMode ? '#071528' : '#f3f6fa',
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
                bgcolor: inputBg,
                borderRadius: 2,
                '& .MuiOutlinedInput-root': {
                  pr: 0,
                  color: bodyText,
                },
                '& .MuiInputBase-input::placeholder': {
                  color: mutedText,
                  opacity: 1,
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: isDarkMode ? 'rgba(143, 190, 245, 0.35)' : '#11182E',
                },
                '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: isDarkMode ? '#8fbfff' : '#2d3c6b',
                },
                '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: isDarkMode ? '#8fbfff' : '#11182E',
                  borderWidth: 2,
                },
              }}
              autoFocus
            />
            <Button
              variant="contained"
              sx={{
                backgroundColor: isDarkMode ? '#234f8a' : '#11182E',
                color: '#fff',
                minWidth: 0,
                px: 2,
                borderRadius: 2,
                boxShadow: 1,
                '&:hover': {
                  backgroundColor: isDarkMode ? '#2f66ad' : '#2d3c6b',
                },
                '&.Mui-disabled': {
                  backgroundColor: isDarkMode ? 'rgba(143, 190, 245, 0.18)' : undefined,
                  color: isDarkMode ? 'rgba(219, 232, 247, 0.45)' : undefined,
                },
              }}
              endIcon={<SendIcon />}
              onClick={handleSend}
              disabled={!inputText.trim() || isBotTyping}
            >
              Send
            </Button>
          </Box>
        </Paper>
      </Fade>
    </Box>
  );
}
