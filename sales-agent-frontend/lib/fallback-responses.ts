// Fallback responses when the AI service fails
export const fallbackResponses = {
  welcome:
    "Hello! I'm your AWS sales assistant. I can help you find the right AWS products for your needs. What's your name?",

  collect_name: "Nice to meet you! Could you please tell me your email address so I can follow up with you?",

  collect_email:
    "Thank you for providing your email. What AWS products are you interested in? We offer EC2, S3, RDS, DynamoDB, and Lambda.",

  get_products: "Great choice! What would you like to know about these products?",

  question_and_answer_node_for_product_details: {
    ec2: "Amazon EC2 (Elastic Compute Cloud) provides resizable compute capacity in the cloud. EC2 pricing is based on several factors:\n\n1. Instance type (CPU, memory, storage)\n2. Region\n3. Operating system\n4. Purchase option (On-Demand, Reserved, Spot)\n5. Data transfer\n\nOn-Demand instances are billed by the second with no long-term commitments. Reserved Instances offer significant discounts (up to 72%) for 1 or 3-year terms. Spot Instances allow you to bid on unused EC2 capacity for up to 90% off the On-Demand price.",

    s3: "Amazon S3 (Simple Storage Service) is object storage built to store and retrieve any amount of data. S3 offers a range of storage classes designed for different use cases:\n\n1. S3 Standard - for frequently accessed data\n2. S3 Intelligent-Tiering - for data with unknown or changing access patterns\n3. S3 Standard-IA - for infrequently accessed data\n4. S3 One Zone-IA - for infrequently accessed data that doesn't require multiple Availability Zone resilience\n5. S3 Glacier - for long-term archive and digital preservation\n6. S3 Glacier Deep Archive - for long-term archive and digital preservation at the lowest cost",

    rds: "Amazon RDS (Relational Database Service) makes it easy to set up, operate, and scale a relational database in the cloud. RDS supports multiple database engines including MySQL, PostgreSQL, MariaDB, Oracle, and SQL Server.\n\nRDS Multi-AZ deployments provide enhanced availability and durability by automatically provisioning and maintaining a synchronous standby replica in a different Availability Zone. In case of infrastructure failure, RDS automatically fails over to the standby without manual intervention.",

    dynamodb:
      "Amazon DynamoDB is a fully managed NoSQL database service that provides fast and predictable performance with seamless scalability. Unlike traditional SQL databases, DynamoDB uses a key-value data model with optional document support.\n\nIn DynamoDB, partition keys are used to distribute data across partitions for scalability, while sort keys allow you to sort data within a partition. This combination enables efficient queries and helps organize related data together.",

    lambda:
      "AWS Lambda is a serverless compute service that lets you run code without provisioning or managing servers. Lambda supports multiple programming languages including Node.js, Python, Java, Go, Ruby, and .NET.\n\nTo handle Lambda cold starts (the latency that occurs when a new execution environment is created), you can use provisioned concurrency, which keeps functions initialized and ready to respond. You can also optimize your code by minimizing dependencies and using efficient programming practices.",
  },

  schedule_demo:
    "I'd be happy to schedule a demo for you. When would be a good time? Please provide a date and time that works for you.",

  error: "I apologize, but I encountered an issue. Please try again or ask a different question.",
}

// Function to get a fallback response based on the current node and product
export function getFallbackResponse(nodeType: string | null, productId?: string): string {
  switch (nodeType) {
    case "welcome":
      return fallbackResponses.welcome
    case "collect_name":
      return fallbackResponses.collect_name
    case "collect_email":
      return fallbackResponses.collect_email
    case "get_products":
      return fallbackResponses.get_products
    case "question_and_answer_node_for_product_details":
      if (productId && productId in fallbackResponses.question_and_answer_node_for_product_details) {
        return fallbackResponses.question_and_answer_node_for_product_details[
          productId as keyof typeof fallbackResponses.question_and_answer_node_for_product_details
        ]
      }
      return "I'd be happy to answer your questions about AWS products. What specific information are you looking for?"
    case "schedule_demo":
      return fallbackResponses.schedule_demo
    default:
      return fallbackResponses.error
  }
}

