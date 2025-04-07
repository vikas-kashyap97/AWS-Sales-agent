"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useConversation } from "@/contexts/conversation-context"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

export default function ConversationAnalytics() {
  const { messages, customerInfo } = useConversation()
  const [activeTab, setActiveTab] = useState("overview")

  // Calculate message statistics
  const userMessages = messages.filter((m) => m.role === "user").length
  const aiMessages = messages.filter((m) => m.role === "assistant").length
  const totalMessages = messages.length

  // Calculate average message length
  const userMessageLengths = messages.filter((m) => m.role === "user").map((m) => m.content.length)
  const aiMessageLengths = messages.filter((m) => m.role === "assistant").map((m) => m.content.length)

  const avgUserMessageLength = userMessageLengths.length
    ? userMessageLengths.reduce((a, b) => a + b, 0) / userMessageLengths.length
    : 0
  const avgAiMessageLength = aiMessageLengths.length
    ? aiMessageLengths.reduce((a, b) => a + b, 0) / aiMessageLengths.length
    : 0

  // Prepare data for charts
  const messageCountData = [
    { name: "User", value: userMessages },
    { name: "AI", value: aiMessages },
  ]

  const messageLengthData = [
    { name: "User", value: Math.round(avgUserMessageLength) },
    { name: "AI", value: Math.round(avgAiMessageLength) },
  ]

  const COLORS = ["#0088FE", "#00C49F"]

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Conversation Analytics</CardTitle>
        <CardDescription>Insights from your conversation with the AWS Sales Assistant</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="customer">Customer</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <Card>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-2xl font-bold">{totalMessages}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-medium">User Messages</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-2xl font-bold">{userMessages}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-medium">AI Responses</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-2xl font-bold">{aiMessages}</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-medium">Message Distribution</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={messageCountData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {messageCountData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-medium">Avg. Message Length</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={messageLengthData}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8884d8">
                        {messageLengthData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="messages">
            <div className="space-y-4 mt-4">
              <Card>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-medium">Message Timeline</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  {messages.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No messages yet</p>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message, index) => (
                        <div key={message.id} className="flex items-start space-x-2">
                          <div
                            className={`w-2 h-2 mt-2 rounded-full ${message.role === "user" ? "bg-blue-500" : "bg-green-500"}`}
                          />
                          <div>
                            <div className="font-medium">{message.role === "user" ? "User" : "AI"}</div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </div>
                            <div className="mt-1 text-sm">
                              {message.content.length > 100
                                ? `${message.content.substring(0, 100)}...`
                                : message.content}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="customer">
            <div className="space-y-4 mt-4">
              <Card>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-medium">Customer Information</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm font-medium">Name</div>
                      <div>{customerInfo.name || "Not identified"}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Email</div>
                      <div>{customerInfo.email || "Not identified"}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Interests</div>
                      {customerInfo.interests.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mt-1">
                          {customerInfo.interests.map((interest) => (
                            <div key={interest} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded text-sm">
                              {interest.toUpperCase()}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div>No interests identified</div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

