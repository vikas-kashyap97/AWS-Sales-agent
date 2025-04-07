import type { Message } from "@/contexts/conversation-context"
import { type ConversationState, initialConversationState } from "./conversation-flow"

// Interface for session data
export interface SessionData {
  sessionId: string | null
  messages: Message[]
  conversationState: ConversationState
  customerInfo: {
    name: string | null
    email: string | null
    interests: string[]
  }
  lastUpdated: string
}

// Default session data
const defaultSessionData: SessionData = {
  sessionId: null,
  messages: [],
  conversationState: initialConversationState,
  customerInfo: {
    name: null,
    email: null,
    interests: [],
  },
  lastUpdated: new Date().toISOString(),
}

// Session service for managing session data
export class SessionService {
  private storageKey = "aws-sales-agent-session"

  // Save session data to local storage
  public saveSession(data: Partial<SessionData>): void {
    try {
      const currentData = this.getSession()
      const updatedData: SessionData = {
        ...currentData,
        ...data,
        lastUpdated: new Date().toISOString(),
      }

      localStorage.setItem(this.storageKey, JSON.stringify(updatedData))
    } catch (error) {
      console.error("Error saving session:", error)
    }
  }

  // Get session data from local storage
  public getSession(): SessionData {
    try {
      const data = localStorage.getItem(this.storageKey)
      if (!data) {
        return defaultSessionData
      }

      return JSON.parse(data) as SessionData
    } catch (error) {
      console.error("Error getting session:", error)
      return defaultSessionData
    }
  }

  // Clear session data
  public clearSession(): void {
    try {
      localStorage.removeItem(this.storageKey)
    } catch (error) {
      console.error("Error clearing session:", error)
    }
  }

  // Check if session exists
  public hasSession(): boolean {
    return !!localStorage.getItem(this.storageKey)
  }

  // Update specific session fields
  public updateSession(data: Partial<SessionData>): void {
    this.saveSession(data)
  }
}

// Create singleton instance
export const sessionService = new SessionService()

