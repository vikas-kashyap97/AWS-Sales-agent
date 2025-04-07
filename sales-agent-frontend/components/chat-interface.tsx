"use client"

import React, { useRef, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Bot, User, RefreshCw } from "lucide-react"
import { Card } from "@/components/ui/card"
import { useConversation } from "@/contexts/conversation-context"
import { cn } from "@/lib/utils"

export default function ChatInterface() {
  const { messages, sendMessage, isConnected, isTyping, clearMessages } = useConversation()
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [mounted, setMounted] = useState(false)
  const [errorCount, setErrorCount] = useState(0)

  // Set mounted state to true after component mounts to prevent hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  // Focus input when connected
  useEffect(() => {
    if (isConnected) {
      inputRef.current?.focus()
    }
  }, [isConnected])

  // Track error messages
  useEffect(() => {
    // Count error messages
    const errors = messages.filter(
      (m) =>
        m.role === "assistant" &&
        typeof m.content === "string" &&
        (m.content.includes("I apologize") ||
          m.content.includes("encountered an issue") ||
          m.content.includes("something went wrong")),
    ).length

    setErrorCount(errors)
  }, [messages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !isConnected) return

    sendMessage(input)
    setInput("")
  }

  const handleRestart = () => {
    clearMessages()
    setErrorCount(0)
    // Focus the input after clearing
    setTimeout(() => {
      inputRef.current?.focus()
    }, 0)
  }

  // Parse message content for any special formatting or links
  const renderMessageContent = (content: string | any) => {
    // Handle non-string content
    if (typeof content !== "string") {
      if (content && typeof content === "object") {
        // If it's an object with a content property, use that
        if ("content" in content && typeof content.content === "string") {
          content = content.content
        } else {
          // Otherwise stringify the object
          try {
            content = JSON.stringify(content)
          } catch (e) {
            content = "Error displaying message content"
          }
        }
      } else {
        // Convert to string if it's not an object
        content = String(content || "")
      }
    }

    // Check if the message is an error message
    const isErrorMessage =
      content.includes("I apologize") ||
      content.includes("encountered an issue") ||
      content.includes("something went wrong")

    // Simple regex to detect URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g
    const parts = content.split(urlRegex)

    return (
      <div className={isErrorMessage ? "text-amber-500 dark:text-amber-400" : ""}>
        {parts.map((part, index) => {
          if (part.match(urlRegex)) {
            return (
              <a
                key={index}
                href={part}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                {part}
              </a>
            )
          }
          // Handle line breaks
          return part.split("\n").map((line, i) => (
            <React.Fragment key={i}>
              {line}
              {i < part.split("\n").length - 1 && <br />}
            </React.Fragment>
          ))
        })}
      </div>
    )
  }

  // If not mounted yet, return a loading state or nothing to prevent hydration issues
  if (!mounted) {
    return (
      <div className="flex flex-col h-[calc(100vh-64px)]">
        <div className="p-4 flex-1 overflow-y-auto">
          <div className="h-full flex items-center justify-center">
            <div className="animate-pulse">Loading chat...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      <div className="p-4 flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center p-4">
            <div className="max-w-md">
              <Bot className="h-12 w-12 mx-auto mb-4 text-blue-500" />
              <h3 className="text-lg font-medium mb-2">AWS Sales Assistant</h3>
              <p className="text-muted-foreground mb-4">
                I can help you find the right AWS products for your needs, answer technical questions, and schedule
                demos.
              </p>
              <p className="text-sm text-muted-foreground">Try asking about EC2, S3, RDS, DynamoDB, or Lambda.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {errorCount > 2 && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md p-4 mb-4">
                <h4 className="text-amber-800 dark:text-amber-400 font-medium flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Backend Service Issues
                </h4>
                <p className="text-amber-700 dark:text-amber-300 mt-1 text-sm">
                  The AI service is experiencing some issues. You may see fallback responses instead of personalized
                  answers. You can continue the conversation or restart to try again.
                </p>
              </div>
            )}

            {messages.map((message) => (
              <div key={message.id} className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}>
                <div className="flex items-start max-w-[80%]">
                  {message.role === "assistant" && (
                    <div className="mr-2 mt-1">
                      <Bot className="h-6 w-6 text-blue-500" />
                    </div>
                  )}
                  <Card
                    className={cn(
                      "p-3",
                      message.role === "user" ? "bg-blue-500 text-white" : "bg-gray-100 dark:bg-gray-800",
                    )}
                  >
                    <div className="whitespace-pre-wrap">{renderMessageContent(message.content)}</div>
                  </Card>
                  {message.role === "user" && (
                    <div className="ml-2 mt-1">
                      <User className="h-6 w-6 text-blue-500" />
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-start max-w-[80%]">
                  <div className="mr-2 mt-1">
                    <Bot className="h-6 w-6 text-blue-500" />
                  </div>
                  <Card className="p-3 bg-gray-100 dark:bg-gray-800">
                    <div className="flex space-x-1">
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      ></div>
                    </div>
                  </Card>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      <div className="p-4 border-t">
        <div className="flex items-center space-x-2">
          {messages.length > 0 && (
            <Button variant="ghost" size="icon" onClick={handleRestart} title="Restart conversation">
              <RefreshCw className="h-4 w-4" />
              <span className="sr-only">Restart conversation</span>
            </Button>
          )}
          <form onSubmit={handleSendMessage} className="flex space-x-2 flex-1">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isConnected ? "Type your message..." : "Connecting..."}
              disabled={!isConnected}
              className="flex-1"
            />
            <Button type="submit" disabled={!isConnected || !input.trim()}>
              <Send className="h-4 w-4 mr-2" />
              Send
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

