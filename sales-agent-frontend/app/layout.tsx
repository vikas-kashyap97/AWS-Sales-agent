import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/toaster"
import { ConversationProvider } from "@/contexts/conversation-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AWS Sales Agent",
  description: "AI-powered sales assistant for AWS products",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <ConversationProvider>
            {children}
            <Toaster />
          </ConversationProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'