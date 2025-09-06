'use client'

import { createContext, useContext, ReactNode } from 'react'

interface AdminContextType {
  isAuthenticated: boolean
  masterKey: string
}

const AdminContext = createContext<AdminContextType | null>(null)

interface AdminProviderProps {
  children: ReactNode
  isAuthenticated: boolean
  masterKey: string
}

export function AdminProvider({ children, isAuthenticated, masterKey }: AdminProviderProps) {
  return (
    <AdminContext.Provider value={{ isAuthenticated, masterKey }}>
      {children}
    </AdminContext.Provider>
  )
}

export function useAdminContext() {
  const context = useContext(AdminContext)
  if (!context) {
    throw new Error('useAdminContext must be used within AdminProvider')
  }
  return context
}