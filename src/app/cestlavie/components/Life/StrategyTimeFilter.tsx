'use client'

import { useMemo, useCallback } from 'react'

interface StrategyRecord {
  id: string
  objective: string
  start_date: string
  due_date: string
  status: string
  category: string
  priority_quadrant: string
}

interface StrategyTimeFilterProps {
  strategies: StrategyRecord[]
  selectedYear: number
  selectedQuarter: 'all' | 'Q1' | 'Q2' | 'Q3' | 'Q4'
  onYearChange: (year: number) => void
  onQuarterChange: (quarter: 'all' | 'Q1' | 'Q2' | 'Q3' | 'Q4') => void
  onStrategyClick?: (strategy: StrategyRecord) => void
}

export default function StrategyTimeFilter({ 
  strategies,
  selectedYear,
  selectedQuarter,
  onYearChange,
  onQuarterChange,
  onStrategyClick
}: StrategyTimeFilterProps) {
  
  // Generate available years from strategies
  const availableYears = useMemo(() => {
    const years = new Set<number>()
    const currentYear = new Date().getFullYear()
    
    // Add current year and adjacent years
    years.add(currentYear - 1)
    years.add(currentYear)
    years.add(currentYear + 1)
    
    // Add years from strategy dates
    strategies.forEach(strategy => {
      if (strategy.start_date) {
        years.add(new Date(strategy.start_date).getFullYear())
      }
      if (strategy.due_date) {
        years.add(new Date(strategy.due_date).getFullYear())
      }
    })
    
    return Array.from(years).sort((a, b) => a - b)
  }, [strategies])
  
  // Filter strategies by selected time period
  const filteredStrategies = useMemo(() => {
    return strategies.filter(strategy => {
      if (!strategy.start_date && !strategy.due_date) return true
      
      const startDate = strategy.start_date ? new Date(strategy.start_date) : null
      const endDate = strategy.due_date ? new Date(strategy.due_date) : null
      
      // Check if strategy overlaps with selected year
      const yearStart = new Date(selectedYear, 0, 1)
      const yearEnd = new Date(selectedYear, 11, 31)
      
      let isInYear = false
      if (startDate && endDate) {
        // Strategy overlaps with selected year if either:
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
      
      // If quarter is selected, filter by quarter
      if (selectedQuarter !== 'all') {
        const quarterMonths = {
          'Q1': [0, 1, 2],    // Jan, Feb, Mar
          'Q2': [3, 4, 5],    // Apr, May, Jun
          'Q3': [6, 7, 8],    // Jul, Aug, Sep
          'Q4': [9, 10, 11]   // Oct, Nov, Dec
        }
        
        const qMonths = quarterMonths[selectedQuarter]
        const quarterStart = new Date(selectedYear, qMonths[0], 1)
        const quarterEnd = new Date(selectedYear, qMonths[2] + 1, 0)
        
        if (startDate && endDate) {
          return startDate <= quarterEnd && endDate >= quarterStart
        } else if (startDate) {
          return qMonths.includes(startDate.getMonth())
        } else if (endDate) {
          return qMonths.includes(endDate.getMonth())
        }
      }
      
      return true
    })
  }, [strategies, selectedYear, selectedQuarter])
  
  // Get strategy count for current filter
  const strategyCount = filteredStrategies.length
  
  // Format time period display
  const formatTimePeriod = useCallback(() => {
    if (selectedQuarter === 'all') {
      return `${selectedYear} (All Year)`
    } else {
      const quarterNames = {
        'Q1': 'Q1 (Jan-Mar)',
        'Q2': 'Q2 (Apr-Jun)', 
        'Q3': 'Q3 (Jul-Sep)',
        'Q4': 'Q4 (Oct-Dec)'
      }
      return `${selectedYear} ${quarterNames[selectedQuarter]}`
    }
  }, [selectedYear, selectedQuarter])

  return (
    <div className="bg-white rounded-lg border border-purple-200 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-purple-900">Strategy Timeline</h3>
        <div className="text-sm text-gray-600">
          {strategyCount} strategies
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
        
        {/* Quarter Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
          <div className="grid grid-cols-5 gap-1">
            <button
              onClick={() => onQuarterChange('all')}
              className={`px-2 py-2 text-xs rounded transition-colors ${
                selectedQuarter === 'all'
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {['Q1', 'Q2', 'Q3', 'Q4'].map(quarter => (
              <button
                key={quarter}
                onClick={() => onQuarterChange(quarter as 'Q1' | 'Q2' | 'Q3' | 'Q4')}
                className={`px-2 py-2 text-xs rounded transition-colors ${
                  selectedQuarter === quarter
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {quarter}
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
          {strategyCount} strategies in this period
        </div>
      </div>
      
      {/* Strategy List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredStrategies.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-2xl mb-2">📊</div>
            <p className="text-sm">No strategies in this period</p>
          </div>
        ) : (
          filteredStrategies.map(strategy => (
            <div
              key={strategy.id}
              className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
              onClick={() => onStrategyClick && onStrategyClick(strategy)}
              title="Click to view details"
            >
              {/* Strategy Title */}
              <div className="font-medium text-gray-900 text-sm mb-1 truncate">
                {strategy.objective || 'Untitled Strategy'}
              </div>
              
              {/* Strategy Meta */}
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <span className="px-2 py-0.5 bg-white rounded">
                  {strategy.status || 'No Status'}
                </span>
                <span className="px-2 py-0.5 bg-white rounded">
                  {strategy.category || 'No Category'}
                </span>
              </div>
              
              {/* Dates */}
              {(strategy.start_date || strategy.due_date) && (
                <div className="text-xs text-gray-500 mt-1">
                  {strategy.start_date && new Date(strategy.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  {strategy.start_date && strategy.due_date && ' - '}
                  {strategy.due_date && new Date(strategy.due_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}