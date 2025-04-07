import ChatInterface from "@/components/chat-interface"
import Header from "@/components/header"
import ProductShowcase from "@/components/product-showcase"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-col md:flex-row flex-1">
        <div className="w-full md:w-1/2 lg:w-3/5 flex-grow">
          <ChatInterface />
        </div>
        <div className="w-full md:w-1/2 lg:w-2/5 bg-slate-50 dark:bg-gray-900">
          <ProductShowcase />
        </div>
      </div>
    </main>
  )
}

