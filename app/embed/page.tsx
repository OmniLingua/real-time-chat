"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import ChatInterface from "@/components/chat-interface"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import ErrorBoundary from "@/components/error-boundary"

export default function EmbedPage() {
  const [username, setUsername] = useState("")
  const [tempUsername, setTempUsername] = useState("")
  const [isJoined, setIsJoined] = useState(false)
  const searchParams = useSearchParams()

  const channelId = searchParams.get("channel") || "general"
  const channelName = channelId === "general" ? "General Chat" : `Channel ${channelId}`

  useEffect(() => {
    const savedUsername = localStorage.getItem("chatUsername")
    if (savedUsername) {
      setUsername(savedUsername)
      setIsJoined(true)
    }
  }, [])

  const joinChat = () => {
    if (!tempUsername.trim()) return
    localStorage.setItem("chatUsername", tempUsername.trim())
    setUsername(tempUsername.trim())
    setIsJoined(true)
  }

  if (!isJoined) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Join Chat</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Enter your username"
              value={tempUsername}
              onChange={(e) => setTempUsername(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && joinChat()}
            />
            <Button onClick={joinChat} className="w-full" disabled={!tempUsername.trim()}>
              Join {channelName}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <ChatInterface username={username} channelId={channelId} channelName={channelName} isEmbedded={true} />
    </ErrorBoundary>
  )
}
