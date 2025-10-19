import React, { useState, useRef, useEffect } from 'react';
import { Send, Plus, Trash2, Menu, X, Copy, Check, Settings, Star, Download } from 'lucide-react';

const AIChat = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi! I'm your AI assistant. How can I help you today?", sender: 'bot', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState([
    { id: 1, title: 'Welcome Chat', messages: [{ id: 1, text: "Hi! I'm your AI assistant. How can I help you today?", sender: 'bot', timestamp: new Date() }], starred: false }
  ]);
  const [activeConversation, setActiveConversation] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [copiedId, setCopiedId] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const [showApiModal, setShowApiModal] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [tempApiKey, setTempApiKey] = useState('');
  const [useLocalMode, setUseLocalMode] = useState(true);
  const [starredOnly, setStarredOnly] = useState(false);
  const [showPresets, setShowPresets] = useState(true);
  const [messageCount, setMessageCount] = useState(1);
  const [likedMessages, setLikedMessages] = useState(new Set());
  const messagesEndRef = useRef(null);

  const presetPrompts = [
    { icon: '💻', text: 'Explain React Hooks', category: 'Code' },
    { icon: '✍️', text: 'Write a professional email', category: 'Writing' },
    { icon: '🎓', text: 'Teach me JavaScript closures', category: 'Learning' },
    { icon: '🐛', text: 'Help debug my code', category: 'Code' },
    { icon: '💡', text: 'Give me a creative idea', category: 'Creative' },
    { icon: '📊', text: 'Explain data structures', category: 'Learning' },
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const generateLocalResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();
    
    const responses = [
      { keywords: ['hello', 'hi', 'hey'], response: "Hello! 👋 How can I help you today?" },
      { keywords: ['how are you'], response: "I'm great! 😊 Ready to help. What's on your mind?" },
      { keywords: ['react', 'hooks', 'javascript'], response: "React Hooks are functions that let you use state in functional components. useState, useEffect, and useContext are the most common ones. Want me to explain any specific hook?" },
      { keywords: ['what is ai'], response: "AI refers to computer systems that can learn and make decisions. It's used in everything from chatbots to image recognition! Pretty cool, right? 🤖" },
      { keywords: ['joke', 'funny'], response: "Why did the developer go broke? Because he used up all his cache! 😄" },
      { keywords: ['closures'], response: "Closures are functions that have access to variables from their outer scope. They're created every time a function is created and are very powerful!" },
      { keywords: ['thank'], response: "You're welcome! Happy to help anytime! 😊" },
    ];

    for (const resp of responses) {
      if (resp.keywords.some(keyword => lowerMessage.includes(keyword))) {
        return resp.response;
      }
    }

    return "That's an interesting question! 🤔 I'm here to help with coding, writing, and problem-solving. Can you tell me more?";
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { id: Date.now(), text: input, sender: 'user', timestamp: new Date() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      let botResponseText = '';

      if (useLocalMode) {
        await new Promise(resolve => setTimeout(resolve, 800));
        botResponseText = generateLocalResponse(input);
      } else if (apiKey) {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: newMessages.map(m => ({
              role: m.sender === 'user' ? 'user' : 'assistant',
              content: m.text
            })),
            max_tokens: 500,
            temperature: 0.7
          })
        });

        if (!response.ok) throw new Error('API Error');
        const data = await response.json();
        botResponseText = data.choices[0].message.content;
      } else {
        botResponseText = generateLocalResponse(input);
      }

      const botMessage = { id: Date.now() + 1, text: botResponseText, sender: 'bot', timestamp: new Date() };
      setMessages(prev => [...prev, botMessage]);
      setMessageCount(prev => prev + 1);
    } catch (error) {
      const errorMessage = { id: Date.now() + 1, text: 'Error occurred. Using local responses.', sender: 'bot', timestamp: new Date() };
      setMessages(prev => [...prev, errorMessage]);
      setUseLocalMode(true);
    } finally {
      setLoading(false);
    }
  };

  const toggleLikeMessage = (id) => {
    const newLiked = new Set(likedMessages);
    if (newLiked.has(id)) {
      newLiked.delete(id);
    } else {
      newLiked.add(id);
    }
    setLikedMessages(newLiked);
  };

  const toggleStarConversation = (id, e) => {
    e.stopPropagation();
    const updated = conversations.map(conv => conv.id === id ? { ...conv, starred: !conv.starred } : conv);
    setConversations(updated);
  };

  const downloadConversation = () => {
    const conv = conversations.find(c => c.id === activeConversation);
    const text = conv.messages.map(m => `${m.sender.toUpperCase()}: ${m.text}`).join('\n\n');
    const element = document.createElement('a');
    element.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(text);
    element.download = `chat-${new Date().getTime()}.txt`;
    element.click();
  };

  const handleNewChat = () => {
    const newId = Math.max(...conversations.map(c => c.id), 0) + 1;
    const newConversation = {
      id: newId,
      title: `Chat ${new Date().toLocaleDateString()}`,
      messages: [{ id: 1, text: "Hi! How can I help you today?", sender: 'bot', timestamp: new Date() }],
      starred: false
    };
    setConversations([newConversation, ...conversations]);
    setActiveConversation(newId);
    setMessages(newConversation.messages);
    setMessageCount(1);
  };

  const handleSelectConversation = (id) => {
    const conv = conversations.find(c => c.id === id);
    setActiveConversation(id);
    setMessages(conv.messages);
    setMessageCount(conv.messages.length);
  };

  const handleDeleteConversation = (id, e) => {
    e.stopPropagation();
    const filtered = conversations.filter(c => c.id !== id);
    setConversations(filtered);
    if (activeConversation === id && filtered.length > 0) {
      handleSelectConversation(filtered[0].id);
    }
  };

  const handleCopyMessage = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveApiKey = () => {
    setApiKey(tempApiKey);
    setUseLocalMode(false);
    setShowApiModal(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const displayConversations = starredOnly ? conversations.filter(c => c.starred) : conversations;

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: darkMode ? '#0f172a' : '#f8fafc', color: darkMode ? '#fff' : '#000', fontFamily: 'system-ui' }}>
      <div style={{ width: sidebarOpen ? '280px' : '0', backgroundColor: darkMode ? '#1e293b' : '#f1f5f9', borderRight: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`, display: 'flex', flexDirection: 'column', transition: 'width 0.3s ease', overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem 1rem', borderBottom: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}` }}>
          <button onClick={handleNewChat} style={{ width: '100%', padding: '0.75rem 1rem', backgroundColor: darkMode ? '#2563eb' : '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '14px', fontWeight: '600' }}>
            <Plus size={18} /> New Chat
          </button>
        </div>

        <div style={{ padding: '0.75rem 1rem', display: 'flex', gap: '0.5rem', borderBottom: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}` }}>
          <button onClick={() => setStarredOnly(!starredOnly)} style={{ flex: 1, padding: '0.5rem', backgroundColor: starredOnly ? '#f59e0b' : (darkMode ? '#334155' : '#f1f5f9'), color: starredOnly ? 'white' : (darkMode ? '#fff' : '#000'), border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', fontWeight: '600' }}>
            <Star size={16} /> {starredOnly ? 'All' : 'Star'}
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 0.5rem' }}>
          {displayConversations.map(conv => (
            <div key={conv.id} onClick={() => handleSelectConversation(conv.id)} style={{ padding: '0.75rem 1rem', margin: '0.5rem 0', backgroundColor: activeConversation === conv.id ? (darkMode ? '#334155' : '#e2e8f0') : 'transparent', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px' }}>
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>{conv.starred ? '⭐ ' : ''}{conv.title}</span>
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                <button onClick={(e) => toggleStarConversation(conv.id, e)} style={{ backgroundColor: 'transparent', border: 'none', color: conv.starred ? '#f59e0b' : (darkMode ? '#94a3b8' : '#64748b'), cursor: 'pointer', padding: '0.25rem', fontSize: '14px' }}>
                  ★
                </button>
                <button onClick={(e) => { e.stopPropagation(); handleDeleteConversation(conv.id, e); }} style={{ backgroundColor: 'transparent', border: 'none', color: darkMode ? '#94a3b8' : '#64748b', cursor: 'pointer', padding: '0.25rem' }}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div style={{ padding: '1rem', borderTop: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button onClick={() => setShowApiModal(true)} style={{ width: '100%', padding: '0.75rem 1rem', backgroundColor: darkMode ? '#334155' : '#f1f5f9', color: darkMode ? '#fff' : '#000', border: `1px solid ${darkMode ? '#475569' : '#e2e8f0'}`, borderRadius: '8px', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '500' }}>
            <Settings size={16} /> API
          </button>
          <button onClick={() => setDarkMode(!darkMode)} style={{ width: '100%', padding: '0.75rem 1rem', backgroundColor: darkMode ? '#334155' : '#f1f5f9', color: darkMode ? '#fff' : '#000', border: `1px solid ${darkMode ? '#475569' : '#e2e8f0'}`, borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
            {darkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1.5rem 2rem', borderBottom: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ backgroundColor: 'transparent', border: 'none', color: darkMode ? '#fff' : '#000', cursor: 'pointer', padding: '0.5rem' }}>
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>🤖 Helper AI</h1>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button onClick={downloadConversation} style={{ padding: '0.5rem 1rem', backgroundColor: darkMode ? '#334155' : '#f1f5f9', color: darkMode ? '#fff' : '#000', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Download size={16} /> Export
            </button>
            <div style={{ fontSize: '12px', color: darkMode ? '#94a3b8' : '#64748b' }}>
              {messageCount} msgs
            </div>
          </div>
        </div>

        {showPresets && messages.length <= 1 && (
          <div style={{ padding: '2rem', backgroundColor: darkMode ? '#1e293b' : '#f1f5f9', borderBottom: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>💡 Quick Prompts</h3>
              <button onClick={() => setShowPresets(false)} style={{ backgroundColor: 'transparent', border: 'none', color: darkMode ? '#94a3b8' : '#64748b', cursor: 'pointer', fontSize: '12px' }}>
                Hide
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
              {presetPrompts.map((prompt, idx) => (
                <button key={idx} onClick={() => { setInput(prompt.text); setShowPresets(false); }} style={{ padding: '1rem', backgroundColor: darkMode ? '#334155' : '#fff', color: darkMode ? '#fff' : '#000', border: `1px solid ${darkMode ? '#475569' : '#cbd5e1'}`, borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '500', textAlign: 'center', transition: 'all 0.2s' }}>
                  <div style={{ fontSize: '20px', marginBottom: '0.5rem' }}>{prompt.icon}</div>
                  {prompt.text}
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {messages.map((msg) => (
            <div key={msg.id} style={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{ display: 'flex', gap: '0.75rem', maxWidth: '70%', alignItems: 'flex-end' }}>
                {msg.sender === 'bot' && (
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>
                    🤖
                  </div>
                )}
                <div style={{ padding: '1rem 1.25rem', borderRadius: '12px', backgroundColor: msg.sender === 'user' ? '#2563eb' : (darkMode ? '#334155' : '#e2e8f0'), color: msg.sender === 'user' ? 'white' : (darkMode ? '#fff' : '#000'), wordWrap: 'break-word' }}>
                  <p style={{ margin: 0, lineHeight: '1.5' }}>{msg.text}</p>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', fontSize: '12px', opacity: 0.7, alignItems: 'center' }}>
                    <span>{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {msg.sender === 'bot' && (
                      <>
                        <button onClick={() => handleCopyMessage(msg.id, msg.text)} style={{ backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0 }}>
                          {copiedId === msg.id ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                        <button onClick={() => toggleLikeMessage(msg.id)} style={{ backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: likedMessages.has(msg.id) ? '#ef4444' : 'inherit', padding: 0, fontSize: '14px' }}>
                          {likedMessages.has(msg.id) ? '❤️' : '🤍'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', color: darkMode ? '#94a3b8' : '#64748b' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>🤖</div>
              <span>Thinking...</span>
              {[0, 1, 2].map(i => <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2563eb', animation: 'pulse 1.4s infinite', animationDelay: `${i * 0.2}s` }} />)}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div style={{ padding: '1.5rem 2rem', borderTop: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}` }}>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={handleKeyPress} placeholder="Type your message..." style={{ flex: 1, padding: '0.875rem 1.25rem', borderRadius: '12px', border: `1px solid ${darkMode ? '#475569' : '#cbd5e1'}`, backgroundColor: darkMode ? '#1e293b' : '#fff', color: darkMode ? '#fff' : '#000', fontSize: '14px', outline: 'none' }} />
            <button onClick={handleSendMessage} disabled={loading || !input.trim()} style={{ padding: '0.875rem 1.5rem', backgroundColor: loading || !input.trim() ? '#64748b' : '#2563eb', color: 'white', border: 'none', borderRadius: '12px', cursor: loading || !input.trim() ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600' }}>
              <Send size={18} /> Send
            </button>
          </div>
        </div>
      </div>

      {showApiModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: darkMode ? '#1e293b' : '#fff', borderRadius: '12px', padding: '2rem', maxWidth: '400px', width: '90%', boxShadow: '0 20px 25px rgba(0, 0, 0, 0.15)' }}>
            <h2 style={{ marginTop: 0, marginBottom: '1rem' }}>API Settings</h2>
            <p style={{ fontSize: '14px', color: darkMode ? '#94a3b8' : '#64748b', marginBottom: '1rem' }}>
              Get OpenAI key at <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb' }}>openai.com</a>
            </p>
            <input type="password" placeholder="sk-..." value={tempApiKey} onChange={(e) => setTempApiKey(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: `1px solid ${darkMode ? '#475569' : '#cbd5e1'}`, backgroundColor: darkMode ? '#0f172a' : '#f8fafc', color: darkMode ? '#fff' : '#000', marginBottom: '1rem', fontSize: '14px', boxSizing: 'border-box' }} />
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => setShowApiModal(false)} style={{ flex: 1, padding: '0.75rem 1rem', backgroundColor: darkMode ? '#334155' : '#f1f5f9', color: darkMode ? '#fff' : '#000', border: `1px solid ${darkMode ? '#475569' : '#e2e8f0'}`, borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                Cancel
              </button>
              <button onClick={handleSaveApiKey} style={{ flex: 1, padding: '0.75rem 1rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 60%, 100% { opacity: 0.3; }
          30% { opacity: 1; }
        }
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: ${darkMode ? '#0f172a' : '#f8fafc'};
        }
        ::-webkit-scrollbar-thumb {
          background: ${darkMode ? '#475569' : '#cbd5e1'};
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
};

export default AIChat;