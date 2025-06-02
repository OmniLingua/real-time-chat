// Shared in-memory storage for messages across all API routes
// This is a singleton that will be shared across all imports

// Message type definition
export interface Message {
  id: string
  username: string
  content: string
  timestamp: number
  channelId: string
  reactions: { [emoji: string]: string[] }
  fileUrl?: string
  fileName?: string
  fileType?: string
  fileSize?: number
}

// Global storage object
class MessageStore {
  private static instance: MessageStore
  private messages: { [channelId: string]: Message[] } = {}

  private constructor() {
    // Initialize with empty storage
  }

  public static getInstance(): MessageStore {
    if (!MessageStore.instance) {
      MessageStore.instance = new MessageStore()
    }
    return MessageStore.instance
  }

  public getMessages(channelId: string): Message[] {
    if (!this.messages[channelId]) {
      this.messages[channelId] = []
    }
    return [...this.messages[channelId]]
  }

  public addMessage(message: Message): void {
    const { channelId } = message
    if (!this.messages[channelId]) {
      this.messages[channelId] = []
    }

    // Ensure reactions object exists
    if (!message.reactions) {
      message.reactions = {}
    }

    this.messages[channelId].push(message)

    // Keep only last 100 messages per channel
    if (this.messages[channelId].length > 100) {
      this.messages[channelId] = this.messages[channelId].slice(-100)
    }
  }

  public updateMessage(channelId: string, messageId: string, updater: (message: Message) => Message): boolean {
    if (!this.messages[channelId]) {
      return false
    }

    const index = this.messages[channelId].findIndex((m) => m.id === messageId)
    if (index === -1) {
      return false
    }

    const message = this.messages[channelId][index]
    this.messages[channelId][index] = updater(message)
    return true
  }

  public getMessage(channelId: string, messageId: string): Message | undefined {
    if (!this.messages[channelId]) {
      return undefined
    }
    return this.messages[channelId].find((m) => m.id === messageId)
  }

  public getAllMessageIds(channelId: string): string[] {
    if (!this.messages[channelId]) {
      return []
    }
    return this.messages[channelId].map((m) => m.id)
  }

  // Debug method to log all messages in a channel
  public debugChannel(channelId: string): void {
    console.log(`Channel ${channelId} has ${this.messages[channelId]?.length || 0} messages`)
    if (this.messages[channelId]) {
      this.messages[channelId].forEach((m) => {
        console.log(`- Message ${m.id}: ${m.content.substring(0, 30)}...`)
      })
    }
  }
}

// Export the singleton instance
export const messageStore = MessageStore.getInstance()
