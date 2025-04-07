import { Button } from "@/components/ui/button"
import { ModeToggle } from "./mode-toggle"
import Link from "next/link"

export default function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <img src="/placeholder.svg?height=40&width=40" alt="AWS Logo" className="h-10 w-10" />
          <h1 className="text-xl font-bold">AWS Sales Assistant</h1>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/admin">
            <Button variant="outline" size="sm">
              Admin
            </Button>
          </Link>
          <Button variant="outline" size="sm">
            Documentation
          </Button>
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}

