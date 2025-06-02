"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import ChatInterface from "@/components/chat-interface"
import ErrorBoundary from "@/components/error-boundary"

export default function GeneralChatPage() {
  const [username, setUsername] = useState("")
  const router = useRouter()

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
      <ChatInterface username={username} channelId="general" channelName="General Chat" isEmbedded={false} />
    </ErrorBoundary>
  )
}
