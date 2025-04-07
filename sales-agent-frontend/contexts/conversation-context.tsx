"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { socketService, type SocketMessage } from "@/lib/socket-service"
import {
  type ConversationNode,
  type ConversationState,
  initialConversationState,
  processNodeResponse,
} from "@/lib/conversation-flow"
import { sessionService } from "@/lib/session-service"

export interface Message extends SocketMessage {
  pending?: boolean
}

interface ConversationContextType {
  messages: Message[]
  sendMessage: (
    content: string | { content: string; metadata?: Record<string, any> },
    metadata?: Record<string, any>,
  ) => boolean
  isConnected: boolean
  isTyping: boolean
  sessionId: string | null
  clearMessages: () => void
  customerInfo: {
    name: string | null
    email: string | null
    interests: string[]
  }
  updateCustomerInfo: (info: Partial<ConversationContextType["customerInfo"]>) => void
  conversationState: ConversationState
  currentNode: ConversationNode | null
}

const ConversationContext = createContext<ConversationContextType | undefined>(undefined)

export function ConversationProvider({ children }: { children: React.ReactNode }) {
  // Load session data if available
  const savedSession = typeof window !== "undefined" ? sessionService.getSession() : null

  const [messages, setMessages] = useState<Message[]>(savedSession?.messages || [])
  const [socketState, setSocketState] = useState({
    connected: false,
    typing: false,
    sessionId: savedSession?.sessionId || (null as string | null),
    currentNode: null as ConversationNode | null,
  })

  const [customerInfo, setCustomerInfo] = useState(
    savedSession?.customerInfo || {
      name: null as string | null,
      email: null as string | null,
      interests: [] as string[],
    },
  )

  const [conversationState, setConversationState] = useState<ConversationState>(
    savedSession?.conversationState || initialConversationState,
  )

  // Save session data when state changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionService.updateSession({
        messages,
        conversationState,
        customerInfo,
        sessionId: socketState.sessionId,
      })
    }
  }, [messages, conversationState, customerInfo, socketState.sessionId])

  useEffect(() => {
    // Handle incoming messages
    const messageUnsubscribe = socketService.onMessage((message) => {
      console.log("Received message in context:", message)
      setMessages((prev) => {
        const newMessages = [...prev, message]
        return newMessages
      })

      // Update conversation state based on the message node
      if (message.node) {
        setConversationState((prevState) => {
          return {
            ...prevState,
            currentNode: message.node,
          }
        })
      }
    })

    // Handle socket state changes
    const stateUnsubscribe = socketService.onStateChange((state) => {
      setSocketState({
        connected: state.connected,
        typing: state.typing,
        sessionId: state.sessionId,
        currentNode: state.currentNode,
      })

      // Update conversation state with current node
      if (state.currentNode) {
        setConversationState((prevState) => {
          return {
            ...prevState,
            currentNode: state.currentNode,
          }
        })
      }
    })

    return () => {
      messageUnsubscribe()
      stateUnsubscribe()
    }
  }, [])

  // Add error handling for the conversation flow
  const sendMessage = useCallback(
    (content: string | { content: string; metadata?: Record<string, any> }, metadata?: Record<string, any>) => {
      console.log("Sending message:", content, metadata)

      if (socketService.sendMessage(content, metadata)) {
        // Add user message to the list
        let messageContent: string
        let messageMetadata: Record<string, any> | undefined

        if (typeof content === "object" && content !== null) {
          messageContent = content.content
          messageMetadata = content.metadata || metadata
        } else {
          messageContent = content
          messageMetadata = metadata
        }

        const userMessage: Message = {
          id: Date.now().toString(),
          content: messageContent,
          role: "user",
          timestamp: new Date().toISOString(),
          metadata: messageMetadata,
        }

        setMessages((prev) => [...prev, userMessage])

        // Process the message through the conversation flow
        if (conversationState.currentNode) {
          try {
            const newState = processNodeResponse(conversationState, messageContent)
            setConversationState(newState)
          } catch (error) {
            console.error("Error processing node response:", error)
            // Continue with conversation even if node processing fails
          }
        }

        return true
      }
      return false
    },
    [conversationState],
  )

  const clearMessages = useCallback(() => {
    setMessages([])
    setConversationState(initialConversationState)
    sessionService.clearSession()
  }, [])

  const updateCustomerInfo = useCallback((info: Partial<typeof customerInfo>) => {
    setCustomerInfo((prev) => ({ ...prev, ...info }))
  }, [])

  // Extract customer info from messages
  useEffect(() => {
    // This could be enhanced with more sophisticated parsing logic
    // based on your AI's response patterns
    for (const message of messages) {
      if (message.role === "user") {
        // Check for email patterns
        if (typeof message.content === "string") {
          const emailMatch = message.content.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/)
          if (emailMatch && !customerInfo.email) {
            updateCustomerInfo({ email: emailMatch[0] })
          }

          // Check for name patterns (simplified)
          const nameMatch = message.content.match(/my name is ([A-Za-z\s]+)/i)
          if (nameMatch && !customerInfo.name) {
            updateCustomerInfo({ name: nameMatch[1].trim() })
          }

          // Check for interests
          const interestKeywords = ["interested in", "looking for", "need help with"]
          for (const keyword of interestKeywords) {
            if (message.content.toLowerCase().includes(keyword)) {
              const products = ["ec2", "s3", "rds", "dynamodb", "lambda"]
              for (const product of products) {
                if (message.content.toLowerCase().includes(product) && !customerInfo.interests.includes(product)) {
                  updateCustomerInfo({
                    interests: [...customerInfo.interests, product],
                  })
                }
              }
            }
          }
        }
      }
    }
  }, [messages, customerInfo, updateCustomerInfo])

  return (
    <ConversationContext.Provider
      value={{
        messages,
        sendMessage,
        isConnected: socketState.connected,
        isTyping: socketState.typing,
        sessionId: socketState.sessionId,
        clearMessages,
        customerInfo,
        updateCustomerInfo,
        conversationState,
        currentNode: socketState.currentNode || conversationState.currentNode,
      }}
    >
      {children}
    </ConversationContext.Provider>
  )
}

export function useConversation() {
  const context = useContext(ConversationContext)
  if (context === undefined) {
    throw new Error("useConversation must be used within a ConversationProvider")
  }
  return context
}

