import * as React from "react"

import { cn } from "@/lib/utils"

export function CardRoot({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={`border rounded shadow p-4 ${className}`}>{children}</div>
}

export function CardHeader({ children }: { children: React.ReactNode }) {
  return <div className="mb-4">{children}</div>
}

export function CardTitle({ children }: { children: React.ReactNode }) {
  return <div className="text-lg font-bold">{children}</div>
}

export function CardContent({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`text-sm ${className}`} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({ children }: { children: React.ReactNode }) {
  return <div className="mt-4">{children}</div>
}
