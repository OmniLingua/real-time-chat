import { type NextRequest, NextResponse } from "next/server"
import { messageStore } from "@/lib/message-store"

export async function POST(request: NextRequest) {
  try {
    const { messageId, emoji, username, channelId } = await request.json()

    console.log(`Attempting to add reaction ${emoji} to message ${messageId} in channel ${channelId}`)

    // Debug available messages
    const availableIds = messageStore.getAllMessageIds(channelId)
    console.log(`Available message IDs in channel ${channelId}:`, availableIds)

    // Get the message
    const message = messageStore.getMessage(channelId, messageId)

    if (!message) {
      console.error(`Message ${messageId} not found in channel ${channelId}`)
      return NextResponse.json(
        {
          error: "Message not found",
          availableIds,
          channelId,
        },
        { status: 404 },
      )
    }

    // Update the message with the new reaction
    const success = messageStore.updateMessage(channelId, messageId, (message) => {
      // Initialize reactions if they don't exist
      if (!message.reactions) {
        message.reactions = {}
      }

      if (!message.reactions[emoji]) {
        message.reactions[emoji] = []
      }

      // Toggle reaction - if user already reacted, remove it, otherwise add it
      const userIndex = message.reactions[emoji].indexOf(username)
      if (userIndex > -1) {
        // Remove reaction
        message.reactions[emoji].splice(userIndex, 1)
        // Remove emoji key if no users have this reaction
        if (message.reactions[emoji].length === 0) {
          delete message.reactions[emoji]
        }
        console.log(`Removed reaction ${emoji} from user ${username}`)
      } else {
        // Add reaction
        message.reactions[emoji].push(username)
        console.log(`Added reaction ${emoji} from user ${username}`)
      }

      return message
    })

    if (!success) {
      return NextResponse.json({ error: "Failed to update message" }, { status: 500 })
    }

    // Get the updated message to return the current reactions
    const updatedMessage = messageStore.getMessage(channelId, messageId)

    return NextResponse.json({
      success: true,
      message: "Reaction updated successfully",
      reactions: updatedMessage?.reactions || {},
    })
  } catch (error) {
    console.error("Reaction error:", error)
    return NextResponse.json({ error: "Failed to update reaction" }, { status: 500 })
  }
}

// Add a GET endpoint to help with debugging
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const channelId = searchParams.get("channel") || "general"

  const messages = messageStore.getMessages(channelId)

  return NextResponse.json({
    channelId,
    messageCount: messages.length,
    messages: messages.map((m) => ({
      id: m.id,
      content: m.content.substring(0, 50),
      reactions: m.reactions,
    })),
  })
}
