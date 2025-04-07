// Types for conversation flow
export type NodeType =
  | "welcome"
  | "collect_name"
  | "collect_email"
  | "get_products"
  | "question_and_answer_node_for_product_details"
  | "schedule_demo"
  | "end_conversation"

export interface ConversationNode {
  type: NodeType
  data?: any
  required?: boolean
  validation?: (input: string) => boolean | string
}

export interface ConversationState {
  currentNode: ConversationNode | null
  completedNodes: NodeType[]
  pendingNodes: ConversationNode[]
  customerData: {
    name: string | null
    email: string | null
    productInterest: string[] | null
    demoDate: string | null
  }
}

// Validation functions
export const validators = {
  email: (input: string): boolean | string => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(input) || "Please enter a valid email address"
  },
  name: (input: string): boolean | string => {
    return input.length >= 2 || "Name must be at least 2 characters"
  },
  date: (input: string): boolean | string => {
    try {
      const date = new Date(input)
      const now = new Date()
      return date > now || "Please select a future date"
    } catch (e) {
      return "Please enter a valid date"
    }
  },
}

// Initial conversation flow
export const initialConversationFlow: ConversationNode[] = [
  { type: "welcome" },
  { type: "collect_name", required: true, validation: validators.name },
  { type: "collect_email", required: true, validation: validators.email },
  { type: "get_products", required: true },
  { type: "question_and_answer_node_for_product_details" },
  { type: "schedule_demo", validation: validators.date },
  { type: "end_conversation" },
]

// Initial state
export const initialConversationState: ConversationState = {
  currentNode: null,
  completedNodes: [],
  pendingNodes: [...initialConversationFlow],
  customerData: {
    name: null,
    email: null,
    productInterest: null,
    demoDate: null,
  },
}

// Helper functions for conversation flow
export function processNodeResponse(state: ConversationState, input: string): ConversationState {
  if (!state.currentNode) {
    return state
  }

  const newState = { ...state }
  const currentNode = state.currentNode

  // Validate input if needed
  if (currentNode.validation && currentNode.required) {
    const validationResult = currentNode.validation(input)
    if (typeof validationResult === "string") {
      // Invalid input, keep the same node but with validation error
      return {
        ...state,
        currentNode: {
          ...currentNode,
          data: { validationError: validationResult },
        },
      }
    }
  }

  // Process input based on node type
  switch (currentNode.type) {
    case "collect_name":
      newState.customerData.name = input
      break
    case "collect_email":
      newState.customerData.email = input
      break
    case "get_products":
      // Extract product interests from input
      const products = ["ec2", "s3", "rds", "dynamodb", "lambda"]
      const interests = products.filter((p) => input.toLowerCase().includes(p.toLowerCase()))
      newState.customerData.productInterest = interests.length > 0 ? interests : null
      break
    case "schedule_demo":
      newState.customerData.demoDate = input
      break
    default:
      break
  }

  // Mark current node as completed
  newState.completedNodes = [...newState.completedNodes, currentNode.type]

  // Move to next node if available
  if (newState.pendingNodes.length > 0) {
    newState.currentNode = newState.pendingNodes[0]
    newState.pendingNodes = newState.pendingNodes.slice(1)
  } else {
    newState.currentNode = null
  }

  return newState
}

// Function to parse node information from AI response
export function parseNodeFromResponse(response: string): ConversationNode | null {
  try {
    // Check for error indicators in the response
    if (
      response.includes("I apologize") ||
      response.includes("encountered an issue") ||
      response.includes("something went wrong")
    ) {
      // Return the current node to retry or continue the conversation
      return null
    }

    // Check for node type indicators in the response
    if (response.includes("[COLLECT_NAME]")) {
      return { type: "collect_name", required: true, validation: validators.name }
    } else if (response.includes("[COLLECT_EMAIL]")) {
      return { type: "collect_email", required: true, validation: validators.email }
    } else if (response.includes("[GET_PRODUCTS]")) {
      return { type: "get_products", required: true }
    } else if (response.includes("[SCHEDULE_DEMO]")) {
      return { type: "schedule_demo", validation: validators.date }
    } else if (response.includes("[END_CONVERSATION]")) {
      return { type: "end_conversation" }
    } else if (response.includes("[PRODUCT_QA]")) {
      return { type: "question_and_answer_node_for_product_details" }
    }

    // If no explicit node type is found, try to infer from content
    if (
      response.toLowerCase().includes("what's your name") ||
      response.toLowerCase().includes("may i know your name")
    ) {
      return { type: "collect_name", required: true, validation: validators.name }
    } else if (
      response.toLowerCase().includes("email address") ||
      response.toLowerCase().includes("what's your email")
    ) {
      return { type: "collect_email", required: true, validation: validators.email }
    } else if (
      response.toLowerCase().includes("what product") ||
      response.toLowerCase().includes("which aws product")
    ) {
      return { type: "get_products", required: true }
    } else if (
      response.toLowerCase().includes("schedule a demo") ||
      response.toLowerCase().includes("when would be a good time")
    ) {
      return { type: "schedule_demo", validation: validators.date }
    }

    // Default to null if no node type is found
    return null
  } catch (e) {
    console.error("Error parsing node from response:", e)
    return null
  }
}

// Function to determine the next node based on the current state
export function determineNextNode(state: ConversationState, input: string): NodeType {
  if (!state.currentNode) {
    return "welcome"
  }

  const currentNode = state.currentNode.type

  // Simple logic to determine next node
  switch (currentNode) {
    case "welcome":
      return "collect_name"
    case "collect_name":
      return "collect_email"
    case "collect_email":
      return "get_products"
    case "get_products":
      return "question_and_answer_node_for_product_details"
    case "question_and_answer_node_for_product_details":
      // Check if the input suggests scheduling a demo
      if (
        input.toLowerCase().includes("demo") ||
        input.toLowerCase().includes("schedule") ||
        input.toLowerCase().includes("appointment")
      ) {
        return "schedule_demo"
      }
      // Otherwise, stay in Q&A mode
      return "question_and_answer_node_for_product_details"
    case "schedule_demo":
      return "end_conversation"
    default:
      return "welcome"
  }
}

