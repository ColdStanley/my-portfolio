'use client'

/**
 * WorkspaceList Component - Displays and manages workspace data
 * Extracted from DataMasterModule for better maintainability
 */

interface Workspace {
  id: string
  name: string
  user_id: string
  created_at: string
  user_info: {
    email: string
  }
  card_analysis: {
    totalCards: number
    passwordProtectedCards: number
  }
}

interface WorkspaceListProps {
  workspaces: Workspace[]
  loading: boolean
  selectedUser: string | null
  onClearUserFilter: () => void
  onViewDetails: (data: any, title: string) => void
}

export default function WorkspaceList({ 
  workspaces, 
  loading, 
  selectedUser, 
  onClearUserFilter, 
  onViewDetails 
}: WorkspaceListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3 text-gray-400">
          <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
          </svg>
          Loading workspaces...
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {selectedUser && (
        <UserFilterHeader selectedUser={selectedUser} onClear={onClearUserFilter} />
      )}
      
      {workspaces.length === 0 ? (
        <EmptyWorkspaceState selectedUser={selectedUser} />
      ) : (
        <div className="space-y-3">
          {workspaces.map((workspace) => (
            <WorkspaceCard
              key={workspace.id}
              workspace={workspace}
              onViewDetails={onViewDetails}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * UserFilterHeader Component - Shows current user filter with clear option
 */
interface UserFilterHeaderProps {
  selectedUser: string
  onClear: () => void
}

function UserFilterHeader({ selectedUser, onClear }: UserFilterHeaderProps) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <button
        onClick={onClear}
        className="text-gray-400 hover:text-white transition-colors"
        title="Show all workspaces"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <span className="text-gray-400">Showing workspaces for: </span>
      <span className="text-white font-mono text-sm bg-gray-800 px-2 py-1 rounded">
        {selectedUser.slice(0, 8)}...
      </span>
      <button
        onClick={onClear}
        className="text-gray-500 hover:text-gray-300 text-xs transition-colors"
      >
        (clear filter)
      </button>
    </div>
  )
}

/**
 * EmptyWorkspaceState Component - Empty state display
 */
interface EmptyWorkspaceStateProps {
  selectedUser: string | null
}

function EmptyWorkspaceState({ selectedUser }: EmptyWorkspaceStateProps) {
  return (
    <div className="text-center py-12">
      <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
      <p className="text-gray-500">
        {selectedUser 
          ? 'No workspaces found for this user' 
          : 'No workspaces found'
        }
      </p>
    </div>
  )
}

/**
 * WorkspaceCard Component - Individual workspace display
 */
interface WorkspaceCardProps {
  workspace: Workspace
  onViewDetails: (data: any, title: string) => void
}

function WorkspaceCard({ workspace, onViewDetails }: WorkspaceCardProps) {
  return (
    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <WorkspaceHeader workspace={workspace} />
          <WorkspaceMetadata workspace={workspace} />
          <WorkspaceStats workspace={workspace} />
        </div>
        <button
          onClick={() => onViewDetails(workspace, `Workspace: ${workspace.name}`)}
          className="px-3 py-1.5 bg-gray-600/20 text-gray-400 text-sm rounded border border-gray-500/30 hover:bg-gray-600/30 transition-colors ml-4"
        >
          View Details
        </button>
      </div>
    </div>
  )
}

/**
 * WorkspaceHeader Component - Workspace title and basic info
 */
function WorkspaceHeader({ workspace }: { workspace: Workspace }) {
  return (
    <div className="mb-2">
      <h3 className="font-medium text-white truncate" title={workspace.name}>
        {workspace.name}
      </h3>
      <p className="text-xs text-gray-400 font-mono">
        ID: {workspace.id.slice(0, 8)}...
      </p>
    </div>
  )
}

/**
 * WorkspaceMetadata Component - Owner and creation date
 */
function WorkspaceMetadata({ workspace }: { workspace: Workspace }) {
  return (
    <p className="text-sm text-gray-400 mt-1 mb-3">
      Owner: <span className="text-gray-300">{workspace.user_info.email}</span> • 
      Created: <span className="text-gray-300">
        {new Date(workspace.created_at).toLocaleDateString()}
      </span>
    </p>
  )
}

/**
 * WorkspaceStats Component - Cards and security statistics
 */
function WorkspaceStats({ workspace }: { workspace: Workspace }) {
  const stats = [
    {
      label: 'Cards',
      value: workspace.card_analysis.totalCards,
      color: 'text-blue-400'
    },
    {
      label: 'Protected',
      value: workspace.card_analysis.passwordProtectedCards,
      color: workspace.card_analysis.passwordProtectedCards > 0 ? 'text-red-400' : 'text-gray-400',
      highlight: workspace.card_analysis.passwordProtectedCards > 0
    }
  ]

  return (
    <div className="flex gap-4 text-sm">
      {stats.map((stat) => (
        <div key={stat.label} className="flex items-center gap-1">
          <span className="text-gray-400">{stat.label}:</span>
          <span className={`font-medium ${stat.color}`}>
            {stat.value}
          </span>
          {stat.highlight && (
            <svg className="w-3 h-3 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          )}
        </div>
      ))}
    </div>
  )
}