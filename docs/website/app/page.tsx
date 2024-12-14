import { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "API Documentation",
  description: "Welcome to the API documentation",
}

export default function DocsPage() {
  return (
    <div className="container relative">
      <div className="mx-auto flex max-w-[980px] flex-col items-start gap-2">
        <h1 className="text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1]">
          API Documentation
        </h1>
        <p className="text-lg text-muted-foreground">
          Learn how to use our API and integrate it into your applications.
        </p>
      </div>
      <div className="mx-auto grid max-w-[980px] grid-cols-1 gap-4 py-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>
              Learn the basics and get started with our API.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="secondary" asChild>
              <Link href="/getting-started">Read More</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>API Reference</CardTitle>
            <CardDescription>
              Detailed documentation of all API endpoints.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="secondary" asChild>
              <Link href="/api">Explore API</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

