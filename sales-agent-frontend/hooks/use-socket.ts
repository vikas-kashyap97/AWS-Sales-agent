"use client"

import { useEffect, useState, useCallback } from "react"
import { socketService, type SocketMessage, type SocketState } from "@/lib/socket-service"

export interface Message extends SocketMessage {
  // Add any additional fields we might need
  pending?: boolean
}

export function useSocket() {
  const [messages, setMessages] = useState<Message[]>([])
  const [socketState, setSocketState] = useState<SocketState>(socketService.getState())

  useEffect(() => {
    // Handle incoming messages
    const messageUnsubscribe = socketService.onMessage((message) => {
      setMessages((prev) => [...prev, message])
    })

    // Handle socket state changes
    const stateUnsubscribe = socketService.onStateChange((state) => {
      setSocketState(state)
    })

    return () => {
      messageUnsubscribe()
      stateUnsubscribe()
    }
  }, [])

  const sendMessage = useCallback((content: string) => {
    if (socketService.sendMessage(content)) {
      // Add user message to the list
      const userMessage: Message = {
        id: Date.now().toString(),
        content,
        role: "user",
        timestamp: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, userMessage])
      return true
    }
    return false
  }, [])

  const clearMessages = useCallback(() => {
    setMessages([])
  }, [])

  return {
    messages,
    sendMessage,
    clearMessages,
    isConnected: socketState.connected,
    isTyping: socketState.typing,
    sessionId: socketState.sessionId,
  }
}

