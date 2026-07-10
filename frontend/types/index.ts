// frontend/types/index.ts
// All TypeScript interfaces

export interface SourceDocument {
  content: string
  source_file: string
  line_number: string | null
  section: string | null
}

export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  sources?: SourceDocument[]
  created_at?: string
}

export interface ChatSession {
  session_id: string
  created_at: string
}

export interface SessionListItem {
  session_id: string
  created_at: string
  preview: string | null
}
