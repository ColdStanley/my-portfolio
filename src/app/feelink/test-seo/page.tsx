'use client'

import { useState } from 'react'

export default function SEOTestPage() {
  const [testUrl, setTestUrl] = useState('')
  const [testResults, setTestResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testSocialSharing = async () => {
    if (!testUrl) return
    
    setLoading(true)
    setTestResults(null)
    
    try {
      // 测试不同平台的调试工具
      const debugUrls = {
        facebook: `https://developers.facebook.com/tools/debug/?q=${encodeURIComponent(testUrl)}`,
        twitter: `https://cards-dev.twitter.com/validator?url=${encodeURIComponent(testUrl)}`,
        linkedin: `https://www.linkedin.com/post-inspector/inspect/${encodeURIComponent(testUrl)}`,
        whatsapp: testUrl // WhatsApp 会自动预览
      }
      
      setTestResults(debugUrls)
    } catch (error) {
      console.error('Error testing social sharing:', error)
    } finally {
      setLoading(false)
    }
  }

  const sampleFeelinkUrl = 'https://www.stanleyhi.com/feelink/user-view/sample-id'

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Feelink SEO & Social Media Test</h1>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Test Social Media Sharing</h2>
        
        <div className="flex gap-4 mb-4">
          <input
            type="url"
            placeholder="Enter Feelink URL to test..."
            value={testUrl}
            onChange={(e) => setTestUrl(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            onClick={testSocialSharing}
            disabled={loading || !testUrl}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Testing...' : 'Test'}
          </button>
        </div>
        
        <button
          onClick={() => setTestUrl(sampleFeelinkUrl)}
          className="text-sm text-purple-600 hover:text-purple-700 underline"
        >
          Use sample URL: {sampleFeelinkUrl}
        </button>
      </div>

      {testResults && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Social Media Debug Tools</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(testResults).map(([platform, url]) => (
              <div key={platform} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-2 capitalize">{platform}</h4>
                <a
                  href={url as string}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 text-sm"
                >
                  Test on {platform}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">SEO Checklist for Feelink Pages</h3>
        <div className="space-y-3">
          {[
            '✅ Open Graph meta tags (og:title, og:description, og:image)',
            '✅ Twitter Card meta tags (twitter:card, twitter:title, twitter:description, twitter:image)',
            '✅ Proper image URLs (HTTPS, absolute paths)',
            '✅ Image dimensions optimized (1200x630 for og:image)',
            '✅ Multiple image sizes for different platforms',
            '✅ Structured data (JSON-LD) for better search visibility',
            '✅ Error handling for missing content',
            '✅ robots.txt allows social media crawlers',
            '✅ Sitemap.xml for search engine discovery',
            '✅ Performance optimizations (preconnect, dns-prefetch)'
          ].map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span className="text-gray-700">{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 bg-purple-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-purple-800 mb-3">How to Test Your Feelink</h3>
        <ol className="list-decimal list-inside space-y-2 text-purple-700">
          <li>Create a new Feelink and copy its share URL</li>
          <li>Paste the URL in the test field above</li>
          <li>Click "Test" to get debug tool links</li>
          <li>Use the debug tools to verify images and text display correctly</li>
          <li>Test actual sharing on social media platforms</li>
        </ol>
      </div>
    </div>
  )
}