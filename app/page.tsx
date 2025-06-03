"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageCircle, Users, Globe, Zap } from "lucide-react"

export default function HomePage() {
  const [username, setUsername] = useState("")
  const [channelId, setChannelId] = useState("")
  const router = useRouter()

  // This effect prevents any potential MetaMask connection attempts
  useEffect(() => {
    // Suppress MetaMask connection errors in console
    const originalConsoleError = console.error
    console.error = (...args) => {
      if (typeof args[0] === "string" && args[0].includes("MetaMask")) {
        return
      }
      originalConsoleError(...args)
    }

    return () => {
      console.error = originalConsoleError
    }
  }, [])

  const joinChat = (type: "general" | "channel") => {
    if (!username.trim()) return

    localStorage.setItem("chatUsername", username.trim())

    if (type === "general") {
      router.push("/chat")
    } else if (type === "channel" && channelId.trim()) {
      router.push(`/chat/${channelId.trim()}`)
    }
  }

  const createChannel = () => {
    if (!username.trim()) return

    const newChannelId = Math.random().toString(36).substring(2, 8).toUpperCase()
    localStorage.setItem("chatUsername", username.trim())
    router.push(`/chat/${newChannelId}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">ChatFlow</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">Connect, chat, and collaborate in real-time</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="border-2 hover:border-blue-300 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-blue-500" />
                General Chat
              </CardTitle>
              <CardDescription>Join the main chat room and talk with everyone</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && joinChat("general")}
              />
              <Button onClick={() => joinChat("general")} className="w-full" disabled={!username.trim()}>
                Join General Chat
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-green-300 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-500" />
                Private Channel
              </CardTitle>
              <CardDescription>Create or join a private channel with a specific ID</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input placeholder="Enter your username" value={username} onChange={(e) => setUsername(e.target.value)} />
              <Input
                placeholder="Channel ID (leave empty to create new)"
                value={channelId}
                onChange={(e) => setChannelId(e.target.value.toUpperCase())}
              />
              <div className="flex gap-2">
                <Button
                  onClick={() => joinChat("channel")}
                  variant="outline"
                  className="flex-1"
                  disabled={!username.trim() || !channelId.trim()}
                >
                  Join Channel
                </Button>
                <Button
                  onClick={createChannel}
                  className="flex-1"
                  disabled={!username.trim() || channelId.trim() !== ""}
                >
                  Create New
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-4 text-center">
          <div className="flex flex-col items-center p-4">
            <Globe className="h-8 w-8 text-blue-500 mb-2" />
            <h3 className="font-semibold">World-wide</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Online world wide accessibility</p>
          </div>
          <div className="flex flex-col items-center p-4">
            <Zap className="h-8 w-8 text-yellow-500 mb-2" />
            <h3 className="font-semibold">Real-time</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Instant messaging with live updates</p>
          </div>
          <div className="flex flex-col items-center p-4">
            <Users className="h-8 w-8 text-green-500 mb-2" />
            <h3 className="font-semibold">Collaborative</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Multiple users, channels, and reactions</p>
          </div>
        </div>
      </div>
    </div>
  )
}
