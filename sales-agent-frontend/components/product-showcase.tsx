"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Server, Database, HardDrive, Cloud, MessageSquare } from "lucide-react"
import { useConversation } from "@/contexts/conversation-context"

const products = [
  {
    id: "ec2",
    name: "Amazon EC2",
    description: "Elastic Compute Cloud - Resizable compute capacity in the cloud",
    icon: <Server className="h-6 w-6" />,
    details:
      "Amazon EC2 is a web service that provides secure, resizable compute capacity in the cloud. It is designed to make web-scale cloud computing easier for developers.",
    features: [
      "Elastic Web-Scale Computing",
      "Completely Controlled",
      "Flexible Cloud Hosting Services",
      "Integrated",
      "Reliable",
      "Secure",
      "Inexpensive",
    ],
    questions: [
      "What EC2 instance type is best for my workload?",
      "How does EC2 pricing work?",
      "Can you explain EC2 Auto Scaling?",
    ],
  },
  {
    id: "s3",
    name: "Amazon S3",
    description: "Simple Storage Service - Object storage built to store and retrieve any amount of data",
    icon: <HardDrive className="h-6 w-6" />,
    details:
      "Amazon S3 is object storage built to store and retrieve any amount of data from anywhere – web sites and mobile apps, corporate applications, and data from IoT sensors or devices.",
    features: [
      "Industry-Leading Scalability",
      "99.999999999% Durability",
      "Comprehensive Security",
      "Flexible Management Features",
      "Query-in-Place",
    ],
    questions: [
      "What's the difference between S3 storage classes?",
      "How can I optimize S3 costs?",
      "Tell me about S3 security best practices",
    ],
  },
  {
    id: "rds",
    name: "Amazon RDS",
    description: "Relational Database Service - Set up, operate, and scale a relational database",
    icon: <Database className="h-6 w-6" />,
    details:
      "Amazon RDS makes it easy to set up, operate, and scale a relational database in the cloud. It provides cost-efficient and resizable capacity while automating time-consuming administration tasks.",
    features: ["Easy to Administer", "Highly Scalable", "Available and Durable", "Fast", "Secure", "Inexpensive"],
    questions: [
      "Which database engine should I choose for my application?",
      "How does RDS handle backups and recovery?",
      "Can you explain RDS Multi-AZ deployments?",
    ],
  },
  {
    id: "dynamodb",
    name: "Amazon DynamoDB",
    description: "Managed NoSQL database service with single-digit millisecond performance",
    icon: <Database className="h-6 w-6" />,
    details:
      "Amazon DynamoDB is a key-value and document database that delivers single-digit millisecond performance at any scale. It's a fully managed, multi-region, multi-active, durable database.",
    features: ["Serverless", "Performance at Scale", "Enterprise Ready", "Highly Available", "Automatic Scaling"],
    questions: [
      "How does DynamoDB differ from traditional SQL databases?",
      "What are DynamoDB partition keys and sort keys?",
      "Tell me about DynamoDB's capacity modes",
    ],
  },
  {
    id: "lambda",
    name: "AWS Lambda",
    description: "Run code without thinking about servers or clusters",
    icon: <Cloud className="h-6 w-6" />,
    details:
      "AWS Lambda lets you run code without provisioning or managing servers. You pay only for the compute time you consume - there is no charge when your code is not running.",
    features: [
      "No Servers to Manage",
      "Continuous Scaling",
      "Millisecond Metering",
      "Consistent Performance",
      "Code Compatibility",
    ],
    questions: [
      "What languages does Lambda support?",
      "How do I handle Lambda cold starts?",
      "Can you explain Lambda function concurrency?",
    ],
  },
]

export default function ProductShowcase() {
  const [selectedProduct, setSelectedProduct] = useState(products[0])
  const { sendMessage, customerInfo, isConnected } = useConversation()
  const [mounted, setMounted] = useState(false)

  // Set mounted state to true after component mounts to prevent hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  // Set the selected product based on conversation context
  useEffect(() => {
    if (customerInfo.interests.length > 0) {
      const productId = customerInfo.interests[0]
      const product = products.find((p) => p.id === productId)
      if (product) {
        setSelectedProduct(product)
      }
    }
  }, [customerInfo.interests])

  // Handle asking a question about a product
  const handleAskQuestion = (question: string) => {
    if (!isConnected) return

    console.log(`Asking question about ${selectedProduct.id}: ${question}`)

    // Send the question with metadata
    sendMessage({
      content: question,
      metadata: {
        nodeType: "question_and_answer_node_for_product_details",
        productId: selectedProduct.id,
      },
    })
  }

  // If not mounted yet, return a loading state or nothing to prevent hydration issues
  if (!mounted) {
    return <div className="p-4">Loading product information...</div>
  }

  return (
    <div className="p-4 h-full overflow-y-auto">
      <h2 className="text-2xl font-bold mb-4">AWS Products</h2>
      <Tabs
        defaultValue="ec2"
        value={selectedProduct.id}
        onValueChange={(value) => {
          const product = products.find((p) => p.id === value)
          if (product) setSelectedProduct(product)
        }}
      >
        <TabsList className="grid grid-cols-5 mb-4">
          {products.map((product) => (
            <TabsTrigger key={product.id} value={product.id} className="flex flex-col items-center py-2">
              {product.icon}
              <span className="mt-1 text-xs">{product.name.split(" ")[1]}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {products.map((product) => (
          <TabsContent key={product.id} value={product.id} className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  {product.icon}
                  <CardTitle>{product.name}</CardTitle>
                </div>
                <CardDescription>{product.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">{product.details}</p>
                <h4 className="font-semibold mb-2">Key Features:</h4>
                <ul className="list-disc pl-5 space-y-1 mb-6">
                  {product.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>

                {/* Common questions section */}
                <div className="mb-6">
                  <h4 className="font-semibold mb-2">Common Questions:</h4>
                  <div className="space-y-2">
                    {product.questions.map((question, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="w-full justify-start text-left h-auto py-2"
                        onClick={() => handleAskQuestion(question)}
                        disabled={!isConnected}
                      >
                        <MessageSquare className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span>{question}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

