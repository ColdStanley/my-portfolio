'use client'

export default function Overview() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 p-6 pb-60">
      <div className="max-w-6xl mx-auto">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            AI Agent Gala
          </h1>
        </div>

        {/* Description Card - Full Width */}
        <div className="mb-8">
          <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl p-6 transition-all duration-300 hover:shadow-2xl">
            <p className="text-gray-600 text-center text-lg">
              A comprehensive collection of AI-powered tools designed to enhance productivity and learning experiences.
            </p>
          </div>
        </div>

        {/* First Row: Active Projects & Coming Soon */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Active Projects */}
          <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl p-6 transition-all duration-300 hover:shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Active Projects</h3>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-purple-50/50 rounded-lg border-l-4 border-purple-500">
                <h4 className="font-medium text-gray-800">JD2CV 2.0</h4>
                <p className="text-sm text-gray-600">Enhanced AI resume generation with improved accuracy</p>
              </div>
              <div className="p-3 bg-purple-50/50 rounded-lg border-l-4 border-purple-500">
                <h4 className="font-medium text-gray-800">IELTS Speaking</h4>
                <p className="text-sm text-gray-600">AI-powered speaking test simulator with feedback</p>
              </div>
              <div className="p-3 bg-purple-50/50 rounded-lg border-l-4 border-purple-500">
                <h4 className="font-medium text-gray-800">Paragraphe Magique</h4>
                <p className="text-sm text-gray-600">French writing assistant for content optimization</p>
              </div>
              <div className="p-3 bg-purple-50/50 rounded-lg border-l-4 border-purple-500">
                <h4 className="font-medium text-gray-800">Test Lab</h4>
                <p className="text-sm text-gray-600">Development environment for experimental features</p>
              </div>
            </div>
          </div>

          {/* Coming Soon */}
          <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl p-6 transition-all duration-300 hover:shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Coming Soon</h3>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-purple-50/50 rounded-lg border-l-4 border-purple-500">
                <h4 className="font-medium text-gray-800">Code Review Agent</h4>
                <p className="text-sm text-gray-600">AI-powered code analysis and optimization suggestions</p>
                <span className="text-xs text-purple-600 font-medium">In Development</span>
              </div>
              <div className="p-3 bg-purple-50/50 rounded-lg border-l-4 border-purple-500">
                <h4 className="font-medium text-gray-800">Research Assistant</h4>
                <p className="text-sm text-gray-600">Intelligent research synthesis and citation management</p>
                <span className="text-xs text-purple-600 font-medium">Planning Phase</span>
              </div>
              <div className="p-3 bg-purple-50/50 rounded-lg border-l-4 border-purple-500">
                <h4 className="font-medium text-gray-800">Language Tutor</h4>
                <p className="text-sm text-gray-600">Personalized language learning with conversation practice</p>
                <span className="text-xs text-purple-600 font-medium">Concept Phase</span>
              </div>
            </div>
          </div>
        </div>

        {/* Project Cards - 2 Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* IELTS Speaking */}
          <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl p-6 transition-all duration-300 hover:shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">IELTS Speaking</h3>
                <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">Education</span>
              </div>
            </div>
            
            <div className="mb-4">
              <h4 className="font-medium text-gray-800 mb-2">Technology</h4>
              <p className="text-sm text-gray-600 mb-4">
                Advanced speech recognition combined with natural language processing to analyze pronunciation, fluency, and content quality in real-time.
              </p>
            </div>

            <div className="mb-4">
              <h4 className="font-medium text-gray-800 mb-2">Value</h4>
              <p className="text-sm text-gray-600 mb-4">
                Provides instant feedback and scoring, eliminating the need for expensive tutoring while offering personalized improvement suggestions.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Real-time speech analysis
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Automated scoring system
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Personalized improvement tips
              </div>
            </div>
          </div>

          {/* JD2CV 2.0 */}
          <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl p-6 transition-all duration-300 hover:shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">JD2CV 2.0</h3>
                <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">Career</span>
              </div>
            </div>
            
            <div className="mb-4">
              <h4 className="font-medium text-gray-800 mb-2">Technology</h4>
              <p className="text-sm text-gray-600 mb-4">
                Intelligent job description parsing with AI-powered content matching to automatically align resume content with specific role requirements.
              </p>
            </div>

            <div className="mb-4">
              <h4 className="font-medium text-gray-800 mb-2">Value</h4>
              <p className="text-sm text-gray-600 mb-4">
                Saves hours of manual customization while significantly improving application success rates through perfect job-resume alignment.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Job description analysis
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                AI-powered content generation
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Professional PDF export
              </div>
            </div>
          </div>

          {/* Paragraphe Magique */}
          <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl p-6 transition-all duration-300 hover:shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Paragraphe Magique</h3>
                <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">Writing</span>
              </div>
            </div>
            
            <div className="mb-4">
              <h4 className="font-medium text-gray-800 mb-2">Technology</h4>
              <p className="text-sm text-gray-600 mb-4">
                French-specific language models optimized for grammar, style, and vocabulary enhancement with contextual understanding of French writing conventions.
              </p>
            </div>

            <div className="mb-4">
              <h4 className="font-medium text-gray-800 mb-2">Value</h4>
              <p className="text-sm text-gray-600 mb-4">
                Transforms basic French writing into polished, professional content while teaching proper structure and advanced vocabulary usage.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                French language optimization
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Structure and flow improvement
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Vocabulary enhancement
              </div>
            </div>
          </div>

          {/* Test Lab */}
          <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl p-6 transition-all duration-300 hover:shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Test Lab</h3>
                <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">Development</span>
              </div>
            </div>
            
            <div className="mb-4">
              <h4 className="font-medium text-gray-800 mb-2">Technology</h4>
              <p className="text-sm text-gray-600 mb-4">
                Isolated sandbox environment for testing webhook integrations, API configurations, and experimental AI model implementations before production.
              </p>
            </div>

            <div className="mb-4">
              <h4 className="font-medium text-gray-800 mb-2">Value</h4>
              <p className="text-sm text-gray-600 mb-4">
                Ensures system reliability and prevents production failures by providing comprehensive testing capabilities for all development workflows.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Webhook testing interface
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                API endpoint validation
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Development sandbox
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}