'use client'

import { useState } from 'react'

/**
 * UserList Component - Displays and manages user data
 * Extracted from DataMasterModule for better maintainability
 */

interface User {
  id: string
  email: string
  created_at: string
  workspaces_count: number
  cards_count: number
  marketplace_items_count: number
  is_active: boolean
}

interface UserListProps {
  users: User[]
  loading: boolean
  onUserSelect: (userId: string) => void
  onViewRawData: (data: any, title: string) => void
}

export default function UserList({ users, loading, onUserSelect, onViewRawData }: UserListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3 text-gray-400">
          <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
          </svg>
          Loading users...
        </div>
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
        <p className="text-gray-500">No users found</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {users.map((user) => (
        <UserCard
          key={user.id}
          user={user}
          onUserSelect={onUserSelect}
          onViewRawData={onViewRawData}
        />
      ))}
    </div>
  )
}

/**
 * UserCard Component - Individual user card display
 * Extracted for reusability and cleaner code structure
 */
interface UserCardProps {
  user: User
  onUserSelect: (userId: string) => void
  onViewRawData: (data: any, title: string) => void
}

function UserCard({ user, onUserSelect, onViewRawData }: UserCardProps) {
  return (
    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-white truncate" title={user.email}>
            {user.email}
          </h3>
          <p className="text-xs text-gray-400 font-mono">
            ID: {user.id.slice(0, 8)}...
          </p>
        </div>
        <UserStatusIndicator isActive={user.is_active} />
      </div>
      
      <UserStats user={user} />

      <div className="flex gap-2 mt-4">
        <button
          onClick={() => onUserSelect(user.id)}
          className="flex-1 px-3 py-1.5 bg-blue-600/20 text-blue-400 text-sm rounded border border-blue-500/30 hover:bg-blue-600/30 transition-colors"
        >
          View Workspaces
        </button>
        <button
          onClick={() => onViewRawData(user, `User: ${user.email}`)}
          className="px-3 py-1.5 bg-gray-600/20 text-gray-400 text-sm rounded border border-gray-500/30 hover:bg-gray-600/30 transition-colors"
          title="View raw user data"
        >
          Raw Data
        </button>
      </div>
    </div>
  )
}

/**
 * UserStatusIndicator Component - Visual status indicator
 */
interface UserStatusIndicatorProps {
  isActive: boolean
}

function UserStatusIndicator({ isActive }: UserStatusIndicatorProps) {
  return (
    <div className="flex items-center gap-2">
      <div 
        className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-500'}`}
        title={isActive ? 'Active (last 7 days)' : 'Inactive'}
      />
      <span className={`text-xs ${isActive ? 'text-green-400' : 'text-gray-500'}`}>
        {isActive ? 'Active' : 'Inactive'}
      </span>
    </div>
  )
}

/**
 * UserStats Component - User statistics display
 */
interface UserStatsProps {
  user: User
}

function UserStats({ user }: UserStatsProps) {
  const stats = [
    { label: 'Workspaces', value: user.workspaces_count, color: 'text-blue-400' },
    { label: 'Cards', value: user.cards_count, color: 'text-green-400' },
    { label: 'Marketplace', value: user.marketplace_items_count, color: 'text-purple-400' }
  ]

  return (
    <div className="space-y-2 text-sm">
      {stats.map((stat) => (
        <div key={stat.label} className="flex justify-between items-center">
          <span className="text-gray-400">{stat.label}:</span>
          <span className={`font-medium ${stat.color}`}>
            {stat.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  )
}