// frontend/app/chat/page.tsx
// Main chat page — works for both anonymous and authenticated users

"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import { useEffect, useState, useRef } from "react"
import { Message, SessionListItem } from "@/types"
import MessageBubble from "@/components/MessageBubble"
import ChatInput from "@/components/ChatInput"
import { createSession, sendMessage, getHistory, getUserSessions } from "@/lib/api"
import { motion, AnimatePresence } from "framer-motion"
import { LogOut, MessageSquare, Loader2, Sparkles, Plus, Clock, LogIn, ChevronLeft, ChevronRight } from "lucide-react"

export default function ChatPage() {
  const { data: session, status } = useSession()
  
  const [messages, setMessages] = useState<Message[]>([])
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingStatus, setLoadingStatus] = useState("Thinking...")
  const [pastSessions, setPastSessions] = useState<SessionListItem[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [sessionsLoading, setSessionsLoading] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const initialQueryProcessed = useRef(false)
  const sessionCreating = useRef(false)

  // Helper: create a session and return the ID
  const ensureSession = async (): Promise<string> => {
    if (sessionId) return sessionId
    
    // Prevent multiple concurrent creates
    if (sessionCreating.current) {
      // Wait for the in-flight creation
      while (!sessionId) {
        await new Promise(r => setTimeout(r, 50))
      }
      return sessionId!
    }
    
    sessionCreating.current = true
    try {
      const data = session?.user?.id && session?.user?.email
        ? await createSession(session.user.id, session.user.email, session.user.name || "Unknown")
        : await createSession()
      setSessionId(data.session_id)
      sessionCreating.current = false
      return data.session_id
    } catch (err) {
      sessionCreating.current = false
      throw err
    }
  }

  // Load past sessions for authenticated users (don't block anything)
  useEffect(() => {
    if (status === "loading") return
    
    // Handle initial query from landing page
    const params = new URLSearchParams(window.location.search)
    const q = params.get("q")
    if (q && !initialQueryProcessed.current) {
      initialQueryProcessed.current = true
      window.history.replaceState({}, '', '/chat')
      handleSend(q)
    }
    
    if (session?.user?.id) {
      setSessionsLoading(true)
      getUserSessions(session.user.id)
        .then((data) => setPastSessions(data.sessions || []))
        .catch((err) => console.error("Failed to load sessions:", err))
        .finally(() => setSessionsLoading(false))
    }
  }, [session, status])

  // Auto scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading])

  const handleSend = async (text: string, overrideSessionId?: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
    }
    setMessages((prev) => [...prev, userMsg])
    setIsLoading(true)

    try {
      // Lazily create session if needed
      if (!overrideSessionId && !sessionId) {
        setLoadingStatus("Creating session...")
      }
      const activeSessionId = overrideSessionId || await ensureSession()
      
      setLoadingStatus("Searching knowledge base...")
      const data = await sendMessage(text, activeSessionId, session?.user?.id)
      
      const assistantMsg: Message = {
        id: data.message_id,
        role: "assistant",
        content: data.answer,
        sources: data.sources,
      }
      setMessages((prev) => [...prev, assistantMsg])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
        },
      ])
    } finally {
      setIsLoading(false)
      setLoadingStatus("Thinking...")
    }
  }

  const handleNewChat = () => {
    setMessages([])
    setSessionId(null)
    
    if (session?.user?.id && session?.user?.email) {
      createSession(session.user.id, session.user.email, session.user.name || "Unknown")
        .then((data) => setSessionId(data.session_id))
        .catch((err) => console.error("Failed to create session:", err))
    } else {
      createSession()
        .then((data) => setSessionId(data.session_id))
        .catch((err) => console.error("Failed to create session:", err))
    }
  }

  const handleLoadSession = async (sid: string) => {
    setHistoryLoading(true)
    setSessionId(sid)
    setMessages([])
    try {
      const data = await getHistory(sid)
      setMessages(
        data.messages.map((m: any, i: number) => ({
          id: `${sid}-${i}`,
          role: m.role,
          content: m.content,
          sources: m.sources,
        }))
      )
    } catch (err) {
      console.error("Failed to load session:", err)
    } finally {
      setHistoryLoading(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
      </div>
    )
  }

  const isAuthenticated = status === "authenticated"

  return (
    <div className="h-screen flex relative overflow-hidden text-zinc-900">
      
      {/* Background glow */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Sidebar — only for logged-in users */}
      {isAuthenticated && (
        <>
          {/* Toggle button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="fixed top-20 left-0 z-30 bg-white/80 backdrop-blur-sm border border-zinc-200 rounded-r-lg p-2 shadow-sm hover:bg-white transition-colors"
          >
            {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          
          {/* Sidebar panel */}
          <AnimatePresence>
            {sidebarOpen && (
              <motion.aside
                initial={{ x: -280, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -280, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed left-0 top-16 bottom-0 w-72 glass bg-white/90 border-r border-zinc-200 z-20 flex flex-col shadow-xl"
              >
                <div className="p-4 border-b border-zinc-200">
                  <button
                    onClick={handleNewChat}
                    className="w-full flex items-center gap-2 bg-brand-500 text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-brand-600 transition-colors shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    New Chat
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-3">
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 px-1">
                    Previous Conversations
                  </p>
                  {sessionsLoading ? (
                    <div className="flex flex-col gap-3 px-1">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-4 bg-zinc-200 rounded w-3/4 mb-1.5" />
                          <div className="h-3 bg-zinc-100 rounded w-1/2" />
                        </div>
                      ))}
                    </div>
                  ) : pastSessions.length === 0 ? (
                    <p className="text-sm text-zinc-400 px-1 font-medium">No previous chats yet.</p>
                  ) : (
                    <div className="flex flex-col gap-1">
                      {pastSessions.map((s) => (
                        <button
                          key={s.session_id}
                          onClick={() => handleLoadSession(s.session_id)}
                          className={`text-left px-3 py-2.5 rounded-xl hover:bg-zinc-100 transition-colors group ${
                            sessionId === s.session_id ? "bg-brand-500/10 border border-brand-500/20" : ""
                          }`}
                        >
                          <p className="text-sm font-semibold text-zinc-700 truncate group-hover:text-zinc-900">
                            {s.preview || "Empty conversation"}
                          </p>
                          <p className="text-xs text-zinc-400 mt-0.5 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(s.created_at).toLocaleDateString()}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.aside>
            )}
          </AnimatePresence>
        </>
      )}

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="glass px-6 py-4 flex items-center justify-between z-10 sticky top-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-brand-500/10 p-2 rounded-lg border border-brand-500/20 shadow-sm shadow-brand-500/10">
              <Sparkles className="w-5 h-5 text-brand-500" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">
                GigaCorp Support
              </h1>
              <p className="text-xs text-zinc-500 font-medium">AI-powered customer assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-3 hidden sm:flex">
                  {session?.user?.image && (
                    <img
                      src={session.user.image}
                      alt="avatar"
                      className="w-8 h-8 rounded-full border border-zinc-300"
                    />
                  )}
                  <span className="text-sm font-bold text-zinc-700">{session?.user?.name}</span>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex items-center gap-2 text-sm text-zinc-600 hover:text-red-500 transition-colors bg-white/50 hover:bg-white px-3 py-1.5 rounded-lg border border-zinc-200 shadow-sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline font-semibold">Sign out</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => signIn("google")}
                className="flex items-center gap-2 text-sm font-semibold text-zinc-600 hover:text-brand-500 transition-colors bg-white/50 hover:bg-white px-4 py-2 rounded-lg border border-zinc-200 shadow-sm"
              >
                <LogIn className="w-4 h-4" />
                Sign in to save chats
              </button>
            )}
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 max-w-4xl w-full mx-auto z-10 scrollbar-hide">
          <AnimatePresence mode="popLayout">
            {historyLoading && (
              <div className="flex flex-col gap-4 mt-8">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'} mb-2`}>
                    <div className="animate-pulse max-w-[60%]">
                      <div className={`h-14 rounded-2xl ${i % 2 === 0 ? 'bg-zinc-100 rounded-bl-sm' : 'bg-brand-100 rounded-br-sm'}`} 
                           style={{ width: `${150 + i * 60}px` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {messages.length === 0 && !historyLoading && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center mt-32 flex flex-col items-center"
              >
                <div className="w-16 h-16 rounded-full bg-white border border-zinc-200 shadow-sm flex items-center justify-center mb-6">
                  <MessageSquare className="w-8 h-8 text-brand-500" />
                </div>
                <p className="font-extrabold text-2xl mb-2">How can I help you today?</p>
                <p className="text-sm text-zinc-500 max-w-sm font-medium">
                  Ask me about shipping, returns, or service plans. Our AI will instantly find the right answers.
                </p>
                {!isAuthenticated && (
                  <p className="text-xs text-zinc-400 mt-4 font-medium">
                    💡 Sign in to save your conversation history
                  </p>
                )}
              </motion.div>
            )}
            
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            
            {isLoading && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start mb-6"
              >
                <div className="glass px-5 py-4 rounded-2xl rounded-bl-sm text-sm text-zinc-600 font-medium flex items-center gap-3 shadow-sm bg-white/80">
                  <Loader2 className="w-4 h-4 animate-spin text-brand-500" />
                  {loadingStatus}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={bottomRef} className="h-4" />
        </div>

        {/* Input */}
        <div className="z-20">
          <ChatInput onSend={handleSend} isLoading={isLoading} />
        </div>
      </div>
    </div>
  )
}
