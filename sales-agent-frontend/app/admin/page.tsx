import Header from "@/components/header"
import ConversationAnalytics from "@/components/conversation-analytics"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AdminDashboard() {
  return (
    <main className="flex min-h-screen flex-col">
      <Header />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

        <Tabs defaultValue="analytics">
          <TabsList className="mb-4">
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Conversations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">24</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Avg. Conversation Length</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12 messages</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Demo Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">8</div>
                </CardContent>
              </Card>
            </div>

            <ConversationAnalytics />

            <Card>
              <CardHeader>
                <CardTitle>Popular Products</CardTitle>
                <CardDescription>Most discussed AWS products in conversations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>EC2</span>
                    <div className="w-2/3 bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                      <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: "70%" }}></div>
                    </div>
                    <span className="text-sm">70%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>S3</span>
                    <div className="w-2/3 bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                      <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: "55%" }}></div>
                    </div>
                    <span className="text-sm">55%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Lambda</span>
                    <div className="w-2/3 bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                      <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: "40%" }}></div>
                    </div>
                    <span className="text-sm">40%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>DynamoDB</span>
                    <div className="w-2/3 bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                      <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: "35%" }}></div>
                    </div>
                    <span className="text-sm">35%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>RDS</span>
                    <div className="w-2/3 bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                      <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: "30%" }}></div>
                    </div>
                    <span className="text-sm">30%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>AI Configuration</CardTitle>
                <CardDescription>Configure the AI sales agent behavior</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  This section would allow administrators to configure the AI agent's behavior, including conversation
                  flow, product information, and response templates.
                </p>
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Settings panel under development</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}

