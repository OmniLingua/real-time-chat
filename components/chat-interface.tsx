"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Send,
  Users,
  Copy,
  Download,
  Search,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Heart,
  Smile,
  ThumbsUp,
  Home,
  Paperclip,
  X,
  Eye,
  AlertCircle,
  MoreVertical,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Message {
  id: string
  username: string
  content: string
  timestamp: number
  reactions: { [emoji: string]: string[] }
  fileUrl?: string
  fileName?: string
  fileType?: string
  fileSize?: number
}

interface User {
  username: string
  lastSeen: number
  isTyping: boolean
}

interface ChatInterfaceProps {
  username: string
  channelId: string
  channelName: string
  isEmbedded: boolean
}

export default function ChatInterface({ username, channelId, channelName, isEmbedded }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [users, setUsers] = useState<User[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [soundEnabled, setSoundEnabled] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isReacting, setIsReacting] = useState(false)

  // Suppress MetaMask errors
  useEffect(() => {
    const originalConsoleError = console.error
    const originalConsoleWarn = console.warn

    console.error = (...args) => {
      if (typeof args[0] === "string" && (args[0].includes("MetaMask") || args[0].includes("ChromeTransport"))) {
        return
      }
      originalConsoleError(...args)
    }

    console.warn = (...args) => {
      if (typeof args[0] === "string" && (args[0].includes("MetaMask") || args[0].includes("ChromeTransport"))) {
        return
      }
      originalConsoleWarn(...args)
    }

    return () => {
      console.error = originalConsoleError
      console.warn = originalConsoleWarn
    }
  }, [])

  // Simulate real-time updates
  useEffect(() => {
    // Initial fetch
    fetchMessages()
    updateUserPresence()

    const interval = setInterval(() => {
      fetchMessages()
      updateUserPresence()
    }, 2000)

    return () => clearInterval(interval)
  }, [channelId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/messages?channel=${channelId}`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error)
      setError("Failed to fetch messages. Please try again.")
    }
  }

  const updateUserPresence = async () => {
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, channelId, isTyping }),
      })
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      }
    } catch (error) {
      console.error("Failed to update presence:", error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim()) return

    const messageId = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`
    const message: Message = {
      id: messageId,
      username,
      content: newMessage.trim(),
      timestamp: Date.now(),
      reactions: {},
    }

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...message, channelId }),
      })

      if (response.ok) {
        setNewMessage("")
        setIsTyping(false)
        if (soundEnabled) {
          // Play send sound
          const audio = new Audio(
            "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT",
          )
          audio.volume = 0.1
          audio.play().catch(() => {})
        }

        // Add the message to our local state immediately
        setMessages((prev) => [...prev, { ...message, channelId }])

        // Then fetch all messages to ensure we're in sync
        setTimeout(fetchMessages, 500)
      }
    } catch (error) {
      console.error("Failed to send message:", error)
      setError("Failed to send message. Please try again.")
    }
  }

  const handleTyping = (value: string) => {
    setNewMessage(value)

    if (!isTyping && value.trim()) {
      setIsTyping(true)
      updateUserPresence()
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
      updateUserPresence()
    }, 2000)
  }

  const addReaction = async (messageId: string, emoji: string) => {
    if (isReacting) return // Prevent multiple simultaneous reactions

    try {
      setIsReacting(true)
      console.log(`Adding reaction ${emoji} to message ${messageId}`)

      // Check if message exists locally first
      const messageExists = messages.find((m) => m.id === messageId)
      if (!messageExists) {
        console.error(`Message ${messageId} not found locally`)
        setError(`Cannot add reaction: Message not found. Try refreshing.`)
        return
      }

      // Optimistically update the UI
      const updatedMessages = messages.map((msg) => {
        if (msg.id === messageId) {
          const updatedReactions = { ...msg.reactions }
          if (!updatedReactions[emoji]) {
            updatedReactions[emoji] = []
          }

          const userIndex = updatedReactions[emoji].indexOf(username)
          if (userIndex > -1) {
            updatedReactions[emoji].splice(userIndex, 1)
            if (updatedReactions[emoji].length === 0) {
              delete updatedReactions[emoji]
            }
          } else {
            updatedReactions[emoji].push(username)
          }

          return { ...msg, reactions: updatedReactions }
        }
        return msg
      })

      setMessages(updatedMessages)

      const response = await fetch("/api/reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId, emoji, username, channelId }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Reaction failed:", errorData.error)
        setError(`Failed to add reaction: ${errorData.error}`)
        // Revert the optimistic update
        fetchMessages()
      }
    } catch (error) {
      console.error("Failed to add reaction:", error)
      setError("Failed to add reaction. Please try again.")
      // Revert the optimistic update
      fetchMessages()
    } finally {
      setIsReacting(false)
    }
  }

  const copyChannelLink = () => {
    const url = `${window.location.origin}/chat/${channelId}`
    navigator.clipboard.writeText(url)
    alert("Channel link copied to clipboard!")
  }

  const exportChat = () => {
    const chatData = messages
      .map((m) => `[${new Date(m.timestamp).toLocaleString()}] ${m.username}: ${m.content}`)
      .join("\n")

    const blob = new Blob([chatData], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `chat-${channelId}-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const filteredMessages = messages.filter(
    (message) =>
      message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.username.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const onlineUsers = users.filter((user) => Date.now() - user.lastSeen < 30000)
  const typingUsers = users.filter((user) => user.isTyping && user.username !== username)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert("File size must be less than 10MB")
        return
      }
      setSelectedFile(file)
    }
  }

  const uploadFile = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append("file", selectedFile)
    formData.append("channelId", channelId)
    formData.append("username", username)

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()

        // Send file message
        const messageId = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`
        const message: Message = {
          id: messageId,
          username,
          content: `📎 ${selectedFile.name}`,
          timestamp: Date.now(),
          reactions: {},
          fileUrl: data.fileUrl,
          fileName: selectedFile.name,
          fileType: selectedFile.type,
          fileSize: selectedFile.size,
        }

        await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...message, channelId }),
        })

        setSelectedFile(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
        setTimeout(fetchMessages, 500)
      }
    } catch (error) {
      console.error("Failed to upload file:", error)
      setError("Failed to upload file. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  const downloadFile = (fileUrl: string, fileName: string) => {
    // Extract filename from the URL
    const urlParts = fileUrl.split("/")
    const actualFileName = urlParts[urlParts.length - 1]

    // Use the download API route
    const downloadUrl = `/api/download/${actualFileName}`

    const a = document.createElement("a")
    a.href = downloadUrl
    a.download = fileName
    a.target = "_blank"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const viewFile = (fileUrl: string, fileName: string) => {
    // For viewing files in a new tab
    const urlParts = fileUrl.split("/")
    const actualFileName = urlParts[urlParts.length - 1]
    const viewUrl = `/uploads/${actualFileName}`
    window.open(viewUrl, "_blank")
  }

  const renderFilePreview = (message: Message) => {
    if (!message.fileUrl) return null

    const isImage = message.fileType?.startsWith("image/")
    const isAudio = message.fileType?.startsWith("audio/")
    const isVideo = message.fileType?.startsWith("video/")
    const isPDF = message.fileType === "application/pdf"

    return (
      <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded border">
        {isImage && (
          <div className="relative">
            <img
              src={message.fileUrl || "/placeholder.svg"}
              alt={message.fileName}
              className="max-w-xs max-h-48 rounded cursor-pointer"
              onClick={() => viewFile(message.fileUrl!, message.fileName!)}
            />
          </div>
        )}
        {isAudio && (
          <audio controls className="w-full max-w-xs">
            <source src={message.fileUrl} type={message.fileType} />
            Your browser does not support the audio element.
          </audio>
        )}
        {isVideo && (
          <video controls className="max-w-xs max-h-48 rounded">
            <source src={message.fileUrl} type={message.fileType} />
            Your browser does not support the video element.
          </video>
        )}
        {isPDF && (
          <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-900/20 rounded">
            <span className="text-red-600">📄</span>
            <span className="text-sm">PDF Document</span>
          </div>
        )}
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-gray-600 dark:text-gray-400">
            {message.fileName} ({((message.fileSize || 0) / 1024).toFixed(1)} KB)
          </span>
          <div className="flex gap-1">
            {(isImage || isPDF) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => viewFile(message.fileUrl!, message.fileName!)}
                className="h-6 px-2"
                title="View file"
              >
                <Eye className="h-3 w-3" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => downloadFile(message.fileUrl!, message.fileName!)}
              className="h-6 px-2"
              title="Download file"
            >
              <Download className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex h-screen ${isEmbedded ? "" : "bg-gray-50 dark:bg-gray-900"}`}>
      {/* Mobile Sidebar Overlay */}
      {!isEmbedded && sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      {!isEmbedded && (
        <div
          className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 fixed lg:relative z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-transform duration-300 ease-in-out`}
        >
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-lg">{channelName}</h2>
                <p className="text-sm text-gray-500">Channel ID: {channelId}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)} className="lg:hidden">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-4 w-4" />
              <span className="text-sm font-medium">Online ({onlineUsers.length})</span>
            </div>
            <div className="space-y-2">
              {onlineUsers.map((user) => (
                <div key={user.username} className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">{user.username}</span>
                  {user.isTyping && <span className="text-xs text-gray-500">typing...</span>}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto p-4 space-y-2">
            <Button variant="outline" size="sm" onClick={copyChannelLink} className="w-full">
              <Copy className="h-4 w-4 mr-2" />
              Copy Link
            </Button>
            <Button variant="outline" size="sm" onClick={exportChat} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Export Chat
            </Button>
            <Button variant="outline" size="sm" onClick={() => router.push("/")} className="w-full">
              <Home className="h-4 w-4 mr-2" />
              Home
            </Button>
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {!isEmbedded && (
              <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(true)} className="lg:hidden">
                <MoreVertical  className="h-4 w-4" />
              </Button>
            )}
            <div>
              <h1 className="font-semibold">{channelName}</h1>
              {typingUsers.length > 0 && (
                <p className="text-sm text-gray-500">
                  {typingUsers.map((u) => u.username).join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing...
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative hidden sm:block">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-32 sm:w-48"
              />
            </div>

            <Button variant="ghost" size="sm" onClick={() => setSoundEnabled(!soundEnabled)}>
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>

            <Button variant="ghost" size="sm" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="m-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex justify-between items-center">
              {error}
              <Button variant="ghost" size="sm" onClick={() => setError(null)}>
                <X className="h-4 w-4" />
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Messages */}
        <ScrollArea className="flex-1 p-2 sm:p-4">
          <div className="space-y-4">
            {filteredMessages.map((message) => (
              <div key={message.id} className="group">
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-semibold flex-shrink-0">
                    {message.username[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm truncate">{message.username}</span>
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-2 sm:p-3 shadow-sm border border-gray-200 dark:border-gray-700">
                      <p className="text-sm break-words">{message.content}</p>
                      {renderFilePreview(message)}
                    </div>

                    {/* Reactions */}
                    <div className="flex items-center gap-1 mt-2 flex-wrap">
                      {Object.entries(message.reactions || {}).map(([emoji, users]) => (
                        <Badge
                          key={emoji}
                          variant={users.includes(username) ? "default" : "secondary"}
                          className="cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 text-xs"
                          onClick={() => addReaction(message.id, emoji)}
                        >
                          {emoji} {users.length}
                        </Badge>
                      ))}

                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => addReaction(message.id, "👍")}
                          className="h-6 w-6 p-0"
                          title="Like"
                          disabled={isReacting}
                        >
                          <ThumbsUp className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => addReaction(message.id, "❤️")}
                          className="h-6 w-6 p-0"
                          title="Love"
                          disabled={isReacting}
                        >
                          <Heart className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => addReaction(message.id, "😊")}
                          className="h-6 w-6 p-0"
                          title="Smile"
                          disabled={isReacting}
                        >
                          <Smile className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* File Upload Preview */}
        {selectedFile && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-t border-yellow-200 dark:border-yellow-800 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm">📎 {selectedFile.name}</span>
                <span className="text-xs text-gray-500">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={uploadFile} disabled={isUploading}>
                  {isUploading ? "Uploading..." : "Send"}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setSelectedFile(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Message Input */}
        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-3 sm:p-4">
          <div className="flex gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.txt"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="flex-shrink-0"
              title="Attach file"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Input
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => handleTyping(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              className="flex-1"
            />
            <Button onClick={sendMessage} disabled={!newMessage.trim()} className="flex-shrink-0">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
