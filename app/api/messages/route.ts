import { type NextRequest, NextResponse } from "next/server"
import { messageStore } from "@/lib/message-store"

// Shared in-memory storage - make this globally accessible
let messagesStorage: { [channelId: string]: any[] } = {}

// Export the storage for use in other API routes
export function getMessagesStorage() {
  return messagesStorage
}

export function setMessagesStorage(storage: { [channelId: string]: any[] }) {
  messagesStorage = storage
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const channel = searchParams.get("channel") || "general"

  return NextResponse.json({
    messages: messageStore.getMessages(channel),
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { channelId, ...messageData } = body

    // Ensure required fields
    if (!channelId || !messageData.username || !messageData.content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create a complete message object
    const message = {
      ...messageData,
      channelId,
      id: messageData.id || `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`,
      timestamp: messageData.timestamp || Date.now(),
      reactions: messageData.reactions || {},
    }

    // Add to storage
    messageStore.addMessage(message)

    console.log(`Message saved to channel ${channelId}:`, message.id)
    return NextResponse.json({
      success: true,
      message: "Message saved successfully",
      messageId: message.id,
    })
  } catch (error) {
    console.error("Message save error:", error)
    return NextResponse.json({ error: "Failed to save message" }, { status: 500 })
  }
}
