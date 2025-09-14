'use client'

import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import { ReactNode } from 'react'

interface DropdownMenuProps {
  children: ReactNode
}

interface DropdownMenuTriggerProps {
  children: ReactNode
  className?: string
}

interface DropdownMenuContentProps {
  children: ReactNode
  className?: string
}

interface DropdownMenuItemProps {
  children: ReactNode
  className?: string
  onClick?: () => void
}

export function DropdownMenu({ children }: DropdownMenuProps) {
  return (
    <DropdownMenuPrimitive.Root>
      {children}
    </DropdownMenuPrimitive.Root>
  )
}

export function DropdownMenuTrigger({ children, className }: DropdownMenuTriggerProps) {
  return (
    <DropdownMenuPrimitive.Trigger asChild className={className}>
      {children}
    </DropdownMenuPrimitive.Trigger>
  )
}

export function DropdownMenuContent({ children, className }: DropdownMenuContentProps) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        className={`${className} data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2`}
        sideOffset={4}
        align="end"
      >
        {children}
      </DropdownMenuPrimitive.Content>
    </DropdownMenuPrimitive.Portal>
  )
}

export function DropdownMenuItem({ children, className, onClick }: DropdownMenuItemProps) {
  return (
    <DropdownMenuPrimitive.Item
      className={className}
      onClick={onClick}
    >
      {children}
    </DropdownMenuPrimitive.Item>
  )
}