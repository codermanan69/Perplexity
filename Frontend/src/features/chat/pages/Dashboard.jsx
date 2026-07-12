import React, { useEffect, useState, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import { useSelector, useDispatch } from 'react-redux'
import { useChat } from '../hooks/useChat'
import remarkGfm from 'remark-gfm'
import { setUser } from '../../auth/auth.slice'
import { setCurrentChatId } from '../chat.slice'
import { 
  Menu, X, Plus, Search, Trash2, Settings, LogOut, Compass, Send, Paperclip, 
  Sparkles, Sun, Moon, ArrowUp, MessageSquare, Loader2
} from 'lucide-react'
import axios from 'axios'

// Custom Code Block component with Copy button
const CodeBlock = ({ className, children }) => {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const lang = match ? match[1] : 'code';
  const codeContent = String(children).replace(/\n$/, '');

  const handleCopy = () => {
    navigator.clipboard.writeText(codeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-4 border border-border-app rounded-xl overflow-hidden bg-muted-app shadow-sm max-w-full">
      <div className="flex justify-between items-center bg-sidebar-bg border-b border-border-app px-4 py-2.5 text-xs font-mono text-muted-text">
        <span>{lang.toUpperCase()}</span>
        <button
          onClick={handleCopy}
          type="button"
          className="hover:text-text-app transition-colors duration-150 flex items-center gap-1 cursor-pointer font-medium"
        >
          {copied ? 'Copied!' : 'Copy code'}
        </button>
      </div>
      <div className="p-4 overflow-x-auto text-sm font-mono text-text-app bg-muted/30">
        <code>{codeContent}</code>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const chat = useChat()
  const dispatch = useDispatch()
  
  const [chatInput, setChatInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'))
  
  const chats = useSelector((state) => state.chat.chats)
  const currentChatId = useSelector((state) => state.chat.currentChatId)
  const isLoading = useSelector((state) => state.chat.isLoading)
  const user = useSelector((state) => state.auth.user)
  
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    chat.initializeSocketConnection()
    chat.handleGetChats()
    
    // Adjust sidebar based on initial window size
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false)
    }
  }, [])

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chats, currentChatId, isLoading])

  // Auto-grow textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(200, textareaRef.current.scrollHeight)}px`
    }
  }, [chatInput])

  const toggleTheme = () => {
    const nextDark = !isDarkMode;
    setIsDarkMode(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }

  const handleSubmitMessage = (event) => {
    if (event) event.preventDefault()

    const trimmedMessage = chatInput.trim()
    if (!trimmedMessage || isLoading) {
      return
    }

    chat.handleSendMessage({ message: trimmedMessage, chatId: currentChatId })
    setChatInput('')
  }

  // Handle Ctrl+Enter submission
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitMessage();
    }
  };

  const openChat = (chatId) => {
    chat.handleOpenChat(chatId, chats)
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false)
    }
  }

  const handleNewChat = () => {
    dispatch(setCurrentChatId(null))
    setChatInput('')
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false)
    }
  }

  const handleDelete = async (e, chatId) => {
    e.stopPropagation()
    if (confirm("Are you sure you want to delete this thread?")) {
      await chat.handleDeleteChat(chatId, chats)
    }
  }

  const handleLogout = async () => {
  try {
    await axios.post(
      "http://localhost:3000/api/auth/logout",
      {},
      { withCredentials: true }
    );
  } catch (err) {
    console.error("Backend logout failed:", err);
  }
  dispatch(setUser(null));
};

  const filteredChats = Object.values(chats)
    .filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated))

  const suggestions = [
    { title: "Debug React logic", desc: "Fix a tricky rendering issue with useEffect hook dependencies" },
    { title: "Draft a follow-up email", desc: "Write a polite follow-up note after an engineering interview" },
    { title: "Compare databases", desc: "Explain core performance differences between SQL and MongoDB" },
    { title: "Build a premium UI layout", desc: "Create a Tailwind design block featuring interactive items" }
  ];

  const handleSuggestionClick = (desc) => {
    setChatInput(desc)
    textareaRef.current?.focus()
  }

  return (
    <main className='min-h-screen w-full bg-bg-app text-text-app flex relative font-sans transition-colors duration-200 overflow-hidden'>
      
      {/* Sidebar Backdrop overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-30 md:hidden"
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`fixed md:static inset-y-0 left-0 z-40 w-72 shrink-0 bg-sidebar-bg border-r border-sidebar-border p-4 flex flex-col justify-between transform transition-transform duration-300 md:transform-none ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-0 hidden md:hidden'
      }`}>
        
        <div className="flex flex-col min-h-0 flex-1">
          {/* Sidebar Header Logo */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-md shadow-primary/10">
                <Compass className="w-4.5 h-4.5 text-slate-950" />
              </div>
              <span className="text-lg font-bold tracking-tight">Perplexity</span>
            </div>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="p-1.5 rounded-lg hover:bg-sidebar-hover text-muted-text md:hidden cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* New Chat Button */}
          <button
            onClick={handleNewChat}
            type="button"
            className="w-full flex items-center justify-between border border-sidebar-border bg-sidebar-active hover:bg-sidebar-hover text-text-app font-semibold px-4 py-3 rounded-xl transition duration-150 shadow-xs mb-4 cursor-pointer text-sm"
          >
            <span>New Chat</span>
            <Plus className="w-4 h-4 text-muted-text" />
          </button>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-text" />
            <input
              type="text"
              placeholder="Search chat history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-sidebar-active text-xs text-text-app placeholder-muted-text border border-sidebar-border rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-primary transition"
            />
          </div>

          {/* Scrollable Chat History */}
          <div className="flex-1 overflow-y-auto space-y-1 pr-1">
            <span className="block text-[10px] font-bold text-muted-text uppercase tracking-wider px-2.5 mb-1.5">
              Conversations
            </span>
            {filteredChats.length === 0 ? (
              <p className="text-xs text-muted-text px-2.5 py-4 italic">No threads found</p>
            ) : (
              filteredChats.map((item) => (
                <div
                  key={item.id}
                  onClick={() => openChat(item.id)}
                  className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-all duration-150 ${
                    currentChatId === item.id
                      ? 'bg-sidebar-active border border-sidebar-border text-primary'
                      : 'hover:bg-sidebar-hover text-muted-text hover:text-text-app border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <MessageSquare className="w-4 h-4 shrink-0 opacity-70" />
                    <span className="truncate pr-2">{item.title}</span>
                  </div>
                  
                  <button
                    onClick={(e) => handleDelete(e, item.id)}
                    type="button"
                    className="p-1 rounded hover:bg-muted-app text-muted-text hover:text-red-500 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity duration-150 cursor-pointer"
                    title="Delete thread"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* User profile & Settings actions */}
        <div className="border-t border-sidebar-border pt-4 mt-4 space-y-2">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{user?.username}</p>
                <p className="text-[10px] text-muted-text truncate">{user?.email}</p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-1 pt-1.5">
            <button
              onClick={() => setShowSettings(true)}
              type="button"
              className="flex-1 flex items-center justify-center gap-1.5 bg-sidebar-active hover:bg-sidebar-hover border border-sidebar-border text-xs font-semibold py-2 rounded-xl text-muted-text hover:text-text-app transition cursor-pointer"
            >
              <Settings className="w-4.5 h-4.5" />
              Settings
            </button>
            <button
              onClick={handleLogout}
              type="button"
              className="flex-1 flex items-center justify-center gap-1.5 bg-sidebar-active hover:bg-sidebar-hover border border-sidebar-border text-xs font-semibold py-2 rounded-xl text-muted-text hover:text-red-400 transition cursor-pointer"
            >
              <LogOut className="w-4.5 h-4.5" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main chat window container */}
      <section className="flex-1 flex flex-col h-screen min-w-0 relative">
        
        {/* Top Header Navigation for Mobile & Collapse controls */}
        <header className="h-14 border-b border-sidebar-border px-4 flex items-center justify-between shrink-0 bg-bg-app z-20">
          <div className="flex items-center gap-3">
            {!isSidebarOpen && (
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-1.5 rounded-lg border border-sidebar-border hover:bg-sidebar-hover text-muted-text cursor-pointer transition-all"
                title="Open Sidebar"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            <span className="text-sm font-semibold truncate text-muted-text">
              {currentChatId ? chats[currentChatId]?.title : 'New Session'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium bg-primary/10 border border-primary/20 text-primary px-2.5 py-1 rounded-full flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Copilot Active
            </span>
          </div>
        </header>

        {/* Message Area */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6 min-h-0 bg-bg-app">
          
          {!currentChatId ? (
            /* Redesigned Landing State (Empty State) */
            <div className="max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[75vh] text-center space-y-8 py-10 animate-fade-in-up">
              <div className="space-y-3">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                  What can I help you discover today?
                </h1>
                <p className="text-muted-text text-sm md:text-base max-w-lg mx-auto">
                  Ask a question, analyze a complex topic, or debug source code cleanly with references.
                </p>
              </div>

              {/* Suggestion Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full text-left">
                {suggestions.map((sug, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSuggestionClick(sug.desc)}
                    className="p-4 rounded-xl border border-sidebar-border bg-sidebar-bg hover:bg-sidebar-hover cursor-pointer transition-all duration-200 hover:shadow-xs group"
                  >
                    <h3 className="font-semibold text-sm group-hover:text-primary transition-colors duration-150">
                      {sug.title}
                    </h3>
                    <p className="text-xs text-muted-text mt-1 leading-relaxed">
                      {sug.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Active Message List */
            <div className="max-w-3xl mx-auto space-y-6 pb-28">
              {chats[currentChatId]?.messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex flex-col w-full animate-fade-in-up [animation-delay:50ms] ${
                    message.role === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm md:text-[15px] leading-relaxed ${
                      message.role === 'user'
                        ? 'bg-chat-user-bg text-chat-user-text font-medium shadow-xs'
                        : 'bg-transparent text-chat-ai-text prose'
                    }`}
                  >
                    {message.role === 'user' ? (
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    ) : (
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => <p className="mb-4 last:mb-0 leading-relaxed">{children}</p>,
                          ul: ({ children }) => <ul className="mb-4 pl-6 list-disc space-y-1">{children}</ul>,
                          ol: ({ children }) => <ol className="mb-4 pl-6 list-decimal space-y-1">{children}</ol>,
                          li: ({ children }) => <li className="mb-1">{children}</li>,
                          code: CodeBlock,
                          blockquote: ({ children }) => <blockquote className="my-4 border-l-4 border-primary pl-4 py-1 italic bg-muted-app rounded-r-lg text-muted-text">{children}</blockquote>,
                          table: ({ children }) => <div className="overflow-x-auto my-4 border border-border-app rounded-xl"><table className="w-full text-sm">{children}</table></div>,
                          thead: ({ children }) => <thead className="bg-sidebar-bg font-semibold border-b border-border-app">{children}</thead>,
                          th: ({ children }) => <th className="p-3 text-left">{children}</th>,
                          td: ({ children }) => <td className="p-3 border-t border-border-app">{children}</td>,
                          a: ({ children, href }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-semibold">{children}</a>
                        }}
                        remarkPlugins={[remarkGfm]}
                      >
                        {message.content}
                      </ReactMarkdown>
                    )}
                  </div>
                </div>
              ))}

              {/* Progress/Thinking Loader */}
              {isLoading && (
                <div className="flex items-center gap-3 text-muted-text py-4 px-2 animate-pulse bg-transparent">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  </div>
                  <span className="text-sm font-medium">Generating answer...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Bar Section */}
        <footer className="absolute bottom-0 inset-x-0 p-4 md:p-6 bg-gradient-to-t from-bg-app via-bg-app to-transparent z-10 shrink-0 pointer-events-none">
          <div className="max-w-3xl mx-auto pointer-events-auto">
            <form 
              onSubmit={handleSubmitMessage} 
              className="bg-sidebar-bg border border-sidebar-border rounded-2xl p-2.5 shadow-lg focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all duration-200 relative"
            >
              <textarea
                ref={textareaRef}
                rows={1}
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything..."
                className="w-full bg-transparent text-text-app placeholder-muted-text outline-none resize-none pl-4 pr-14 py-2 max-h-48 text-sm md:text-base leading-relaxed"
                style={{ height: 'auto' }}
              />
              
              <div className="flex items-center justify-between border-t border-sidebar-border/40 pt-2 px-2 mt-1">
                {/* Visual action buttons */}
                <div className="flex items-center gap-1 text-muted-text">
                  <button 
                    type="button"
                    className="p-2 rounded-lg hover:bg-sidebar-hover transition-colors cursor-pointer"
                    title="Attach file (visual only)"
                  >
                    <Paperclip className="w-4.5 h-4.5" />
                  </button>
                  <button 
                    type="button"
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-sidebar-border hover:bg-sidebar-hover text-xs font-semibold transition cursor-pointer"
                    title="Select AI search scope"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Focus</span>
                  </button>
                </div>

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isLoading}
                  className="bg-primary hover:bg-primary-hover text-slate-950 p-2.5 rounded-xl shadow-md transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center"
                >
                  <ArrowUp className="w-4 h-4 font-bold" />
                </button>
              </div>
            </form>
            <p className="text-[10px] text-center text-muted-text mt-2">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </footer>

      </section>

      {/* Settings Modal overlay */}
      {showSettings && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-card-bg border border-card-border rounded-2xl w-full max-w-md p-6 shadow-2xl relative animate-scale-in">
            
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold tracking-tight">Settings</h3>
              <button 
                onClick={() => setShowSettings(false)}
                className="p-1.5 rounded-lg hover:bg-sidebar-hover text-muted-text cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5">
              {/* Profile details */}
              <div className="pb-4 border-b border-sidebar-border">
                <h4 className="text-xs font-bold text-muted-text uppercase tracking-wider mb-3">
                  Account Profile
                </h4>
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-lg">
                    {user?.username?.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-base truncate">{user?.username}</p>
                    <p className="text-xs text-muted-text truncate">{user?.email}</p>
                  </div>
                </div>
              </div>

              {/* Appearance options */}
              <div className="flex justify-between items-center py-2">
                <div>
                  <h4 className="text-sm font-semibold">Dark theme</h4>
                  <p className="text-xs text-muted-text">Comfort reading for low light environments</p>
                </div>
                
                <button
                  onClick={toggleTheme}
                  type="button"
                  className="p-2.5 rounded-xl bg-sidebar-bg border border-sidebar-border hover:bg-sidebar-hover text-text-app transition cursor-pointer"
                >
                  {isDarkMode ? (
                    <div className="flex items-center gap-1 text-xs font-semibold text-amber-400">
                      <Sun className="w-4 h-4" />
                      <span>On</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-xs font-semibold text-slate-500">
                      <Moon className="w-4 h-4" />
                      <span>Off</span>
                    </div>
                  )}
                </button>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setShowSettings(false)}
                type="button"
                className="bg-primary hover:bg-primary-hover text-slate-950 px-5 py-2.5 rounded-xl font-semibold transition cursor-pointer text-sm shadow-md"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  )
}

export default Dashboard