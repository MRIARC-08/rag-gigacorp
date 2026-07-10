// frontend/lib/api.ts
// All API calls to FastAPI backend

const API_URL = process.env.NEXT_PUBLIC_API_URL!

export async function createSession(userId?: string, email?: string, name?: string) {
  const body: Record<string, string> = {}
  if (userId) body.user_id = userId
  if (email) body.email = email
  if (name) body.name = name

  const res = await fetch(`${API_URL}/api/chat/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    console.error("createSession failed:", res.status, await res.text())
    throw new Error(`Failed to create session: ${res.status}`)
  }
  return res.json()
}

export async function sendMessage(
  message: string,
  sessionId: string,
  userId?: string
) {
  const res = await fetch(`${API_URL}/api/chat/message`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      session_id: sessionId,
      user_id: userId || undefined,
    }),
  })
  if (!res.ok) {
    console.error("sendMessage failed:", res.status, await res.text())
    throw new Error(`Failed to send message: ${res.status}`)
  }
  return res.json()
}

export async function getHistory(sessionId: string) {
  const res = await fetch(`${API_URL}/api/chat/history/${sessionId}`)
  if (!res.ok) {
    console.error("getHistory failed:", res.status, await res.text())
    throw new Error(`Failed to get history: ${res.status}`)
  }
  return res.json()
}

export async function getUserSessions(userId: string) {
  const res = await fetch(`${API_URL}/api/chat/sessions/${userId}`)
  if (!res.ok) {
    console.error("getUserSessions failed:", res.status, await res.text())
    throw new Error(`Failed to get sessions: ${res.status}`)
  }
  return res.json()
}
