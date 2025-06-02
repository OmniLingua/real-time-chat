import { type NextRequest, NextResponse } from "next/server"

// In-memory storage for user presence
const users: { [channelId: string]: { [username: string]: { lastSeen: number; isTyping: boolean } } } = {}

export async function POST(request: NextRequest) {
  try {
    const { username, channelId, isTyping } = await request.json()

    if (!username || !channelId) {
      return NextResponse.json({ error: "Username and channelId are required" }, { status: 400 })
    }

    if (!users[channelId]) {
      users[channelId] = {}
    }

    users[channelId][username] = {
      lastSeen: Date.now(),
      isTyping: isTyping || false,
    }

    // Clean up old users (offline for more than 5 minutes)
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000
    Object.keys(users[channelId]).forEach((user) => {
      if (users[channelId][user].lastSeen < fiveMinutesAgo) {
        delete users[channelId][user]
      }
    })

    const userList = Object.entries(users[channelId]).map(([username, data]) => ({
      username,
      lastSeen: data.lastSeen,
      isTyping: data.isTyping,
    }))

    return NextResponse.json({ users: userList })
  } catch (error) {
    console.error("User presence error:", error)
    return NextResponse.json({ error: "Failed to update user presence" }, { status: 500 })
  }
}

// Add a GET endpoint for debugging
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const channelId = searchParams.get("channel") || "general"

  const userList = Object.entries(users[channelId] || {}).map(([username, data]) => ({
    username,
    lastSeen: data.lastSeen,
    isTyping: data.isTyping,
    online: Date.now() - data.lastSeen < 30000,
  }))

  return NextResponse.json({
    channelId,
    userCount: userList.length,
    users: userList,
  })
}
