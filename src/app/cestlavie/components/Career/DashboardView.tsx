'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

interface JDRecord {
  id: string
  title: string
  company: string
  application_stage: string
  role_group: string
  firm_type: string
  match_score: number
  comment: string
  keywords_from_sentences: string
  created_time: string
  last_edited_time: string
}

export default function DashboardView() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [jdList, setJdList] = useState<JDRecord[]>([])
  const [filteredJdList, setFilteredJdList] = useState<JDRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Filter states
  const [filterStage, setFilterStage] = useState('')
  const [filterRole, setFilterRole] = useState('')
  const [filterFirm, setFilterFirm] = useState('')
  const [filterScore, setFilterScore] = useState('')

  // Fetch JD list on component mount
  useEffect(() => {
    fetchJDList()
  }, [])

  const fetchJDList = async () => {
    try {
      setLoading(true)
      setError('')
      
      const response = await fetch('/api/jd2cv/list')
      const data = await response.json()
      
      if (data.success) {
        setJdList(data.data)
        setFilteredJdList(data.data)
      } else {
        setError(data.error || 'Failed to fetch JD list')
      }
    } catch (err) {
      console.error('Error fetching JD list:', err)
      setError('Failed to fetch JD list. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Handle view JD - jump to Individual View with URL parameters
  const handleViewJD = (jd: JDRecord) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('view', 'individual')
    params.set('jdId', jd.id)
    params.set('title', jd.title)
    params.set('company', jd.company)
    
    router.push(`/cestlavie?${params.toString()}`)
  }

  // Filter and sort logic
  useEffect(() => {
    let filtered = [...jdList]
    
    // Apply filters
    if (filterStage) {
      filtered = filtered.filter(jd => jd.application_stage === filterStage)
    }
    if (filterRole) {
      filtered = filtered.filter(jd => jd.role_group === filterRole)
    }
    if (filterFirm) {
      filtered = filtered.filter(jd => jd.firm_type === filterFirm)
    }
    if (filterScore) {
      const [min, max] = filterScore.split('-').map(Number)
      filtered = filtered.filter(jd => {
        const score = jd.match_score || 0
        return score >= min && score <= max
      })
    }
    
    // Apply default sorting (score high to low)
    filtered.sort((a, b) => (b.match_score || 0) - (a.match_score || 0))
    
    setFilteredJdList(filtered)
  }, [jdList, filterStage, filterRole, filterFirm, filterScore])

  // Get unique values for filter options
  const getUniqueValues = (field: keyof JDRecord) => {
    return [...new Set(jdList.map(jd => jd[field]).filter(Boolean))]
  }

  // Render score with stars only (5-point scale)
  const renderScore = (score: number) => {
    if (!score) {
      return <span className="text-gray-400 text-xs">-</span>
    }
    
    const fullStars = Math.floor(score)
    const hasHalfStar = score % 1 !== 0
    const emptyStars = 5 - Math.ceil(score)
    
    return (
      <span className="text-xs text-gray-600">
        {'⭐'.repeat(fullStars)}
        {hasHalfStar ? '☆' : ''}
        {'☆'.repeat(emptyStars)}
      </span>
    )
  }


  // Render status with color coding (no background)
  const renderStatus = (status: string) => {
    if (!status.trim()) {
      return <span className="text-gray-400 text-xs">-</span>
    }
    
    return (
      <span className="text-purple-700 text-xs font-medium">
        {status}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-3">
        <div className="mb-3">
          <div className="h-5 bg-gray-200 rounded animate-pulse mb-1"></div>
          <div className="h-3 bg-gray-100 rounded animate-pulse w-32"></div>
        </div>
        
        {/* Skeleton table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-purple-50">
              <tr>
                <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-700">Title</th>
                <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-700">Company</th>
                <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-700">Stage</th>
                <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-700">Role</th>
                <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-700">Firm</th>
                <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-700">Score</th>
                <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-700">Comment</th>
                <th className="px-2 py-1.5 text-center text-xs font-medium text-gray-700">-</th>
              </tr>
            </thead>
            <tbody>
              {/* Skeleton rows */}
              {[...Array(5)].map((_, index) => (
                <tr key={index} className="border-b">
                  <td className="px-2 py-1.5">
                    <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                  </td>
                  <td className="px-2 py-1.5">
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-20"></div>
                  </td>
                  <td className="px-2 py-1.5">
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-16"></div>
                  </td>
                  <td className="px-2 py-1.5">
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-16"></div>
                  </td>
                  <td className="px-2 py-1.5">
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-16"></div>
                  </td>
                  <td className="px-2 py-1.5">
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-12"></div>
                  </td>
                  <td className="px-2 py-1.5">
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-24"></div>
                  </td>
                  <td className="px-2 py-1.5 text-center">
                    <div className="h-3 w-3 bg-gray-200 rounded animate-pulse mx-auto"></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-3">
        <div className="text-center text-purple-600">
          <p className="text-sm">{error}</p>
          <button 
            onClick={fetchJDList}
            className="mt-2 px-2.5 py-1 bg-purple-500 text-white rounded text-xs hover:bg-purple-600"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-3">
      {/* Header with integrated filters */}
      <div className="mb-4 flex items-start justify-between gap-4">
        {/* Left: Title and Count */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800">JD Dashboard</h3>
          <p className="text-gray-600 text-xs mt-0.5">
            {filteredJdList.length} job descriptions found
          </p>
        </div>

        {/* Right: Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Filters */}
          <span className="text-gray-700 font-medium">Filter:</span>
          
          {/* Stage Filter */}
          <select
            value={filterStage}
            onChange={(e) => setFilterStage(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-purple-500"
          >
            <option value="">Stage</option>
            {getUniqueValues('application_stage').map(stage => (
              <option key={stage} value={stage}>{stage}</option>
            ))}
          </select>

          {/* Role Filter */}
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-purple-500"
          >
            <option value="">Role</option>
            {getUniqueValues('role_group').map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>

          {/* Firm Filter */}
          <select
            value={filterFirm}
            onChange={(e) => setFilterFirm(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-purple-500"
          >
            <option value="">Firm</option>
            {getUniqueValues('firm_type').map(firm => (
              <option key={firm} value={firm}>{firm}</option>
            ))}
          </select>

          {/* Score Filter */}
          <select
            value={filterScore}
            onChange={(e) => setFilterScore(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-purple-500"
          >
            <option value="">Score</option>
            <option value="4-5">4-5分</option>
            <option value="3-4">3-4分</option>
            <option value="2-3">2-3分</option>
            <option value="1-2">1-2分</option>
            <option value="0-1">0-1分</option>
          </select>

          {/* Clear Filters */}
          {(filterStage || filterRole || filterFirm || filterScore) && (
            <button
              onClick={() => {
                setFilterStage('')
                setFilterRole('')
                setFilterFirm('')
                setFilterScore('')
              }}
              className="px-2 py-1 text-purple-600 hover:text-purple-800 hover:bg-purple-100 rounded transition-colors ml-2"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {filteredJdList.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-gray-500 text-sm">No job descriptions found.</p>
          <p className="text-gray-400 text-xs mt-0.5">
            Switch to Individual View to create your first JD.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-purple-50">
              <tr>
                <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-700">Title</th>
                <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-700">Company</th>
                <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-700">Stage</th>
                <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-700">Role</th>
                <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-700">Firm</th>
                <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-700">Score</th>
                <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-700">Comment</th>
                <th className="px-2 py-1.5 text-center text-xs font-medium text-gray-700">-</th>
              </tr>
            </thead>
            <tbody>
              {filteredJdList.map((jd, index) => (
                <tr 
                  key={jd.id} 
                  className={`border-b hover:bg-purple-50 cursor-pointer ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  }`}
                  onDoubleClick={() => handleViewJD(jd)}
                >
                  <td className="px-2 py-1.5 text-xs font-medium text-gray-900">
                    {jd.title || 'Untitled'}
                  </td>
                  <td className="px-2 py-1.5 text-xs text-gray-700">
                    {jd.company || 'No company'}
                  </td>
                  <td className="px-2 py-1.5">
                    {renderStatus(jd.application_stage)}
                  </td>
                  <td className="px-2 py-1.5">
                    {renderStatus(jd.role_group)}
                  </td>
                  <td className="px-2 py-1.5">
                    {renderStatus(jd.firm_type)}
                  </td>
                  <td className="px-2 py-1.5">
                    {renderScore(jd.match_score)}
                  </td>
                  <td className="px-2 py-1.5 text-xs text-gray-700 max-w-32">
                    {jd.comment ? (
                      <span title={jd.comment}>
                        {jd.comment.length > 25 ? jd.comment.substring(0, 25) + '...' : jd.comment}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-2 py-1.5 text-center">
                    <button
                      onClick={() => handleViewJD(jd)}
                      className="text-purple-500 hover:text-purple-700 hover:bg-purple-50 rounded-full p-1 transition-colors"
                      title="View JD details"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}