"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import ChatInterface from "@/components/chat-interface"
import ErrorBoundary from "@/components/error-boundary"

export default function ChannelChatPage() {
  const [username, setUsername] = useState("")
  const router = useRouter()
  const params = useParams()
  const channelId = params.channelId as string

  useEffect(() => {
    const savedUsername = localStorage.getItem("chatUsername")
    if (!savedUsername) {
      router.push("/")
      return
    }
    setUsername(savedUsername)
  }, [router])

  if (!username) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <ErrorBoundary>
      <ChatInterface
        username={username}
        channelId={channelId}
        channelName={`Channel ${channelId}`}
        isEmbedded={false}
      />
    </ErrorBoundary>
  )
}
