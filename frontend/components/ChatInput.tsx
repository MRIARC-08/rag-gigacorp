// frontend/components/ChatInput.tsx

"use client"
import { useState, KeyboardEvent, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Props {
  onSend: (message: string) => void
  isLoading: boolean
}

export default function ChatInput({ onSend, isLoading }: Props) {
  const [input, setInput] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    if (!input.trim() || isLoading) return
    onSend(input.trim())
    setInput("")
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }

  return (
    <div className="p-4 sm:p-6 bg-gradient-to-t from-[#fdfbf7] via-[#fdfbf7] to-transparent">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          className="glass bg-white/70 rounded-2xl p-2 pl-4 flex items-end gap-3 shadow-lg border border-zinc-200 focus-within:border-brand-500/50 focus-within:ring-1 focus-within:ring-brand-500/50 transition-all"
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Ask about shipping, returns, business hours..."
            disabled={isLoading}
            rows={1}
            className="flex-1 max-h-[200px] resize-none bg-transparent py-3 text-sm focus:outline-none disabled:opacity-50 text-zinc-900 placeholder:text-zinc-400 scrollbar-hide font-medium"
          />
          <AnimatePresence mode="wait">
            <motion.button
              key={isLoading ? "loading" : "send"}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className={cn(
                "p-3 rounded-xl flex items-center justify-center transition-colors shadow-sm",
                isLoading || !input.trim() 
                  ? "bg-zinc-100 text-zinc-400 cursor-not-allowed border border-zinc-200" 
                  : "bg-brand-500 hover:bg-brand-600 text-white shadow-brand-500/20"
              )}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </motion.button>
          </AnimatePresence>
        </motion.div>
        <p className="text-center text-[11px] text-zinc-500 mt-3 font-semibold tracking-wide">
          Press <kbd className="font-sans px-1.5 py-0.5 bg-zinc-100 rounded-md border border-zinc-200 text-zinc-700">Enter</kbd> to send · <kbd className="font-sans px-1.5 py-0.5 bg-zinc-100 rounded-md border border-zinc-200 text-zinc-700">Shift</kbd> + <kbd className="font-sans px-1.5 py-0.5 bg-zinc-100 rounded-md border border-zinc-200 text-zinc-700">Enter</kbd> for new line
        </p>
      </div>
    </div>
  )
}
