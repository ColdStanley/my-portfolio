'use client'

import * as React from "react"
import { cn } from "@/lib/utils"

// Card 组件（严格遵循 Claude-UI.md 规范）
function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        // Claude-UI.md 规范：背景surface，质感导向
        "bg-[var(--surface)] rounded-lg shadow-md hover:shadow-lg",
        "border border-[var(--neutral-dark)]",
        "transition duration-200",
        // 16px内边距 (p-4 = 16px)
        "p-4",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex flex-col space-y-1.5 pb-4",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"h3">) {
  return (
    <h3
      className={cn(
        "text-lg font-semibold leading-none tracking-tight text-text-primary",
        className
      )}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      className={cn("text-sm text-text-secondary", className)}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("pt-0", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex items-center pt-4", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
}
