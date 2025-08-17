'use client'

import { useMemo, useCallback } from 'react'

interface PlanRecord {
  id: string
  objective: string
  start_date: string
  due_date: string
  status: string
  priority_quadrant: string
  total_tasks: number
  completed_tasks: number
}

interface PlanTimeFilterProps {
  plans: PlanRecord[]
  selectedYear: number
  selectedMonth: 'all' | number
  onYearChange: (year: number) => void
  onMonthChange: (month: 'all' | number) => void
  onPlanClick?: (plan: PlanRecord) => void
}

export default function PlanTimeFilter({ 
  plans,
  selectedYear,
  selectedMonth,
  onYearChange,
  onMonthChange,
  onPlanClick
}: PlanTimeFilterProps) {
  
  // Generate available years from plans
  const availableYears = useMemo(() => {
    const years = new Set<number>()
    const currentYear = new Date().getFullYear()
    
    // Add current year and adjacent years
    years.add(currentYear - 1)
    years.add(currentYear)
    years.add(currentYear + 1)
    
    // Add years from plan dates
    plans.forEach(plan => {
      if (plan.start_date) {
        years.add(new Date(plan.start_date).getFullYear())
      }
      if (plan.due_date) {
        years.add(new Date(plan.due_date).getFullYear())
      }
    })
    
    return Array.from(years).sort((a, b) => a - b)
  }, [plans])
  
  // Month names for display
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ]
  
  // Filter plans by selected time period
  const filteredPlans = useMemo(() => {
    return plans.filter(plan => {
      if (!plan.start_date && !plan.due_date) return true
      
      const startDate = plan.start_date ? new Date(plan.start_date) : null
      const endDate = plan.due_date ? new Date(plan.due_date) : null
      
      // Check if plan overlaps with selected year
      const yearStart = new Date(selectedYear, 0, 1)
      const yearEnd = new Date(selectedYear, 11, 31)
      
      let isInYear = false
      if (startDate && endDate) {
        // Plan overlaps with selected year if either:
        // 1. It starts in the year, or
        // 2. It ends in the year, or  
        // 3. It spans across the year
        isInYear = (startDate <= yearEnd && endDate >= yearStart)
      } else if (startDate) {
        isInYear = startDate.getFullYear() === selectedYear
      } else if (endDate) {
        isInYear = endDate.getFullYear() === selectedYear
      }
      
      if (!isInYear) return false
      
      // If month is selected, filter by month
      if (selectedMonth !== 'all') {
        const monthStart = new Date(selectedYear, selectedMonth, 1)
        const monthEnd = new Date(selectedYear, selectedMonth + 1, 0)
        
        if (startDate && endDate) {
          return startDate <= monthEnd && endDate >= monthStart
        } else if (startDate) {
          return startDate.getMonth() === selectedMonth
        } else if (endDate) {
          return endDate.getMonth() === selectedMonth
        }
      }
      
      return true
    })
  }, [plans, selectedYear, selectedMonth])
  
  // Get plan count for current filter
  const planCount = filteredPlans.length
  
  // Calculate progress stats
  const progressStats = useMemo(() => {
    const totalTasks = filteredPlans.reduce((sum, plan) => sum + (plan.total_tasks || 0), 0)
    const completedTasks = filteredPlans.reduce((sum, plan) => sum + (plan.completed_tasks || 0), 0)
    const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    
    return {
      totalTasks,
      completedTasks,
      progressPercentage
    }
  }, [filteredPlans])
  
  // Format time period display
  const formatTimePeriod = useCallback(() => {
    if (selectedMonth === 'all') {
      return `${selectedYear} (All Year)`
    } else {
      return `${monthNames[selectedMonth]} ${selectedYear}`
    }
  }, [selectedYear, selectedMonth])

  return (
    <div className="bg-white rounded-lg border border-purple-200 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-purple-900">Plan Overview</h3>
        <div className="text-sm text-gray-600">
          {planCount} plans
        </div>
      </div>
      
      {/* Time Filters */}
      <div className="space-y-3 mb-4">
        {/* Year Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
          <select
            value={selectedYear}
            onChange={(e) => onYearChange(parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-purple-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
          >
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        
        {/* Month Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
          <div className="grid grid-cols-4 gap-1 mb-2">
            <button
              onClick={() => onMonthChange('all')}
              className={`px-2 py-1 text-xs rounded transition-colors col-span-4 ${
                selectedMonth === 'all'
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All Months
            </button>
          </div>
          <div className="grid grid-cols-4 gap-1">
            {monthNames.map((month, index) => (
              <button
                key={index}
                onClick={() => onMonthChange(index)}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  selectedMonth === index
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {month}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Current Filter Display */}
      <div className="bg-purple-50 rounded-lg p-3 mb-4">
        <div className="text-sm text-purple-700 font-medium">
          Viewing: {formatTimePeriod()}
        </div>
        <div className="text-xs text-purple-600 mt-1">
          {planCount} plans • {progressStats.completedTasks}/{progressStats.totalTasks} tasks ({progressStats.progressPercentage}%)
        </div>
      </div>
      
      {/* Plan List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredPlans.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-2xl mb-2">📋</div>
            <p className="text-sm">No plans in this period</p>
          </div>
        ) : (
          filteredPlans.map(plan => {
            const planProgress = plan.total_tasks > 0 
              ? Math.round((plan.completed_tasks / plan.total_tasks) * 100) 
              : 0
            
            return (
              <div
                key={plan.id}
                className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                onClick={() => onPlanClick && onPlanClick(plan)}
                title="Click to view details"
              >
                {/* Plan Title */}
                <div className="font-medium text-gray-900 text-sm mb-1 truncate">
                  {plan.objective || 'Untitled Plan'}
                </div>
                
                {/* Plan Meta */}
                <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                  <span className="px-2 py-0.5 bg-white rounded">
                    {plan.status || 'No Status'}
                  </span>
                  <span className="px-2 py-0.5 bg-white rounded">
                    {plan.priority_quadrant || 'No Priority'}
                  </span>
                </div>
                
                {/* Progress Bar */}
                <div className="mb-2">
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                    <span>{plan.completed_tasks}/{plan.total_tasks} tasks</span>
                    <span>{planProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-purple-500 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${planProgress}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* Dates */}
                {(plan.start_date || plan.due_date) && (
                  <div className="text-xs text-gray-500">
                    {plan.start_date && new Date(plan.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    {plan.start_date && plan.due_date && ' - '}
                    {plan.due_date && new Date(plan.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}