'use client'

import { useEffect, useState } from 'react'

export default function PreviewPage() {
  const [data, setData] = useState({ jd: [], cv: {} })

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const previewId = urlParams.get('id')
    const dataParam = urlParams.get('data')
    
    if (previewId) {
      try {
        const storedData = localStorage.getItem(`previewData_${previewId}`)
        if (storedData) {
          const parsedData = JSON.parse(storedData)
          setData(parsedData)
        } else {
          console.error('Preview data not found in localStorage')
          setData({ jd: [], cv: {}, error: 'Preview data expired or not found' })
        }
      } catch (error) {
        console.error('Failed to parse preview data:', error)
        setData({ jd: [], cv: {}, error: 'Failed to load preview data' })
      }
    } else if (dataParam) {
      try {
        const parsedData = JSON.parse(decodeURIComponent(dataParam))
        setData(parsedData)
      } catch (error) {
        console.error('Failed to parse URL preview data:', error)
        setData({ jd: [], cv: {}, error: 'Failed to parse preview data' })
      }
    } else {
      setData({ jd: [], cv: {}, error: 'No preview data provided' })
    }
  }, [])

  const formatDisplayTime = (dateStr: string) => {
    if (!dateStr) return ''
    const parts = dateStr.split(' - ')
    if (parts.length === 2) {
      const startYear = new Date(parts[0].trim()).getFullYear()
      const endYear = new Date(parts[1].trim()).getFullYear()
      return `${startYear} - ${endYear}`
    }
    const year = new Date(dateStr).getFullYear()
    return year.toString() || dateStr
  }

  const [downloadStatus, setDownloadStatus] = useState('')
  const handleDownloadPDF = async () => {
    try {
      setDownloadStatus('Generating PDF...')
      const response = await fetch('/api/cv-export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data })
      })
      if (response.ok) {
        setDownloadStatus('Downloading...')
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = 'cv-preview.pdf'
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        setDownloadStatus('Downloaded!')
        setTimeout(() => setDownloadStatus(''), 2000)
      }
    } catch (error) {
      console.error('Failed to download PDF:', error)
      setDownloadStatus('Failed to download')
      setTimeout(() => setDownloadStatus(''), 2000)
    }
  }

  if (data.error) {
    return (
      <div className="bg-gray-50 p-8 min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-sm border border-red-200">
          <h1 className="text-xl font-bold text-red-600 mb-4">Preview Error</h1>
          <p className="text-gray-700">{data.error}</p>
          <button 
            onClick={() => window.close()} 
            className="mt-4 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 p-8 min-h-screen max-h-none overflow-auto">
      <div className="mb-6 flex justify-end">
        <button
          onClick={handleDownloadPDF}
          disabled={downloadStatus && downloadStatus !== 'Downloaded!' && downloadStatus !== 'Failed to download'}
          className={`min-w-32 px-6 py-3 rounded-lg font-medium transition-all duration-200 transform active:scale-95 ${
            downloadStatus && downloadStatus !== 'Downloaded!' && downloadStatus !== 'Failed to download'
              ? 'bg-purple-300 cursor-not-allowed text-white'
              : downloadStatus === 'Downloaded!'
              ? 'bg-purple-800 text-white shadow-lg'
              : downloadStatus === 'Failed to download'
              ? 'bg-purple-400 text-white shadow-lg'
              : 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl'
          }`}
        >
          {downloadStatus || 'Download PDF'}
        </button>
      </div>
      {data.jd && data.jd.length > 0 && (
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-purple-900 mb-6">Job Description Breakdown & Match</h1>
          {data.jd.map((item: any) => (
            <div key={item.id} className="mb-8">
              <div className="bg-white rounded-lg shadow-sm border-2 border-purple-300 p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-purple-900 mb-1">{item.position_title || 'Untitled Position'}</h3>
                    <p className="text-sm text-gray-600">{item.company || 'Unknown Company'}</p>
                  </div>
                  <div className="bg-gradient-to-r from-purple-500 to-purple-700 px-8 py-4 rounded-xl shadow-lg">
                    <div className="text-center text-2xl font-bold text-white">
                      Fit Score: {item.fit_score || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div className="bg-white rounded-lg shadow-sm border border-purple-200 p-6">
                  <h4 className="text-lg font-semibold text-purple-700 mb-4">Responsibilities Breakdown</h4>
                  {item.jd_responsibilities_mindmap && item.jd_responsibilities_mindmap.length > 0 ? (
                    <div className="space-y-4">
                      {item.jd_responsibilities_mindmap.map((file: any, index: number) => (
                        <img 
                          key={index} 
                          src={file.url} 
                          alt={file.name} 
                          className="w-full rounded max-h-80 object-contain shadow-sm"
                          onError={(e) => { e.currentTarget.style.display = 'none' }}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">No mindmap available</div>
                  )}
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-purple-200 p-6">
                  <h4 className="text-lg font-semibold text-purple-700 mb-4">Requirements Breakdown</h4>
                  {item.jd_requirements_mindmap && item.jd_requirements_mindmap.length > 0 ? (
                    <div className="space-y-4">
                      {item.jd_requirements_mindmap.map((file: any, index: number) => (
                        <img 
                          key={index} 
                          src={file.url} 
                          alt={file.name} 
                          className="w-full rounded max-h-80 object-contain shadow-sm"
                          onError={(e) => { e.currentTarget.style.display = 'none' }}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">No mindmap available</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {data.cv && Object.values(data.cv).some((arr: any) => arr.length > 0) && (
        <div>
          <h1 className="text-2xl font-bold text-purple-900 mb-6">Customized CV</h1>
          
          {(data.cv.Summary?.length > 0 || data.cv.Education?.length > 0) && (
            <div className="grid grid-cols-2 gap-6 mb-6">
              {data.cv.Summary?.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-purple-200 p-6">
                  <div className="flex h-full">
                    <div className="flex items-center justify-center w-1/3">
                      <div className="text-xl font-bold text-gray-900">{data.cv.Summary[0].firm || ''}</div>
                    </div>
                    <div className="w-2/3 flex items-center">
                      <div className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed text-right w-full">{data.cv.Summary[0].responsibilities_summary || ''}</div>
                    </div>
                  </div>
                </div>
              )}
              {data.cv.Education?.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-purple-200 p-6">
                  <h3 className="text-lg font-semibold text-purple-900 mb-2">{data.cv.Education[0].cv_component || 'Education'}</h3>
                  <div className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">{data.cv.Education[0].responsibilities_summary || ''}</div>
                </div>
              )}
            </div>
          )}
          
          {data.cv['Awards & Certificates']?.length > 0 && (
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-purple-900 mb-6">Awards & Certificates</h2>
              <div className="grid grid-cols-4 gap-4 mb-6">
                {data.cv['Awards & Certificates'].map((item: any, index: number) => (
                  <div key={index} className="bg-white rounded-lg shadow-sm border border-purple-200 p-4">
                    <div className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">{item.responsibilities_summary || ''}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {data.cv.Work?.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-purple-800 mb-4">Work Experience</h2>
              {data.cv.Work.map((item: any) => (
                <div key={item.id} className="bg-white rounded-lg shadow-sm border border-purple-200 p-6 mb-4">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-purple-900">{item.firm || 'Untitled Firm'}</h3>
                    <span className="text-sm text-gray-500">{formatDisplayTime(item.time)}</span>
                  </div>
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-purple-700 mb-2">Responsibilities</h4>
                    <div className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">{item.responsibilities_text || 'No responsibilities content available'}</div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-purple-700 mb-2">Achievements</h4>
                    <div className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">{item.achievements_text || 'No achievements content available'}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {data.cv.Project?.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-purple-800 mb-4">Projects</h2>
              {data.cv.Project.map((item: any) => (
                <div key={item.id} className="bg-white rounded-lg shadow-sm border border-purple-200 p-6 mb-4">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-purple-900">{item.firm || 'Untitled Project'}</h3>
                    <span className="text-sm text-gray-500">{formatDisplayTime(item.time)}</span>
                  </div>
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-purple-700 mb-2">Responsibilities</h4>
                    <div className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">{item.responsibilities_text || 'No responsibilities content available'}</div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-purple-700 mb-2">Achievements</h4>
                    <div className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">{item.achievements_text || 'No achievements content available'}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {data.cv['Closing Sentences']?.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-purple-800 mb-4">Closing Sentences</h2>
              {data.cv['Closing Sentences'].map((item: any, index: number) => (
                <div key={index} className="bg-white rounded-lg shadow-sm border border-purple-200 p-6 mb-4">
                  <div className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">{item.responsibilities_summary || ''}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}