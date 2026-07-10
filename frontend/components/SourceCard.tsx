// frontend/components/SourceCard.tsx
// Displays a single citation card below AI responses

import { SourceDocument } from "@/types"
import { motion } from "framer-motion"
import { FileText, Hash } from "lucide-react"

interface Props {
  source: SourceDocument
  index: number
}

export default function SourceCard({ source, index }: Props) {
  return (
    <motion.div 
      whileHover={{ y: -2, scale: 1.01 }}
      className="glass-hover rounded-xl p-3.5 bg-white/60 text-sm transition-colors cursor-pointer group shadow-sm border-zinc-200"
    >
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <span className="bg-brand-500/10 border border-brand-500/20 text-brand-600 text-xs px-2 py-0.5 rounded-full font-bold">
          Source {index + 1}
        </span>
        {source.section && (
          <span className="text-zinc-700 font-bold text-xs flex items-center gap-1 bg-zinc-100 px-2 py-0.5 rounded-md border border-zinc-200">
            <Hash className="w-3 h-3 text-brand-500" />
            {source.section}
          </span>
        )}
        {source.line_number && (
          <span className="text-zinc-500 text-xs font-semibold">
            Line {source.line_number}
          </span>
        )}
      </div>
      <p className="text-zinc-700 text-sm leading-relaxed line-clamp-2 group-hover:text-zinc-900 transition-colors font-medium">
        {source.content}
      </p>
      <div className="flex items-center gap-1.5 text-zinc-500 text-xs mt-3 bg-zinc-100 w-fit px-2 py-1 rounded-md border border-zinc-200">
        <FileText className="w-3.5 h-3.5" />
        <span className="font-mono font-semibold">{source.source_file}</span>
      </div>
    </motion.div>
  )
}
