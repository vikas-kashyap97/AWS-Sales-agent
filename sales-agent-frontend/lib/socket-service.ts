import { io, type Socket } from "socket.io-client"
import { toast } from "@/hooks/use-toast"
import { type ConversationNode, parseNodeFromResponse } from "./conversation-flow"
import { getFallbackResponse } from "./fallback-responses"

export interface SocketMessage {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: string
  node?: ConversationNode | null
  metadata?: Record<string, any>
}

export interface SocketState {
  connected: boolean
  sessionId: string | null
  typing: boolean
  currentNode: ConversationNode | null
}

type MessageHandler = (message: SocketMessage) => void
type StateChangeHandler = (state: SocketState) => void

class SocketService {
  private socket: Socket | null = null
  private messageHandlers: MessageHandler[] = []
  private stateChangeHandlers: StateChangeHandler[] = []
  private state: SocketState = {
    connected: false,
    sessionId: null,
    typing: false,
    currentNode: null,
  }
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectTimeout: NodeJS.Timeout | null = null
  private retryCount = 0
  private maxRetries = 3
  private connectionAttempts = 0
  private maxConnectionAttempts = 3

  constructor() {
    this.initialize()
  }

  private initialize() {
    if (this.socket) {
      this.socket.disconnect()
    }

    // Get the WebSocket URL from environment variables
    const wsUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || "http://localhost:8000"
    console.log(`Connecting to WebSocket at: ${wsUrl}`)

    try {
      // Configure socket.io options
      const options = {
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
        timeout: 10000,
      }

      this.socket = io(wsUrl, options)
      this.setupEventListeners()

      // Log connection attempt
      console.log(`Socket.io connection attempt to ${wsUrl}`)
      this.connectionAttempts++
    } catch (error) {
      console.error("Error initializing socket:", error)
      this.handleConnectionFailure()
    }
  }

  private handleConnectionFailure() {
    if (this.connectionAttempts < this.maxConnectionAttempts) {
      console.log(`Connection attempt ${this.connectionAttempts} failed. Retrying in 3 seconds...`)
      setTimeout(() => {
        this.initialize()
      }, 3000)
    } else {
      console.error(`Failed to connect after ${this.maxConnectionAttempts} attempts`)
      toast({
        title: "Connection Failed",
        description: "Could not connect to the sales agent server. Please try again later.",
        variant: "destructive",
      })
    }
  }

  private setupEventListeners() {
    if (!this.socket) return

    // Handle successful connection
    this.socket.on("connect", () => {
      console.log("Socket connected successfully")
      this.updateState({ connected: true, typing: false })
      this.reconnectAttempts = 0
      this.connectionAttempts = 0
      toast({
        title: "Connected to sales agent",
        description: "You can now start chatting with our AI assistant.",
      })
    })

    // Handle connection error
    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error)
      this.handleConnectionFailure()
    })

    // Handle session ID
    this.socket.on("connected", (data) => {
      console.log("Session established:", data.sessionId)
      this.updateState({ sessionId: data.sessionId })
    })

    // Handle incoming messages
    this.socket.on("message", (data) => {
      console.log("Received message:", data)
      this.updateState({ typing: false })
      this.retryCount = 0

      // Parse node information from the response
      const node = parseNodeFromResponse(data.content)

      // Update current node in state
      if (node) {
        this.updateState({ currentNode: node })
      }

      const message: SocketMessage = {
        id: Date.now().toString(),
        content: data.content,
        role: "assistant",
        timestamp: data.timestamp || new Date().toISOString(),
        node: node,
        metadata: data.metadata || {},
      }

      this.notifyMessageHandlers(message)
    })

    // Handle typing indicator
    this.socket.on("typing", () => {
      this.updateState({ typing: true })
    })

    // Handle node changes
    this.socket.on("node_change", (data) => {
      if (data.node) {
        this.updateState({ currentNode: data.node })
      }
    })

    // Handle errors
    this.socket.on("error", (error) => {
      console.error("Socket error:", error)

      let errorMessage = "Something went wrong"

      // Try to extract a more specific error message if available
      if (typeof error === "object" && error !== null) {
        if (error.message) {
          errorMessage = error.message
        } else if (error.error && error.error.message) {
          errorMessage = error.error.message
        }
      }

      // Check if it's a grammar validation error
      const isGrammarError =
        typeof errorMessage === "string" &&
        (errorMessage.includes("grammar is not valid") || errorMessage.includes("properties field"))

      if (isGrammarError) {
        console.log("Grammar validation error detected, using fallback response")
      }

      toast({
        title: "Error",
        description: "The AI service encountered an issue. Using fallback responses.",
        variant: "destructive",
      })

      // Use fallback response based on current node
      const productId = this.getCurrentProductId()
      const fallbackResponse = getFallbackResponse(this.state.currentNode?.type || null, productId)

      // Create a fallback message
      const fallbackMessage: SocketMessage = {
        id: Date.now().toString(),
        content: fallbackResponse,
        role: "assistant",
        timestamp: new Date().toISOString(),
        node: this.state.currentNode,
      }

      // Notify message handlers with the fallback message
      this.notifyMessageHandlers(fallbackMessage)

      this.updateState({ typing: false })
    })

    // Handle disconnection
    this.socket.on("disconnect", () => {
      console.log("Socket disconnected")
      this.updateState({ connected: false })
      toast({
        title: "Disconnected",
        description: "Connection to the sales agent was lost.",
        variant: "destructive",
      })

      // Try to reconnect if not max attempts
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`)
        this.reconnectTimeout = setTimeout(() => {
          this.initialize()
        }, 3000)
      }
    })
  }

  private getCurrentProductId(): string | undefined {
    // Try to determine the current product from the last message metadata
    const lastMessages =
      this.messageHandlers.length > 0
        ? this.messageHandlers[0]({
            id: "",
            content: "",
            role: "assistant",
            timestamp: "",
            metadata: { _getLastMessages: true },
          })
        : undefined

    if (lastMessages && Array.isArray(lastMessages)) {
      for (let i = lastMessages.length - 1; i >= 0; i--) {
        const msg = lastMessages[i]
        if (msg.metadata && msg.metadata.productId) {
          return msg.metadata.productId
        }
      }
    }

    return undefined
  }

  private updateState(partialState: Partial<SocketState>) {
    this.state = { ...this.state, ...partialState }
    this.notifyStateChangeHandlers()
  }

  private notifyMessageHandlers(message: SocketMessage) {
    this.messageHandlers.forEach((handler) => handler(message))
  }

  private notifyStateChangeHandlers() {
    this.stateChangeHandlers.forEach((handler) => handler(this.state))
  }

  public retry(content: string | { content: string; metadata?: Record<string, any> }, metadata?: Record<string, any>) {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++
      console.log(`Retrying message (${this.retryCount}/${this.maxRetries})...`)

      setTimeout(() => {
        this.sendMessage(content, metadata)
      }, 1000 * this.retryCount) // Exponential backoff

      return true
    } else {
      this.retryCount = 0
      toast({
        title: "Error",
        description: "Maximum retry attempts reached. Please try again later.",
        variant: "destructive",
      })
      return false
    }
  }

  public sendMessage(
    content: string | { content: string; metadata?: Record<string, any> },
    metadata?: Record<string, any>,
  ): boolean {
    if (!this.socket || !this.state.connected) {
      toast({
        title: "Not connected",
        description: "Cannot send message while disconnected. Attempting to reconnect...",
        variant: "destructive",
      })

      // Try to reconnect
      this.initialize()
      return false
    }

    try {
      console.log("Sending message:", content, metadata)

      // Handle both string and object message formats
      if (typeof content === "object" && content !== null && "content" in content) {
        // If content is an object with content property
        this.socket.emit("message", content)
      } else if (typeof content === "string") {
        // If content is a string and metadata is provided
        if (metadata) {
          this.socket.emit("message", { content, metadata })
        } else {
          this.socket.emit("message", content)
        }
      }

      this.updateState({ typing: true })
      return true
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })
      return false
    }
  }

  public onMessage(handler: MessageHandler) {
    this.messageHandlers.push(handler)
    return () => {
      this.messageHandlers = this.messageHandlers.filter((h) => h !== handler)
    }
  }

  public onStateChange(handler: StateChangeHandler) {
    this.stateChangeHandlers.push(handler)
    handler(this.state) // Immediately notify with current state
    return () => {
      this.stateChangeHandlers = this.stateChangeHandlers.filter((h) => h !== handler)
    }
  }

  public getState() {
    return this.state
  }

  public disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }

    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }

    this.messageHandlers = []
    this.stateChangeHandlers = []
  }
}

// Singleton instance
export const socketService = new SocketService()

