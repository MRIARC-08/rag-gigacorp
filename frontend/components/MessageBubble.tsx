// frontend/components/MessageBubble.tsx

"use client"

import { Message } from "@/types"
import SourceCard from "./SourceCard"
import { motion, AnimatePresence } from "framer-motion"
import { BookOpen, ChevronDown, ChevronUp } from "lucide-react"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useState } from "react"

interface Props {
  message: Message
}

export default function MessageBubble({ message }: Props) {
  const isUser = message.role === "user"
  const [showSources, setShowSources] = useState(false)

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-6`}
    >
      <div className={`max-w-[85%] sm:max-w-[75%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-3`}>
        
        {/* Message bubble */}
        <div
          className={`px-5 py-3.5 rounded-2xl text-[15px] leading-relaxed shadow-sm font-medium ${
            isUser
              ? "bg-gradient-to-br from-brand-500 to-brand-600 text-white rounded-br-sm border border-brand-500/20 shadow-brand-500/20"
              : "glass bg-white/70 text-zinc-800 rounded-bl-sm border-zinc-200"
          }`}
        >
          {isUser ? (
            message.content
          ) : (
            <div className="markdown-content space-y-3 [&>p]:leading-relaxed [&>ul]:list-disc [&>ul]:ml-5 [&>ol]:list-decimal [&>ol]:ml-5 [&>h1]:font-bold [&>h2]:font-bold [&>h3]:font-bold [&>h3]:text-lg [&>h4]:font-bold [&>strong]:text-zinc-950 [&>strong]:font-bold [&>table]:w-full [&>table]:text-sm [&>table]:text-left [&>table]:border-collapse [&>table>thead>tr>th]:border-b [&>table>thead>tr>th]:border-zinc-300 [&>table>thead>tr>th]:p-2 [&>table>thead>tr>th]:font-semibold [&>table>tbody>tr>td]:border-b [&>table>tbody>tr>td]:border-zinc-200 [&>table>tbody>tr>td]:p-2">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content.replace(/<br\s*\/?>/gi, '\n')}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Sources (only for assistant messages) */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="w-full mt-1">
            <button 
              onClick={() => setShowSources(!showSources)}
              className="flex items-center gap-1.5 text-xs text-brand-600 font-bold ml-1 hover:text-brand-700 transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{showSources ? "Hide sources" : "View sources cited"} ({message.sources.length})</span>
              {showSources ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            
            <AnimatePresence>
              {showSources && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-col gap-2 w-full overflow-hidden mt-3"
                >
                  {message.sources.map((source, i) => (
                    <SourceCard key={i} source={source} index={i} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  )
}
