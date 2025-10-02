'use client'

import { theme } from '@/styles/theme.config'
import { Query } from '../store/useArticleStore'

interface FilterPanelProps {
  queries: Query[]
  selectedLabel: string
  onFilterChange: (label: string) => void
}

export default function FilterPanel({
  queries,
  selectedLabel,
  onFilterChange,
}: FilterPanelProps) {
  // 提取所有唯一的 prompt labels
  const uniqueLabels = Array.from(
    new Set(queries.map((q) => q.prompt_label))
  ).sort()

  return (
    <div className="mb-4 flex items-center gap-3">
      <label
        className="text-sm font-medium"
        style={{ color: theme.textPrimary }}
      >
        Filter by Type:
      </label>
      <select
        value={selectedLabel}
        onChange={(e) => onFilterChange(e.target.value)}
        className="h-9 rounded-lg border px-3 text-sm transition-all duration-200 focus:outline-none focus:ring-2"
        style={{
          borderColor: theme.neutralDark,
          backgroundColor: theme.background,
          color: theme.textPrimary,
        }}
      >
        <option value="">All ({queries.length})</option>
        {uniqueLabels.map((label) => {
          const count = queries.filter((q) => q.prompt_label === label).length
          return (
            <option key={label} value={label}>
              {label} ({count})
            </option>
          )
        })}
      </select>
    </div>
  )
}
