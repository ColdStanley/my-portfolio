'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import DashboardView from './DashboardView'
import PromptManager, { PromptData } from '@/components/PromptManager'


interface JDData {
  title: string
  company: string
  full_job_description: string
  jd_key_sentences: string
  keywords_from_sentences: string
  application_stage: string
  comment: string
  role_group: string
  firm_type: string
  cv_pdf?: string
  match_score?: number
  created_time?: string
  last_edited_time?: string
}

interface ExperienceRecord {
  id: string
  title: string
  experience: string
  keywords: string[]
  role_group: string
  target_role: string
  time: string
  work_or_project: 'work' | 'project'
  comment: string
  experienceId?: string
  company?: string
  startDate?: string
  endDate?: string
  bullets?: string[]
  context?: string
  industry?: string
  skills?: string[]
  achievements?: string[]
  quantifiedResults?: string[]
  similarity_score?: number
  matching_keywords?: string[]
}

type CompanyName = 'stanleyhi' | 'savvy' | 'ncs' | 'icekredit' | 'huawei' | 'diebold' | 'fujixerox'

// API Response Types
interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  details?: string
}

interface KeySentencesResponse {
  success: boolean
  keySentences?: string
  error?: string
}

interface KeywordsResponse {
  success: boolean
  keywords?: string
  error?: string
}

interface SaveJDResponse {
  success: boolean
  id?: string
  error?: string
  details?: string
}

interface ExperienceListResponse {
  success: boolean
  data?: ExperienceRecord[]
  error?: string
}

interface NotionPage {
  id: string
  title: string
  company: string
}

interface JDSearchResponse {
  success: boolean
  data?: JDData[]
  error?: string
  total?: number
}

interface FieldOptionsResponse {
  title_options?: string[]
  role_group_options?: string[]
  target_role_options?: string[]
  work_or_project_options?: string[]
}

interface GenerateCustomizedResponse {
  success: boolean
  customized_experience?: string
  error?: string
}

// Error handling utilities
const handleApiError = (error: any, defaultMessage: string): string => {
  if (error?.message) return error.message
  if (typeof error === 'string') return error
  return defaultMessage
}

const withErrorHandler = async <T>(
  apiCall: () => Promise<Response>,
  successHandler: (data: T) => void,
  errorMessage: string = 'API call failed'
): Promise<boolean> => {
  try {
    const response = await apiCall()
    if (response.ok) {
      const data: T = await response.json()
      successHandler(data)
      return true
    } else {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || errorMessage)
    }
  } catch (error) {
    process.env.NODE_ENV === 'development' && console.error('API Error:', error)
    throw error
  }
}

// Unified error display component
const ErrorDisplay = ({ 
  message, 
  onRetry, 
  retryLabel = "Retry" 
}: { 
  message: string
  onRetry?: () => void
  retryLabel?: string 
}) => (
  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
    <p className="text-purple-600 text-sm mb-2">{message}</p>
    {onRetry && (
      <button 
        onClick={onRetry}
        className="w-24 px-4 py-2 bg-purple-500 text-white rounded-lg text-xs hover:bg-purple-600 whitespace-nowrap"
      >
        {retryLabel}
      </button>
    )}
  </div>
)

// Data validation utilities
const validateJDData = (data: Partial<JDData>): string[] => {
  const errors: string[] = []
  
  if (!data.title?.trim()) {
    errors.push('Job title is required')
  }
  
  if (!data.company?.trim()) {
    errors.push('Company name is required')
  }
  
  if (!data.full_job_description?.trim()) {
    errors.push('Job description is required')
  } else if (data.full_job_description.length < 50) {
    errors.push('Job description must be at least 50 characters')
  }
  
  return errors
}

const validateExperienceData = (data: Partial<ExperienceRecord>): string[] => {
  const errors: string[] = []
  
  if (!data.title?.trim()) {
    errors.push('Experience title is required')
  }
  
  if (!data.experience?.trim()) {
    errors.push('Experience description is required')
  } else if (data.experience.length < 10) {
    errors.push('Experience description must be at least 10 characters')
  }
  
  if (!data.role_group?.trim()) {
    errors.push('Role group is required')
  }
  
  return errors
}

// Company name mapping for database queries
const getCompanyDatabaseName = (companyKey: CompanyName): string => {
  const mapping: Record<CompanyName, string> = {
    'stanleyhi': 'StanleyHi',
    'savvy': 'Savvy Pro',
    'ncs': 'NCS',
    'icekredit': 'IceKredit',
    'huawei': 'Huawei',
    'diebold': 'Diebold Nixdorf',
    'fujixerox': 'Fuji Xerox'
  }
  return mapping[companyKey]
}

// Company field name mapping for JD2CV table columns
const getCompanyFieldName = (companyKey: CompanyName): string => {
  const fieldMapping: Record<CompanyName, string> = {
    'stanleyhi': 'stanleyhi',
    'savvy': 'savvy',
    'ncs': 'ncs',
    'icekredit': 'icekredit',
    'huawei': 'huawei',
    'diebold': 'dieboldnixdorf',
    'fujixerox': 'fujixerox'
  }
  return fieldMapping[companyKey]
}

// Experience Form Component
function ExperienceForm({ 
  initialData, 
  companyName, 
  onSave, 
  onCancel 
}: {
  initialData?: ExperienceRecord | null
  companyName?: CompanyName | null
  onSave: (data: Omit<ExperienceRecord, 'id'>) => Promise<void>
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    title: initialData?.title ?? '',
    experience: initialData?.experience ?? '',
    keywords: initialData?.keywords ?? [],
    role_group: initialData?.role_group ?? '',
    target_role: initialData?.target_role ?? '',
    time: initialData?.time ?? '',
    work_or_project: (initialData?.work_or_project ?? 'work') as 'work' | 'project',
    comment: initialData?.comment ?? ''
  })
  
  const [keywordInput, setKeywordInput] = useState('')
  const [titleOptions, setTitleOptions] = useState<string[]>([])
  const [roleGroupOptions, setRoleGroupOptions] = useState<string[]>([])
  const [targetRoleOptions, setTargetRoleOptions] = useState<string[]>([])
  const [workOrProjectOptions, setWorkOrProjectOptions] = useState<string[]>([])
  const [optionsLoading, setOptionsLoading] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  
  // Fetch field options when company changes
  useEffect(() => {
    const fetchFieldOptions = async () => {
      if (!companyName) return
      
      setOptionsLoading(true)
      try {
        const databaseCompanyName = getCompanyDatabaseName(companyName)
        const response = await fetch(`/api/experience-hub/field-options?company=${encodeURIComponent(databaseCompanyName)}`)
        if (response.ok) {
          const data: FieldOptionsResponse = await response.json()
          setTitleOptions(data.title_options || [])
          setRoleGroupOptions(data.role_group_options || [])
          setTargetRoleOptions(data.target_role_options || [])
          setWorkOrProjectOptions(data.work_or_project_options || [])
        }
      } catch (error) {
        console.error('Error fetching field options:', error)
      } finally {
        setOptionsLoading(false)
      }
    }

    fetchFieldOptions()
  }, [companyName])
  
  const addKeyword = () => {
    if (keywordInput.trim() && !formData.keywords.includes(keywordInput.trim())) {
      setFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, keywordInput.trim()]
      }))
      setKeywordInput('')
    }
  }
  
  const removeKeyword = (keyword: string) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }))
  }

  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.title.trim() && formData.experience.trim()) {
      setSaveStatus('saving')
      
      try {
        await onSave(formData)
        setSaveStatus('saved')
        
        // Auto-close after 2 seconds
        setTimeout(() => {
          onCancel()
        }, 2000)
      } catch (error) {
        setSaveStatus('idle')
        console.error('Save failed:', error)
      }
    }
  }
  
  return (
    <div className="relative">
      
      <form onSubmit={handleSubmit} className="space-y-4">
      {/* First Row: 6 Filter Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title <span className="text-purple-500">*</span>
          </label>
          <select
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
            disabled={optionsLoading}
          >
            <option value="">Select a title...</option>
            {titleOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        
        {/* Role Group */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Role Group</label>
          <select
            value={formData.role_group}
            onChange={(e) => setFormData(prev => ({ ...prev, role_group: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={optionsLoading}
          >
            <option value="">Select a role group...</option>
            {roleGroupOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        
        {/* Target Role */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Target Role</label>
          <select
            value={formData.target_role}
            onChange={(e) => setFormData(prev => ({ ...prev, target_role: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Select Target Role</option>
            {targetRoleOptions.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>
        
        {/* Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
          <input
            type="text"
            value={formData.time}
            onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="2020 - 2021"
          />
        </div>
        
        {/* Work or Project */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Work/Project</label>
          <select
            value={formData.work_or_project}
            onChange={(e) => setFormData(prev => ({ ...prev, work_or_project: e.target.value as 'work' | 'project' }))}  
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Select Type</option>
            {workOrProjectOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        
        {/* Comment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
          <input
            type="text"
            value={formData.comment}
            onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Additional notes..."
          />
        </div>
      </div>
      
      
      {/* Second Row: Keywords */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Keywords</label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
            className="flex-1 px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            placeholder="Add keyword"
          />
          <button
            type="button"
            onClick={addKeyword}
            className="w-16 px-2 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 text-xs whitespace-nowrap"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-1">
          {formData.keywords.map((keyword, i) => (
            <span key={i} className="inline-flex items-center bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
              {keyword}
              <button
                type="button"
                onClick={() => removeKeyword(keyword)}
                className="ml-1 text-purple-600 hover:text-purple-800"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>
      
      {/* Fourth Row: Experience */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Experience <span className="text-purple-500">*</span>
        </label>
        <textarea
          value={formData.experience}
          onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[200px]"
          placeholder="Describe your experience in detail..."
          required
        />
      </div>
      
      
      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="w-24 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors duration-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saveStatus !== 'idle'}
          className={`w-24 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
            saveStatus === 'saving'
              ? 'bg-purple-400 text-white cursor-not-allowed'
              : saveStatus === 'saved'
                ? 'bg-purple-600 text-white cursor-not-allowed'
                : 'bg-purple-500 text-white hover:bg-purple-600'
          }`}
        >
          {saveStatus === 'saving' ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
              <span>Saving...</span>
            </div>
          ) : saveStatus === 'saved' ? 'Saved ✓' : 'Save'}
        </button>
      </div>
    </form>
    </div>
  )
}

export default function JD2CVPanel() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const [jdData, setJdData] = useState<JDData>({
    title: '',
    company: '',
    full_job_description: '',
    jd_key_sentences: '',
    keywords_from_sentences: '',
    application_stage: '',
    comment: '',
    role_group: '',
    firm_type: '',
    cv_pdf: ''
  })
  
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [jdSaveError, setJdSaveError] = useState(false)
  const [showGenerated, setShowGenerated] = useState(false)
  const [generateError, setGenerateError] = useState(false)
  const [currentPageId, setCurrentPageId] = useState<string>('')
  
  const [jdSaved, setJdSaved] = useState(false)
  const [isGeneratingKeySentences, setIsGeneratingKeySentences] = useState(false)
  const [isGeneratingKeywords, setIsGeneratingKeywords] = useState(false)
  const [keySentencesError, setKeySentencesError] = useState(false)
  const [keywordsError, setKeywordsError] = useState(false)
  
  // Application stage state
  const [isSavingApplicationStage, setIsSavingApplicationStage] = useState(false)
  
  // Role group state
  const [isSavingRoleGroup, setIsSavingRoleGroup] = useState(false)
  
  // Firm type state
  const [isSavingFirmType, setIsSavingFirmType] = useState(false)
  
  // Comment state
  const [isSavingComment, setIsSavingComment] = useState(false)
  
  // Application stage options
  const applicationStageOptions = [
    'Raw Experience',
    'Customized Experience',
    'CV Polish',
    'Submitted'
  ]
  
  // Role group options
  const roleGroupOptions = [
    'Solution',
    'TAM',
    'Customer Success',
    'BD',
    'Sales'
  ]
  
  // Firm type options
  const firmTypeOptions = [
    'Startup',
    'Mature',
    'Bigwig'
  ]
  
  
  // Tab state for JD sections
  const [activeJDTab, setActiveJDTab] = useState(0) // 0: Original, 1: Key Sentences, 2: Key Words
  
  // Tab state for operations area
  const [activeOperationTab, setActiveOperationTab] = useState(0) // 0: Details, 1: Status, 2: PDF, 3: More
  
  // PDF upload state
  const [isUploadingPDF, setIsUploadingPDF] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState('')
  
  // Temporary states for button-triggered saves
  const [tempMatchScore, setTempMatchScore] = useState(0)
  const [tempApplicationStage, setTempApplicationStage] = useState('')
  const [tempRoleGroup, setTempRoleGroup] = useState('')
  const [tempFirmType, setTempFirmType] = useState('')
  const [tempComment, setTempComment] = useState('')
  
  
  
  // Tab state for each experience's sub-tabs (Original/Highlight)
  const [activeExperienceSubTabs, setActiveExperienceSubTabs] = useState<number[]>([0, 0, 0, 0, 0]) // 0: Original, 1: Highlight for each experience
  
  // Tab state for each aligned experience's sub-tabs (Original/Highlight)
  const [activeAlignedExperienceSubTabs, setActiveAlignedExperienceSubTabs] = useState<number[]>([0, 0, 0, 0, 0]) // 0: Original, 1: Highlight for each aligned experience
  
  // Experience Hub states
  const [activeExperienceHubTab, setActiveExperienceHubTab] = useState<number>(0) // 0-6 for 7 companies
  const [experienceData, setExperienceData] = useState<Record<CompanyName, ExperienceRecord[]>>({
    stanleyhi: [],
    savvy: [],
    ncs: [],
    icekredit: [],
    huawei: [],
    diebold: [],
    fujixerox: []
  })
  const [experienceFilters, setExperienceFilters] = useState<Record<CompanyName, { work: boolean, project: boolean }>>({
    stanleyhi: { work: true, project: true },
    savvy: { work: true, project: true },
    ncs: { work: true, project: true },
    icekredit: { work: true, project: true },
    huawei: { work: true, project: true },
    diebold: { work: true, project: true },
    fujixerox: { work: true, project: true }
  })
  const [targetRoleFilters, setTargetRoleFilters] = useState<Record<CompanyName, string>>({
    stanleyhi: 'all',
    savvy: 'all',
    ncs: 'all',
    icekredit: 'all',
    huawei: 'all',
    diebold: 'all',
    fujixerox: 'all'
  })
  const [experienceLoading, setExperienceLoading] = useState<Record<CompanyName, boolean>>({
    stanleyhi: false,
    savvy: false,
    ncs: false,
    icekredit: false,
    huawei: false,
    diebold: false,
    fujixerox: false
  })
  const [editingRecord, setEditingRecord] = useState<ExperienceRecord | null>(null)
  const [showAddForm, setShowAddForm] = useState<CompanyName | null>(null)
  
  // Company configuration
  const companies: { name: CompanyName; displayName: string }[] = [
    { name: 'stanleyhi', displayName: 'StanleyHi' },
    { name: 'savvy', displayName: 'Savvy Pro' },
    { name: 'ncs', displayName: 'NCS' },
    { name: 'icekredit', displayName: 'IceKredit' },
    { name: 'huawei', displayName: 'Huawei' },
    { name: 'diebold', displayName: 'Diebold' },
    { name: 'fujixerox', displayName: 'Fuji Xerox' }
  ]
  
  // Load default company data on mount
  useEffect(() => {
    if (companies[activeExperienceHubTab]) {
      fetchExperienceData(companies[activeExperienceHubTab].name)
    }
  }, [])
  
  // JD2CV specific prompts configuration
  const [jd2cvPrompts, setJd2cvPrompts] = useState<PromptData>({
    // 生成关键句子 - GPT-4版本
    generate_key_sentences_gpt4: {
      name: 'Generate Key Sentences - GPT-4',
      location: 'JD Tab → Key Sentences (GPT-4)',
      model: 'gpt-4',
      prompt: `Analyze the following job description and extract the 10 most important sentences that define the core responsibilities, requirements, and expectations for this role.

Focus on:
- Key technical skills and qualifications
- Primary job responsibilities
- Important experience requirements
- Critical performance expectations
- Essential competencies

Job Title: {title}

Job Description:
{full_job_description}

Please provide exactly 10 sentences from the original job description text, ranked by importance (1 being most important). Format as a simple numbered list using plain text only:

1. [First sentence]
2. [Second sentence]
3. [Third sentence]
...

Do not use JSON, markdown formatting, or any special characters. Use only plain text with simple numbering.`
    },

    // 生成关键句子 - DeepSeek版本
    generate_key_sentences_deepseek: {
      name: 'Generate Key Sentences - DeepSeek',
      location: 'JD Tab → Key Sentences (DeepSeek)',
      model: 'deepseek',
      prompt: `Analyze the following job description and extract the 10 most important sentences that define the core responsibilities, requirements, and expectations for this role.

Focus on:
- Key technical skills and qualifications
- Primary job responsibilities
- Important experience requirements
- Critical performance expectations
- Essential competencies

Job Title: {title}

Job Description:
{full_job_description}

Please provide exactly 10 sentences from the original job description text, ranked by importance (1 being most important). Format as a simple numbered list using plain text only:

1. [First sentence]
2. [Second sentence]
3. [Third sentence]
...

Do not use JSON, markdown formatting, or any special characters. Use only plain text with simple numbering.`
    },

    // 生成关键词 - GPT-4版本
    generate_keywords_gpt4: {
      name: 'Generate Keywords - GPT-4',
      location: 'JD Tab → Key Words (GPT-4)',
      model: 'gpt-4',
      prompt: `Based on the following 10 key sentences extracted from a job description and the job title, identify the most important 3 groups of keywords (3 keywords per group) that represent the core competencies and requirements for this role.

Job Title: {title}

Key Sentences:
{key_sentences}

Please provide exactly 3 groups of keywords, with each group containing exactly 3 related keywords. Format as plain text only:

Group 1: [Theme Name]
1. Keyword 1
2. Keyword 2
3. Keyword 3

Group 2: [Theme Name]
1. Keyword 1
2. Keyword 2
3. Keyword 3

Group 3: [Theme Name]
1. Keyword 1
2. Keyword 2
3. Keyword 3

Focus on the most critical skills, technologies, and competencies mentioned in the key sentences. Use only plain text formatting without markdown symbols, asterisks, or dashes.`
    },

    // 生成关键词 - DeepSeek版本
    generate_keywords_deepseek: {
      name: 'Generate Keywords - DeepSeek',
      location: 'JD Tab → Key Words (DeepSeek)',
      model: 'deepseek',
      prompt: `Based on the following 10 key sentences extracted from a job description and the job title, identify the most important 3 groups of keywords (3 keywords per group) that represent the core competencies and requirements for this role.

Job Title: {title}

Key Sentences:
{key_sentences}

Please provide exactly 3 groups of keywords, with each group containing exactly 3 related keywords. Format as plain text only:

Group 1: [Theme Name]
1. Keyword 1
2. Keyword 2
3. Keyword 3

Group 2: [Theme Name]
1. Keyword 1
2. Keyword 2
3. Keyword 3

Group 3: [Theme Name]
1. Keyword 1
2. Keyword 2
3. Keyword 3

Focus on the most critical skills, technologies, and competencies mentioned in the key sentences. Use only plain text formatting without markdown symbols, asterisks, or dashes.`
    },


    // 生成定制化经验 - GPT-4版本
    generate_experience_gpt4: {
      name: 'Generate Experience - GPT-4',
      location: 'Experience Tab → Generate (GPT-4)',
      model: 'gpt-4',
      prompt: `You are an expert career consultant. {prompt}

Based on the following capability requirement and the candidate's original experience/project, craft an enhanced and customized version that:

- Directly addresses the specific capability requirement
- Incorporates key phrases and technical terms from the capability description
- Expands or rewrites the original experience to better align with the capability
- Maintains truthfulness and consistency with the original input
- Uses concise, professional, and compelling language suitable for resumes or LinkedIn
- Avoids generic phrasing or vague accomplishments
- **CRITICAL: Preserve all company names, project names, website URLs, and brand names EXACTLY as written in the original text. Do not modify, abbreviate, or rewrite these proper nouns.**
- Presents the final result as structured **bullet points**, suitable for resume use

You may choose from the following frameworks to best express the enhanced experience:
- **CAR** (Challenge – Action – Result) — concise and outcome-driven
- **PAR** (Problem – Action – Result) — suitable for business/tech roles
- **SOAR** (Situation – Opportunity – Action – Result) — emphasizes influence
- **Why–What–How–Impact** — ideal for explaining the rationale and impact of a project

Select the most appropriate framework based on the content, and clearly reflect its logic in the output.

---

Capability Requirement:
{capability}

Original Experience/Project:
{experienceInput}

Please return the enhanced experience as 1–3 bullet points, clearly reflecting one of the above frameworks.`
    },

    // 生成定制化经验 - DeepSeek版本
    generate_experience_deepseek: {
      name: 'Generate Experience - DeepSeek',
      location: 'Experience Tab → Generate (DeepSeek)',
      model: 'deepseek',
      prompt: `You are an expert career consultant. {prompt}

Based on the following capability requirement and the candidate's original experience/project, craft an enhanced and customized version that:

- Directly addresses the specific capability requirement
- Incorporates key phrases and technical terms from the capability description
- Refines and restructures the original experience to better align with the capability
- Maintains truthfulness and consistency with the original input
- Uses concise, professional, and compelling language suitable for resumes or LinkedIn
- Avoids generic phrasing or vague accomplishments
- Do not add exaggerated metrics or overly embellish achievements
- **CRITICAL: Preserve all company names, project names, website URLs, and brand names EXACTLY as written in the original text. Do not modify, abbreviate, or rewrite these proper nouns.**
- Presents the final result as structured bullet points (no asterisks or markdown formatting), suitable for resume use

You may choose from the following frameworks to best express the enhanced experience:
- CAR (Challenge – Action – Result) — concise and outcome-driven
- PAR (Problem – Action – Result) — suitable for business/tech roles
- SOAR (Situation – Opportunity – Action – Result) — emphasizes influence
- Why–What–How–Impact — ideal for explaining the rationale and impact of a project

---

Capability Requirement:
{capability}

Original Experience/Project:
{experienceInput}

Return only the enhanced experience as 1–3 bullet points. Do not explain your framework choice or provide commentary.`
    }
  })



  // Experience keyword tooltip states
  const [deleteExperienceKeywordTooltip, setDeleteExperienceKeywordTooltip] = useState<{
    show: boolean
    keyword: string
    experienceIndex: number
    position: { x: number; y: number }
  }>({ show: false, keyword: '', experienceIndex: -1, position: { x: 0, y: 0 } })
  
  const [addExperienceKeywordTooltip, setAddExperienceKeywordTooltip] = useState<{
    show: boolean
    text: string
    experienceIndex: number
    position: { x: number; y: number }
  }>({ show: false, text: '', experienceIndex: -1, position: { x: 0, y: 0 } })

  // Generated text keyword tooltip states
  const [deleteGeneratedKeywordTooltip, setDeleteGeneratedKeywordTooltip] = useState<{
    show: boolean
    keyword: string
    generatedIndex: number
    position: { x: number; y: number }
  }>({ show: false, keyword: '', generatedIndex: -1, position: { x: 0, y: 0 } })
  
  const [addGeneratedKeywordTooltip, setAddGeneratedKeywordTooltip] = useState<{
    show: boolean
    text: string
    generatedIndex: number
    position: { x: number; y: number }
  }>({ show: false, text: '', generatedIndex: -1, position: { x: 0, y: 0 } })
  
  // Search states
  const [searchTitle, setSearchTitle] = useState('')
  const [searchCompany, setSearchCompany] = useState('')
  const [isSearching, setIsSearching] = useState(false)


  // Highlight keywords in text
  const highlightKeywords = (text: string, keywords: string[]) => {
    if (!keywords || keywords.length === 0) return text
    
    let highlightedText = text
    keywords.forEach(keyword => {
      if (keyword.trim()) {
        // Escape special regex characters and create pattern
        const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        const regex = new RegExp(`\\b${escapedKeyword}\\b`, 'gi')
        
        // Clickable highlighted keywords - same purple style as JD highlights
        highlightedText = highlightedText.replace(
          regex, 
          `<span class="inline-block px-2 py-1 rounded-lg bg-purple-100/20 text-purple-800 backdrop-blur-xs shadow-sm cursor-pointer hover:bg-purple-200/30 transition-colors" data-keyword="${keyword.replace(/"/g, '&quot;')}">${keyword}</span>`
        )
      }
    })
    return highlightedText
  }
  
  // Filter states
  const [filterApplicationStage, setFilterApplicationStage] = useState('')
  const [filterRoleGroup, setFilterRoleGroup] = useState('')
  const [filterFirmType, setFilterFirmType] = useState('')
  const [filterTitle, setFilterTitle] = useState('')
  const [filterCompany, setFilterCompany] = useState('')
  const [isFiltering, setIsFiltering] = useState(false)
  const [isClearing, setIsClearing] = useState(false)
  const [availableTitles, setAvailableTitles] = useState<string[]>([])
  const [availableCompanies, setAvailableCompanies] = useState<string[]>([])
  const [availableApplicationStages, setAvailableApplicationStages] = useState<string[]>([])
  const [availableRoleGroups, setAvailableRoleGroups] = useState<string[]>([])
  const [availableFirmTypes, setAvailableFirmTypes] = useState<string[]>([])
  const [allTitles, setAllTitles] = useState<string[]>([])
  const [allCompanies, setAllCompanies] = useState<string[]>([])
  const [combinations, setCombinations] = useState<Record<string, string[]>>({})
  const [reverseCombinations, setReverseCombinations] = useState<Record<string, string[]>>({})
  const [optionsLoaded, setOptionsLoaded] = useState(false)
  
  
  // Model selection state
  const [selectedModel, setSelectedModel] = useState<'gpt-4' | 'deepseek'>('deepseek')
  
  // Delete states
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteTooltipShow, setDeleteTooltipShow] = useState(false)
  
  // Match score states
  const [matchScore, setMatchScore] = useState<number>(0)
  const [isSavingMatchScore, setIsSavingMatchScore] = useState(false)
  
  // Generate customized experience states
  const [isGeneratingCustomized, setIsGeneratingCustomized] = useState<Record<string, boolean>>({})
  const [customizeError, setCustomizeError] = useState<string>('')
  const [showCustomizeError, setShowCustomizeError] = useState(false)
  
  // Save to page states
  const [isSavingToPage, setIsSavingToPage] = useState<Record<string, boolean>>({})
  const [saveToPageError, setSaveToPageError] = useState<string>('')
  const [showSaveToPageError, setShowSaveToPageError] = useState(false)
  
  // Save all matched states
  const [isSavingAllMatched, setIsSavingAllMatched] = useState(false)
  const [saveAllProgress, setSaveAllProgress] = useState('')
  
  // View state - initialize from URL params
  const [activeView, setActiveView] = useState<'individual' | 'dashboard'>(() => {
    const viewParam = searchParams.get('view')
    return viewParam === 'dashboard' ? 'dashboard' : 'individual'
  })

  // Handle URL parameters for JD data
  useEffect(() => {
    const jdId = searchParams.get('jdId')
    const title = searchParams.get('title')
    const company = searchParams.get('company')
    const view = searchParams.get('view')
    
    // If coming from Dashboard with JD info, populate the form
    if (view === 'individual' && jdId && title && company) {
      setJdData(prev => ({
        ...prev,
        title: decodeURIComponent(title),
        company: decodeURIComponent(company)
      }))
      setActiveView('individual')
      
      // Load full JD data from the database
      loadJDData(jdId)
    }
  }, [searchParams])

  // Load JD data from database by ID
  const loadJDData = async (jdId: string) => {
    try {
      const response = await fetch(`/api/jd2cv/get?id=${jdId}`)
      const data: ApiResponse<JDData> = await response.json()
      
      if (data.success && data.jd) {
        setJdData({
          title: data.jd.title || '',
          company: data.jd.company || '',
          full_job_description: data.jd.full_job_description || '',
          jd_key_sentences: data.jd.jd_key_sentences || '',
          keywords_from_sentences: data.jd.keywords_from_sentences || '',
          application_stage: data.jd.application_stage || '',
          comment: data.jd.comment || '',
          role_group: data.jd.role_group || '',
          firm_type: data.jd.firm_type || '',
          cv_pdf: data.jd.cv_pdf || ''
        })
        setCurrentPageId(jdId)
      }
    } catch (error) {
      console.error('Error loading JD data:', error)
    }
  }

  // Handle view change with URL update
  const handleViewChange = (view: 'individual' | 'dashboard') => {
    setActiveView(view)
    
    const params = new URLSearchParams(searchParams.toString())
    params.set('view', view)
    
    // Remove JD-specific params when switching to dashboard
    if (view === 'dashboard') {
      params.delete('jdId')
      params.delete('title')
      params.delete('company')
    }
    
    router.push(`/cestlavie?${params.toString()}`)
  }

  // Auto-resize textarea function
  const autoResizeTextarea = (textarea: HTMLTextAreaElement) => {
    textarea.style.height = 'auto'
    textarea.style.height = `${Math.max(textarea.scrollHeight, 120)}px` // minimum 120px
  }

  // Close delete tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (deleteTooltipShow) {
        const target = e.target as HTMLElement
        if (!target.closest('.relative')) {
          setDeleteTooltipShow(false)
        }
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [deleteTooltipShow])




  // Load available options on component mount and scroll to top
  useEffect(() => {
    loadFilterOptions()
    // Scroll to top when component mounts
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // Sync data to temporary states when jdData changes
  useEffect(() => {
    setTempMatchScore(matchScore)
    setTempApplicationStage(jdData.application_stage)
    setTempRoleGroup(jdData.role_group)
    setTempFirmType(jdData.firm_type)
    setTempComment(jdData.comment)
  }, [jdData, matchScore])

  // Cleanup comment timeout on unmount
  useEffect(() => {
    return () => {
      // No cleanup needed for comment timeout anymore
    }
  }, [])




  const handleClearFilter = () => {
    setIsClearing(true)
    
    // Clear all filter selections
    setFilterApplicationStage('')
    setFilterRoleGroup('')
    setFilterFirmType('')
    setFilterTitle('')
    setFilterCompany('')
    
    // Reset available options to show all
    setAvailableTitles(allTitles)
    setAvailableCompanies(allCompanies)
    
    // Clear main form fields
    setJdData(prev => ({
      ...prev,
      title: '',
      company: '',
      full_job_description: '',
      jd_key_sentences: '',
      keywords_from_sentences: ''
    }))
    
    // Clear other related states
    setJdSaved(false)
    setCurrentPageId('')
    
    setTimeout(() => {
      setIsClearing(false)
    }, 500)
  }

  const loadFilterOptions = async () => {
    try {
      const response = await fetch('/api/jd2cv/options')
      if (response.ok) {
        const data: ApiResponse<any> = await response.json()
        setAllTitles(data.titles || [])
        setAllCompanies(data.companies || [])
        setAvailableTitles(data.titles || [])
        setAvailableCompanies(data.companies || [])
        setAvailableApplicationStages(data.applicationStages || [])
        setAvailableRoleGroups(data.roleGroups || [])
        setAvailableFirmTypes(data.firmTypes || [])
        setCombinations(data.combinations || {})
        setReverseCombinations(data.reverseCombinations || {})
        setOptionsLoaded(true)
        // Initialize available options after loading
        setAvailableTitles(data.titles || [])
        setAvailableCompanies(data.companies || [])
      }
    } catch (error) {
      console.error('Error loading filter options:', error)
    }
  }

  // Handle cascade filtering - 5 level hierarchy
  const updateAvailableOptions = () => {
    // Start with all options data from API
    let filteredData = combinations

    // Apply filters in sequence: Application Stage -> Role Group -> Firm Type -> Title -> Company
    if (filterApplicationStage) {
      // Filter by application stage (this will need API support)
      // For now, keep all combinations - this will be implemented when API supports it
    }

    if (filterRoleGroup) {
      // Filter by role group (this will need API support)
      // For now, keep all combinations - this will be implemented when API supports it
    }

    if (filterFirmType) {
      // Filter by firm type (this will need API support)
      // For now, keep all combinations - this will be implemented when API supports it
    }

    // Update available titles and companies based on current selections
    if (filterTitle) {
      // If title is selected, filter companies based on title
      const availableCompaniesForTitle = filteredData[filterTitle] || []
      setAvailableCompanies(availableCompaniesForTitle)
      setAvailableTitles(Object.keys(filteredData))
    } else if (filterCompany) {
      // If company is selected, filter titles based on company
      const availableTitlesForCompany = reverseCombinations[filterCompany] || []
      setAvailableTitles(availableTitlesForCompany)
      setAvailableCompanies(allCompanies)
    } else {
      // No title or company selected - show all options
      setAvailableTitles(Object.keys(filteredData))
      const allFilteredCompanies = [...new Set(Object.values(filteredData).flat())]
      setAvailableCompanies(allFilteredCompanies)
    }
  }

  const handleApplicationStageChange = (selectedStage: string) => {
    setFilterApplicationStage(selectedStage)
    // Clear downstream selections
    setFilterRoleGroup('')
    setFilterFirmType('')
    setFilterTitle('')
    setFilterCompany('')
    updateAvailableOptions()
  }

  const handleRoleGroupChange = (selectedRoleGroup: string) => {
    setFilterRoleGroup(selectedRoleGroup)
    // Clear downstream selections
    setFilterFirmType('')
    setFilterTitle('')
    setFilterCompany('')
    updateAvailableOptions()
  }

  const handleFirmTypeChange = (selectedFirmType: string) => {
    setFilterFirmType(selectedFirmType)
    // Clear downstream selections
    setFilterTitle('')
    setFilterCompany('')
    updateAvailableOptions()
  }

  const handleTitleChange = (selectedTitle: string) => {
    setFilterTitle(selectedTitle)
    
    // Update available companies based on selected title
    if (selectedTitle) {
      const availableCompaniesForTitle = combinations[selectedTitle] || []
      setAvailableCompanies(availableCompaniesForTitle)
      
      // Clear company if it's not available for this title
      if (filterCompany && !availableCompaniesForTitle.includes(filterCompany)) {
        setFilterCompany('')
      }
    } else {
      // Show all companies when no title is selected
      setAvailableCompanies(allCompanies)
      setFilterCompany('')
    }
  }

  const handleCompanyChange = (selectedCompany: string) => {
    setFilterCompany(selectedCompany)
    
    // Update available titles based on selected company
    if (selectedCompany) {
      const availableTitlesForCompany = reverseCombinations[selectedCompany] || []
      setAvailableTitles(availableTitlesForCompany)
      
      // Clear title if it's not available for this company
      if (filterTitle && !availableTitlesForCompany.includes(filterTitle)) {
        setFilterTitle('')
      }
    } else {
      // Show all titles when no company is selected
      setAvailableTitles(allTitles)
    }
  }

  // Get latest prompt from localStorage to ensure real-time updates
  const getLatestPrompt = (key: string) => {
    try {
      const saved = localStorage.getItem('jd2cv-prompts')
      const prompts = saved ? JSON.parse(saved) : jd2cvPrompts
      return prompts[key]?.prompt
    } catch (error) {
      console.error('Failed to read prompts from localStorage:', error)
      return jd2cvPrompts[key]?.prompt
    }
  }

  const handleGenerateKeySentencesFromJD = async () => {
    if (!jdData.full_job_description.trim()) {
      return
    }

    setIsGeneratingKeySentences(true)
    setKeySentencesError(false)
    try {
      const response = await fetch('/api/jd2cv/generate-key-sentences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_job_description: jdData.full_job_description,
          title: jdData.title,
          model: selectedModel,
          customPrompt: getLatestPrompt(selectedModel === 'gpt-4' ? 'generate_key_sentences_gpt4' : 'generate_key_sentences_deepseek')
        })
      })

      if (response.ok) {
        const data: KeySentencesResponse = await response.json()
        if (data.success && data.keySentences) {
          setJdData(prev => ({ ...prev, jd_key_sentences: data.keySentences }))
          
          // Save to database if we have title and company
          if (jdData.title && jdData.company) {
            try {
              await fetch('/api/jd2cv/save-key-sentences', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  title: jdData.title,
                  company: jdData.company,
                  key_sentences: data.keySentences
                })
              })
            } catch (error) {
              console.error('Failed to save key sentences to database:', error)
            }
          }
        } else {
          setKeySentencesError(true)
          console.error('Failed to generate key sentences:', data.error)
        }
      } else {
        setKeySentencesError(true)
        console.error('API request failed:', response.status, response.statusText)
      }
    } catch (error) {
      setKeySentencesError(true)
      console.error('Error generating key sentences:', error)
    } finally {
      setIsGeneratingKeySentences(false)
    }
  }

  const handleGenerateKeywordsFromSentences = async () => {
    if (!jdData.jd_key_sentences.trim()) {
      return
    }

    setIsGeneratingKeywords(true)
    setKeywordsError(false)
    try {
      const response = await fetch('/api/jd2cv/generate-keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key_sentences: jdData.jd_key_sentences,
          title: jdData.title,
          model: selectedModel,
          customPrompt: getLatestPrompt(selectedModel === 'gpt-4' ? 'generate_keywords_gpt4' : 'generate_keywords_deepseek')
        })
      })

      if (response.ok) {
        const data: KeywordsResponse = await response.json()
        if (data.success && data.keywords) {
          setJdData(prev => ({ ...prev, keywords_from_sentences: data.keywords }))
          
          // Save to database if we have title and company
          if (jdData.title && jdData.company) {
            try {
              await fetch('/api/jd2cv/save-keywords', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  title: jdData.title,
                  company: jdData.company,
                  keywords: data.keywords
                })
              })
            } catch (error) {
              console.error('Failed to save keywords to database:', error)
            }
          }
        } else {
          setKeywordsError(true)
          console.error('Failed to generate keywords:', data.error)
        }
      } else {
        setKeywordsError(true)
        console.error('API request failed:', response.status, response.statusText)
      }
    } catch (error) {
      setKeywordsError(true)
      console.error('Error generating keywords:', error)
    } finally {
      setIsGeneratingKeywords(false)
    }
  }

  // Clear previous session state to ensure fresh display after save
  const clearPreviousSessionState = () => {
    // Reset key sentences and keywords from previous sessions
    setJdData(prev => ({
      ...prev,
      jd_key_sentences: '',
      keywords_from_sentences: ''
    }))
    
    // Reset keyword states were cleaned up - obsolete state variables removed
    
    // Reset generation states
    setExperienceGenerating([false, false, false, false, false])
    setGeneratedExporting([false, false, false, false, false])
    setExperienceIsSaving([false, false, false, false, false])
    setExperienceSaveMessages(['', '', '', '', ''])
    
    // Reset match score
    setMatchScore(0)
  }

  const handleJDSubmit = async () => {
    if (!jdData.title || !jdData.company || !jdData.full_job_description) {
      return
    }

    setIsSaving(true)
    setJdSaveError(false)
    try {
      const response = await fetch('/api/jd2cv/save-jd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: jdData.title,
          company: jdData.company,
          full_job_description: jdData.full_job_description
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.id) {
          setCurrentPageId(data.id)
        }
        setJdSaved(true)
        setJdSaveError(false)
        
        // Clear previous state to ensure fresh display
        clearPreviousSessionState()
        
      } else if (response.status === 409) {
        const data = await response.json()
        if (data.existingPageId) {
          setCurrentPageId(data.existingPageId)
        }
        setJdSaved(true)
        setJdSaveError(false)
        
        // Clear previous state to ensure fresh display
        clearPreviousSessionState()
        
      } else {
        setJdSaveError(true)
      }
    } catch (error) {
      setJdSaveError(true)
    } finally {
      setIsSaving(false)
    }
  }








  const handleSearch = async () => {
    if (!searchTitle || !searchCompany) {
      return
    }

    setIsSearching(true)
    try {
      const response = await fetch('/api/jd2cv/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: searchTitle,
          company: searchCompany
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.found) {
          // Fill all form fields with the found data
          setJdData({
            title: data.record.title || '',
            company: data.record.company || '',
            full_job_description: data.record.full_job_description || '',
            jd_key_sentences: data.record.jd_key_sentences || '',
            keywords_from_sentences: data.record.keywords_from_sentences || '',
            application_stage: data.record.application_stage || '',
            comment: data.record.comment || '',
            role_group: data.record.role_group || '',
            firm_type: data.record.firm_type || '',
            cv_pdf: data.record.cv_pdf || ''
          })
          

          // Set states to show the data is loaded
          setJdSaved(true)
          if (data.record.id) {
            setCurrentPageId(data.record.id)
          }
          
          
          
          // Keep default tab as Job Description
          // setActiveJDTab(0) // Default is already 0
          
          // Set match score if available (including 0)
          if (typeof data.record.match_score === 'number') {
            setMatchScore(data.record.match_score)
          }
        }
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleFilterConfirm = async () => {
    if (!filterTitle || !filterCompany) {
      return
    }

    setIsFiltering(true)
    try {
      const response = await fetch('/api/jd2cv/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: filterTitle,
          company: filterCompany
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.found) {
          // Fill all form fields with the found data
          setJdData(prev => ({
            title: data.record.title || '',
            company: data.record.company || '',
            full_job_description: data.record.full_job_description || '',
            jd_key_sentences: data.record.jd_key_sentences || '',
            keywords_from_sentences: data.record.keywords_from_sentences || '',
            application_stage: data.record.application_stage || '',
            comment: data.record.comment || '',
            role_group: data.record.role_group || '',
            firm_type: data.record.firm_type || '',
            cv_pdf: data.record.cv_pdf || ''
          }))
          

          // Set states to show the data is loaded
          setJdSaved(true)
          if (data.record.id) {
            setCurrentPageId(data.record.id)
          }
          
          
          
          // Keep default tab as Job Description
          // setActiveJDTab(0) // Default is already 0
          
          // Set match score if available (including 0)
          if (typeof data.record.match_score === 'number') {
            setMatchScore(data.record.match_score)
          }
          
          // Reset filter options to show all available options for next filter
          setAvailableTitles(allTitles)
          setAvailableCompanies(allCompanies)
        }
      }
    } catch (error) {
      console.error('Filter error:', error)
    } finally {
      setIsFiltering(false)
    }
  }

  // Handle delete page
  const handleDeletePage = async () => {
    if (!currentPageId) return
    
    setIsDeleting(true)
    setDeleteTooltipShow(false)
    
    try {
      const response = await fetch('/api/jd2cv/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageId: currentPageId })
      })
      
      if (response.ok) {
        // Reset all states after successful deletion
        setJdData({
          title: '',
          company: '',
          full_job_description: '',
          jd_key_sentences: '',
          keywords_from_sentences: '',
          application_stage: '',
          comment: '',
          role_group: '',
          firm_type: '',
          cv_pdf: ''
        })
        setJdSaved(false)
            setCurrentPageId('')
        
        // Reset all UI states
        setActiveOperationTab(0)
        setTempMatchScore(0)
        setTempComment('')
        
        // Reset all filter states
        setFilterApplicationStage('')
        setFilterRoleGroup('')
        setFilterFirmType('')
        setFilterTitle('')
        setFilterCompany('')
        setAvailableTitles(allTitles)
        setAvailableCompanies(allCompanies)
        
        // Reset match score
        setMatchScore(0)
        
        process.env.NODE_ENV === 'development' && console.log('Page deleted successfully')
      } else {
        console.error('Failed to delete page')
      }
    } catch (error) {
      console.error('Error deleting page:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  // Handle match score save
  const handleMatchScoreSave = async (score: number) => {
    if (!currentPageId || score === matchScore) return
    
    setIsSavingMatchScore(true)
    try {
      const response = await fetch('/api/jd2cv/save-match-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageId: currentPageId,
          matchScore: score
        })
      })
      
      if (response.ok) {
        setMatchScore(score)
        process.env.NODE_ENV === 'development' && console.log('Match score saved successfully')
      } else {
        console.error('Failed to save match score')
      }
    } catch (error) {
      console.error('Error saving match score:', error)
    } finally {
      setIsSavingMatchScore(false)
    }
  }

  // Handle application stage save
  const handleApplicationStageSave = async (stage: string) => {
    if (!currentPageId || stage === jdData.application_stage) return
    
    setIsSavingApplicationStage(true)
    try {
      const response = await fetch('/api/jd2cv/save-application-stage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageId: currentPageId,
          applicationStage: stage
        })
      })
      
      if (response.ok) {
        setJdData(prev => ({ ...prev, application_stage: stage }))
      }
    } catch (error) {
      console.error('Failed to save application stage:', error)
    } finally {
      setIsSavingApplicationStage(false)
    }
  }

  // Handle role group save
  const handleRoleGroupSave = async (roleGroup: string) => {
    if (!currentPageId || roleGroup === jdData.role_group) return
    
    setIsSavingRoleGroup(true)
    try {
      const response = await fetch('/api/jd2cv/save-role-group', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageId: currentPageId,
          roleGroup: roleGroup
        })
      })
      
      if (response.ok) {
        setJdData(prev => ({ ...prev, role_group: roleGroup }))
      }
    } catch (error) {
      console.error('Failed to save role group:', error)
    } finally {
      setIsSavingRoleGroup(false)
    }
  }

  // Handle firm type save
  const handleFirmTypeSave = async (firmType: string) => {
    if (!currentPageId || firmType === jdData.firm_type) return
    
    setIsSavingFirmType(true)
    try {
      const response = await fetch('/api/jd2cv/save-firm-type', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageId: currentPageId,
          firmType: firmType
        })
      })
      
      if (response.ok) {
        setJdData(prev => ({ ...prev, firm_type: firmType }))
      }
    } catch (error) {
      console.error('Failed to save firm type:', error)
    } finally {
      setIsSavingFirmType(false)
    }
  }

  // Handle comment save with debounce
  const handleCommentSave = async () => {
    if (!currentPageId) return
    
    setIsSavingComment(true)
    try {
      const response = await fetch('/api/jd2cv/save-comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageId: currentPageId,
          comment: tempComment
        })
      })
      
      if (response.ok) {
        setJdData(prev => ({ ...prev, comment: tempComment }))
      } else {
        console.error('Error saving comment')
      }
    } catch (error) {
      console.error('Failed to save comment:', error)
    } finally {
      setIsSavingComment(false)
    }
  }

  // Handle comment input with debounce
  const handleCommentInput = (value: string) => {
    setJdData(prev => ({ ...prev, comment: value }))
  }

  // Handle comment enter key
  const handleCommentEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommentSave()
    }
  }

  // Handle Status tab unified save (Stage + Group + Type)
  const handleStatusSave = async () => {
    if (!currentPageId) return
    
    const hasChanges = tempApplicationStage !== jdData.application_stage || 
                       tempRoleGroup !== jdData.role_group || 
                       tempFirmType !== jdData.firm_type
    
    if (!hasChanges) return
    
    setIsSavingApplicationStage(true)
    setIsSavingRoleGroup(true) 
    setIsSavingFirmType(true)
    
    try {
      // Save all three fields in parallel
      const promises = []
      
      if (tempApplicationStage !== jdData.application_stage) {
        promises.push(
          fetch('/api/jd2cv/save-application-stage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              pageId: currentPageId,
              applicationStage: tempApplicationStage
            })
          })
        )
      }
      
      if (tempRoleGroup !== jdData.role_group) {
        promises.push(
          fetch('/api/jd2cv/save-role-group', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              pageId: currentPageId,
              roleGroup: tempRoleGroup
            })
          })
        )
      }
      
      if (tempFirmType !== jdData.firm_type) {
        promises.push(
          fetch('/api/jd2cv/save-firm-type', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              pageId: currentPageId,
              firmType: tempFirmType
            })
          })
        )
      }
      
      const responses = await Promise.all(promises)
      const allSuccessful = responses.every(response => response.ok)
      
      if (allSuccessful) {
        // Update local state
        setJdData(prev => ({
          ...prev,
          application_stage: tempApplicationStage || prev.application_stage,
          role_group: tempRoleGroup || prev.role_group,
          firm_type: tempFirmType || prev.firm_type
        }))
      }
    } catch (error) {
      console.error('Failed to save status fields:', error)
    } finally {
      setIsSavingApplicationStage(false)
      setIsSavingRoleGroup(false)
      setIsSavingFirmType(false)
    }
  }

  // Handle PDF upload
  const handlePDFUpload = async (file: File) => {
    if (!currentPageId) {
      console.error('No page ID available for PDF upload')
      return
    }

    setIsUploadingPDF(true)
    setUploadSuccess('')
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('pageId', currentPageId)

      const response = await fetch('/api/jd2cv/upload-pdf', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        setUploadSuccess('PDF uploaded successfully')
        
        // Update local state
        setJdData(prev => ({ ...prev, cv_pdf: data.fileName }))
        
        // Clear success message after 3 seconds
        setTimeout(() => setUploadSuccess(''), 3000)
      } else {
        throw new Error('Upload failed')
      }
    } catch (error) {
      console.error('Error uploading PDF:', error)
      setUploadSuccess('Upload failed')
      setTimeout(() => setUploadSuccess(''), 3000)
    } finally {
      setIsUploadingPDF(false)
    }
  }

  // Helper function to update keywords in database
  const updateKeywordsInDatabase = async (type: 'experience' | 'generated', index: number, keywords: string[]) => {
    if (!currentPageId) return
    
    try {
      const response = await fetch('/api/jd2cv/update-keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageId: currentPageId,
          type: type,
          index: index,
          keywords: keywords
        })
      })
      
      if (response.ok) {
        // Silent success - no console log needed
        return
      } else {
        // Silent failure - just return without error logging
        return
      }
    } catch (error) {
      // Silent failure - just return without error logging
      return
    }
  }

  // Helper function to remove emojis
  const removeEmojis = (text: string) => {
    return text.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').trim()
  }






  // Handle confirming delete of generated text keyword
  const handleConfirmGeneratedKeywordDelete = () => {
    const { keyword, generatedIndex } = deleteGeneratedKeywordTooltip
    setDeleteGeneratedKeywordTooltip({ show: false, keyword: '', generatedIndex: -1, position: { x: 0, y: 0 } })

    // Update database only - local state handling removed (obsolete state variable)
    // Note: The filtered keywords would have been: keywords.filter(k => k !== keyword)
    // This functionality may need to be reimplemented with current state management
  }

  // Handle confirming add of new generated text keyword
  const handleConfirmGeneratedKeywordAdd = () => {
    const { text, generatedIndex } = addGeneratedKeywordTooltip
    setAddGeneratedKeywordTooltip({ show: false, text: '', generatedIndex: -1, position: { x: 0, y: 0 } })
    
    // Clear selection
    window.getSelection()?.removeAllRanges()

    // Update database only - local state handling removed (obsolete state variable)
    // Note: The new keywords array would have been: [...existingKeywords, text]
    // This functionality may need to be reimplemented with current state management
  }

  // Close tooltips when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.fixed.z-50')) {
        setDeleteTooltip({ show: false, sentence: '', position: { x: 0, y: 0 } })
        setAddTooltip({ show: false, text: '', position: { x: 0, y: 0 } })
        setDeleteExperienceKeywordTooltip({ show: false, keyword: '', experienceIndex: -1, position: { x: 0, y: 0 } })
        setAddExperienceKeywordTooltip({ show: false, text: '', experienceIndex: -1, position: { x: 0, y: 0 } })
        setDeleteGeneratedKeywordTooltip({ show: false, keyword: '', generatedIndex: -1, position: { x: 0, y: 0 } })
        setAddGeneratedKeywordTooltip({ show: false, text: '', generatedIndex: -1, position: { x: 0, y: 0 } })
      }
    }

    if (deleteExperienceKeywordTooltip.show || addExperienceKeywordTooltip.show || deleteGeneratedKeywordTooltip.show || addGeneratedKeywordTooltip.show) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [deleteExperienceKeywordTooltip.show, addExperienceKeywordTooltip.show, deleteGeneratedKeywordTooltip.show, addGeneratedKeywordTooltip.show])

  // Handle escape key for error modal
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showCustomizeError) {
        setShowCustomizeError(false)
      }
    }

    if (showCustomizeError) {
      document.addEventListener('keydown', handleEscapeKey)
      return () => document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [showCustomizeError])









  // Experience Hub functions
  const fetchExperienceData = async (companyName: CompanyName) => {
    try {
      setExperienceLoading(prev => ({ ...prev, [companyName]: true }))
      
      const databaseCompanyName = getCompanyDatabaseName(companyName)
      const response = await fetch(`/api/experience-hub?company=${encodeURIComponent(databaseCompanyName)}`, {
        method: 'GET'
      })
      
      if (response.ok) {
        const data = await response.json()
        setExperienceData(prev => ({
          ...prev,
          [companyName]: data.records || []
        }))
      } else {
        console.error(`API error for ${companyName}:`, response.status, response.statusText)
        const errorData = await response.json().catch(() => ({}))
        console.error('Error details:', errorData)
      }
    } catch (error) {
      console.error(`Error fetching ${companyName} experience data:`, error)
    } finally {
      setExperienceLoading(prev => ({ ...prev, [companyName]: false }))
    }
  }

  const toggleFilter = (companyName: CompanyName, filterType: 'work' | 'project') => {
    setExperienceFilters(prev => ({
      ...prev,
      [companyName]: {
        ...prev[companyName],
        [filterType]: !prev[companyName][filterType]
      }
    }))
  }

  const getFilteredExperiences = (companyName: CompanyName) => {
    const experiences = experienceData[companyName] || []
    const filters = experienceFilters[companyName]
    const targetRoleFilter = targetRoleFilters[companyName]
    
    const filtered = experiences.filter(exp => {
      // First filter by work/project type
      let typeMatch = false
      if (filters.work && filters.project) typeMatch = true
      else if (!exp.work_or_project || exp.work_or_project === '') typeMatch = true
      else if (filters.work && exp.work_or_project === 'work') typeMatch = true
      else if (filters.project && exp.work_or_project === 'project') typeMatch = true
      
      if (!typeMatch) return false
      
      // Then filter by target role
      if (targetRoleFilter === 'all') return true
      
      // Check if the experience has the selected target role
      return exp.target_role === targetRoleFilter
    })
    return filtered
  }

  // Get unique target roles for a company
  const getTargetRoleOptions = (companyName: CompanyName): string[] => {
    const experiences = experienceData[companyName] || []
    const targetRoles = new Set<string>()
    
    experiences.forEach(exp => {
      if (exp.target_role && typeof exp.target_role === 'string') {
        targetRoles.add(exp.target_role.trim())
      }
    })
    
    return Array.from(targetRoles).sort()
  }

  const createExperienceRecord = async (companyName: CompanyName, recordData: Omit<ExperienceRecord, 'id'>) => {
    try {
      setExperienceLoading(prev => ({ ...prev, [companyName]: true }))
      
      const databaseCompanyName = getCompanyDatabaseName(companyName)
      const response = await fetch(`/api/experience-hub?company=${encodeURIComponent(databaseCompanyName)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recordData)
      })
      
      if (response.ok) {
        await fetchExperienceData(companyName) // Refresh data
        setShowAddForm(null)
      }
    } catch (error) {
      console.error(`Error creating ${companyName} experience record:`, error)
    } finally {
      setExperienceLoading(prev => ({ ...prev, [companyName]: false }))
    }
  }

  const updateExperienceRecord = async (companyName: CompanyName, recordData: ExperienceRecord) => {
    try {
      setExperienceLoading(prev => ({ ...prev, [companyName]: true }))
      
      const databaseCompanyName = getCompanyDatabaseName(companyName)
      const response = await fetch(`/api/experience-hub?company=${encodeURIComponent(databaseCompanyName)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recordData)
      })
      
      if (response.ok) {
        await fetchExperienceData(companyName) // Refresh data
        setEditingRecord(null)
      }
    } catch (error) {
      console.error(`Error updating ${companyName} experience record:`, error)
    } finally {
      setExperienceLoading(prev => ({ ...prev, [companyName]: false }))
    }
  }

  const deleteExperienceRecord = async (companyName: CompanyName, recordId: string) => {
    if (!confirm('Are you sure you want to delete this experience record?')) {
      return
    }
    
    try {
      setExperienceLoading(prev => ({ ...prev, [companyName]: true }))
      
      const response = await fetch(`/api/experience-hub?id=${recordId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        await fetchExperienceData(companyName) // Refresh data
      }
    } catch (error) {
      console.error(`Error deleting ${companyName} experience record:`, error)
    } finally {
      setExperienceLoading(prev => ({ ...prev, [companyName]: false }))
    }
  }


  // Save experience to JD page
  const handleSaveToPage = async (companyName: CompanyName, experience: ExperienceRecord) => {
    // Validate required data
    if (!jdData.title?.trim() || !jdData.company?.trim()) {
      setSaveToPageError('Missing job description title or company information.')
      setShowSaveToPageError(true)
      return
    }
    
    if (!experience.title?.trim() || !experience.experience?.trim()) {
      setSaveToPageError('Missing experience title or content.')
      setShowSaveToPageError(true)
      return
    }

    const experienceKey = `${companyName}-${experience.id}`
    
    try {
      setIsSavingToPage(prev => ({ ...prev, [experienceKey]: true }))
      setSaveToPageError('')
      setShowSaveToPageError(false)
      
      const response = await fetch('/api/jd2cv/save-experience-to-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jdTitle: jdData.title,
          jdCompany: jdData.company,
          experienceId: experience.id,
          companyKey: companyName,
          saveToField: true
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        // Show success feedback (could be a toast or brief message)
        process.env.NODE_ENV === 'development' && console.log('Experience saved successfully:', data.message)
      } else {
        setSaveToPageError(data.error || 'Failed to save experience to page.')
        setShowSaveToPageError(true)
      }
    } catch (error) {
      console.error('Error saving to page:', error)
      setSaveToPageError('Failed to save experience to page. Please try again later.')
      setShowSaveToPageError(true)
    } finally {
      setIsSavingToPage(prev => ({ ...prev, [experienceKey]: false }))
    }
  }

  // Generate customized experience
  const handleGenerateCustomizedExperience = async (companyName: CompanyName, experience: ExperienceRecord) => {
    // Validate required data
    if (!jdData.keywords_from_sentences?.trim()) {
      setCustomizeError('Missing keywords from job description. Please generate keywords first.')
      setShowCustomizeError(true)
      return
    }
    
    if (!experience.experience?.trim()) {
      setCustomizeError('Missing experience content.')
      setShowCustomizeError(true)
      return
    }

    if (!jdData.title?.trim() || !jdData.company?.trim()) {
      setCustomizeError('Missing job description title or company information.')
      setShowCustomizeError(true)
      return
    }

    const experienceKey = `${companyName}-${experience.id}`
    
    try {
      setIsGeneratingCustomized(prev => ({ ...prev, [experienceKey]: true }))
      setCustomizeError('')
      setShowCustomizeError(false)
      
      const response = await fetch('/api/experience-hub/generate-customized', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jdData: {
            title: jdData.title,
            company: jdData.company,
            keywords_from_sentences: jdData.keywords_from_sentences
          },
          experienceData: {
            title: experience.title,
            experience: experience.experience,
            company: getCompanyDatabaseName(companyName),
            time: experience.time
          },
          model: selectedModel,
          customPrompt: getLatestPrompt(selectedModel === 'gpt-4' ? 'generate_experience_gpt4' : 'generate_experience_deepseek')
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        // Show success feedback and refresh the experience data
        process.env.NODE_ENV === 'development' && console.log('Customized experience generated successfully:', data.notionId)
        // Refresh the experience data for this company
        await fetchExperienceData(companyName)
      } else {
        setCustomizeError(data.error || 'Failed to generate customized experience.')
        setShowCustomizeError(true)
      }
    } catch (error) {
      console.error('Error generating customized experience:', error)
      setCustomizeError('Failed to generate customized experience. Please try again later.')
      setShowCustomizeError(true)
    } finally {
      setIsGeneratingCustomized(prev => ({ ...prev, [experienceKey]: false }))
    }
  }

  // Save all matched experiences
  const handleSaveAllMatched = async () => {
    if (!jdData.title?.trim() || !jdData.company?.trim()) {
      setSaveToPageError('Missing job description title or company information.')
      setShowSaveToPageError(true)
      return
    }

    try {
      setIsSavingAllMatched(true)
      setSaveAllProgress('0/0')
      setSaveToPageError('')
      setShowSaveToPageError(false)
      
      const response = await fetch('/api/jd2cv/save-all-matched', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jdTitle: jdData.title,
          jdCompany: jdData.company
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        // Show success feedback
        setSaveAllProgress(`${data.processedCount}/${data.totalFound}`)
        setTimeout(() => {
          setSaveAllProgress('')
        }, 2000)
      } else {
        setSaveToPageError(data.error || 'Failed to save matched experiences.')
        setShowSaveToPageError(true)
      }
    } catch (error) {
      console.error('Error saving all matched experiences:', error)
      setSaveToPageError('Failed to save matched experiences. Please try again later.')
      setShowSaveToPageError(true)
    } finally {
      setIsSavingAllMatched(false)
    }
  }



  return (
    <div className="max-w-6xl mx-auto space-y-6 px-2">
      {/* Tab Navigation - Fixed Position */}
      <div className="sticky top-0 z-40 bg-white rounded-lg shadow-sm">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => handleViewChange('individual')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors relative ${
              activeView === 'individual'
                ? 'text-purple-600'
                : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            Individual View
            {activeView === 'individual' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500"></div>
            )}
          </button>
          <button
            onClick={() => handleViewChange('dashboard')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors relative ${
              activeView === 'dashboard'
                ? 'text-purple-600'
                : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            Dashboard View
            {activeView === 'dashboard' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500"></div>
            )}
          </button>
        </div>
      </div>

      {/* Conditional rendering based on active view */}
      {activeView === 'individual' ? (
        <>
      <div className="flex items-start justify-between mb-8">
        {/* Left 50%: Title and Description */}
        <div className="w-full md:w-1/2 flex-shrink-0 flex flex-col justify-between">
          <h2 className="text-3xl font-bold text-gray-800">JD2CV</h2>
          <div className="flex items-center gap-2 mt-8">
            <span className="text-xs font-medium text-gray-700 w-20 flex-shrink-0">Powered by</span>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value as 'gpt-4' | 'deepseek')}
              className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs bg-white w-24"
            >
              <option value="deepseek">DeepSeek</option>
              <option value="gpt-4">GPT-4</option>
            </select>
          </div>
        </div>
        
        {/* Right 50%: Search & Filter */}
        <div className="w-1/2 flex-shrink-0 space-y-2">
          {/* Search Row */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-700 w-16 flex-shrink-0">Search:</span>
            <input
              type="text"
              value={searchTitle}
              onChange={(e) => setSearchTitle(e.target.value)}
              placeholder="Title..."
              className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 w-24 text-xs"
            />
            <input
              type="text"
              value={searchCompany}
              onChange={(e) => setSearchCompany(e.target.value)}
              placeholder="Company..."
              className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 w-24 text-xs"
            />
            <div className="flex-1 flex justify-end pr-2">
              <button
                onClick={handleSearch}
                disabled={isSearching || !searchTitle || !searchCompany}
                className="w-16 px-2 py-1 bg-purple-500 text-white rounded-lg hover:bg-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:opacity-50 text-xs font-medium transition-colors"
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>
          
          {/* Pre-filter Row */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-700 w-16 flex-shrink-0">Pre-filter:</span>
            <select
              value={filterApplicationStage}
              onChange={(e) => handleApplicationStageChange(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 w-24 text-xs disabled:bg-gray-100 disabled:text-gray-500"
              disabled={!optionsLoaded}
            >
              <option value="">{optionsLoaded ? 'Stage...' : 'Loading...'}</option>
              {availableApplicationStages.map((stage) => (
                <option key={stage} value={stage}>
                  {stage}
                </option>
              ))}
            </select>
            <select
              value={filterRoleGroup}
              onChange={(e) => handleRoleGroupChange(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 w-24 text-xs disabled:bg-gray-100 disabled:text-gray-500"
              disabled={!optionsLoaded}
            >
              <option value="">{optionsLoaded ? 'Role...' : 'Loading...'}</option>
              {availableRoleGroups.map((roleGroup) => (
                <option key={roleGroup} value={roleGroup}>
                  {roleGroup}
                </option>
              ))}
            </select>
            <select
              value={filterFirmType}
              onChange={(e) => handleFirmTypeChange(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 w-24 text-xs disabled:bg-gray-100 disabled:text-gray-500"
              disabled={!optionsLoaded}
            >
              <option value="">{optionsLoaded ? 'Firm...' : 'Loading...'}</option>
              {availableFirmTypes.map((firmType) => (
                <option key={firmType} value={firmType}>
                  {firmType}
                </option>
              ))}
            </select>
            <div className="flex-1 flex justify-end pr-2">
              <div className="w-16"></div>
            </div>
          </div>
          
          {/* Final Row */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-700 w-16 flex-shrink-0">Final:</span>
            <select
              value={filterTitle}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 w-24 text-xs disabled:bg-gray-100 disabled:text-gray-500"
              disabled={!optionsLoaded}
            >
              <option value="">{optionsLoaded ? 'Title...' : 'Loading...'}</option>
              {availableTitles.map((title) => (
                <option key={title} value={title}>
                  {title}
                </option>
              ))}
            </select>
            <select
              value={filterCompany}
              onChange={(e) => handleCompanyChange(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 w-24 text-xs disabled:bg-gray-100 disabled:text-gray-500"
              disabled={!optionsLoaded}
            >
              <option value="">{optionsLoaded ? 'Company...' : 'Loading...'}</option>
              {availableCompanies.map((company) => (
                <option key={company} value={company}>
                  {company}
                </option>
              ))}
            </select>
            <div className="flex-1 flex justify-end gap-2 pr-2">
              <button
                onClick={handleFilterConfirm}
                disabled={isFiltering || !filterTitle || !filterCompany || !optionsLoaded}
                className="w-16 px-2 py-1 bg-purple-500 text-white rounded-lg hover:bg-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:opacity-50 text-xs font-medium transition-colors"
              >
                {isFiltering ? (
                  <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent mx-auto"></div>
                ) : (
                  'Confirm'
                )}
              </button>
              <button
                onClick={handleClearFilter}
                disabled={isClearing || isFiltering}
                className="w-16 px-2 py-1 bg-purple-500 text-white rounded-lg hover:bg-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:opacity-50 text-xs font-medium transition-colors"
              >
                {isClearing ? 'Clearing...' : 'Clear'}
              </button>
            </div>
          </div>
          
          {/* Status Messages - Only for Search and Clear, not Filtering */}
          {(isSearching || isClearing) && (
            <div className="flex justify-end">
              <div className="flex items-center gap-2 text-xs text-purple-600">
                <div className="animate-spin rounded-full h-3 w-3 border-2 border-purple-600 border-t-transparent"></div>
                <span>
                  {isSearching ? 'Searching database...' : 'Clearing form...'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Job Description Section */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2M5 6h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800">Job Description</h3>
        </div>
        
        <div className="space-y-6 mb-8">
          {/* Title and Company Input with Operations */}
          <div className="flex justify-between gap-6">
            {/* Left: Input Area */}
            <div className="w-1/2 space-y-4">
              {/* Title Row */}
              <div className="flex items-start gap-4">
                <label className="text-sm font-medium text-gray-700 w-20 flex-shrink-0">
                  Title <span className="text-purple-500">*</span>
                </label>
                <input
                  type="text"
                  value={jdData.title}
                  onChange={(e) => {
                    setJdData(prev => ({ ...prev, title: e.target.value }))
                    if (jdSaved) setJdSaved(false)
                    if (jdSaveError) setJdSaveError(false)
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Senior Software Engineer"
                />
              </div>
              
              {/* Company Row */}
              <div className="flex items-start gap-4">
                <label className="text-sm font-medium text-gray-700 w-20 flex-shrink-0">
                  Company <span className="text-purple-500">*</span>
                </label>
                <input
                  type="text"
                  value={jdData.company}
                  onChange={(e) => {
                    setJdData(prev => ({ ...prev, company: e.target.value }))
                    if (jdSaved) setJdSaved(false)
                    if (jdSaveError) setJdSaveError(false)
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Google"
                />
              </div>
            </div>
            
            {/* Right: Operations Area - Tab Layout */}
            <div className="w-full md:w-1/2 flex flex-col">
              {/* Tab Navigation */}
              <div className="mb-2.5">
                <nav className="flex justify-between" role="tablist">
                  {['Details', 'Status', 'PDF', 'More'].map((tabName, index) => {
                    const isActive = activeOperationTab === index
                    return (
                      <button
                        key={index}
                        role="tab"
                        aria-selected={isActive}
                        tabIndex={isActive ? 0 : -1}
                        onClick={() => setActiveOperationTab(index)}
                        className={`w-30 px-3 py-2 rounded-lg font-medium text-xs transition-all duration-300 focus:outline-none transform text-center ${
                          isActive 
                            ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md scale-105 font-semibold' 
                            : 'border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 hover:border-purple-300'
                        }`}
                      >
                        {tabName}
                      </button>
                    )
                  })}
                </nav>
              </div>
              
              {/* Tab Content */}
              <div className="bg-gray-100 border border-gray-200 rounded-lg p-3 h-[75px] overflow-y-auto shadow-inner">
                {activeOperationTab === 0 && (
                  /* Details Tab - Score + Comment */
                  <div className="space-y-2 h-full">
                    {/* Row 1: Score */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-2 items-center">
                      <label className="col-span-1 text-xs font-medium text-gray-700">Score:</label>
                      <div className="col-span-3 flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setTempMatchScore(star)}
                            className={`w-4 h-4 text-sm transition-colors ${
                              star <= tempMatchScore 
                                ? 'text-purple-500 hover:text-purple-600' 
                                : 'text-gray-300 hover:text-purple-300'
                            }`}
                          >
                            ★
                          </button>
                        ))}
                        {matchScore > 0 && <span className="ml-2 text-xs text-gray-600">({matchScore})</span>}
                      </div>
                      <button
                        onClick={() => handleMatchScoreSave(tempMatchScore)}
                        disabled={isSavingMatchScore || !currentPageId || tempMatchScore === matchScore}
                        className="col-span-1 w-full px-2 py-1 bg-purple-500 text-white rounded-lg hover:bg-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:opacity-50 text-xs transition-colors"
                      >
                        {isSavingMatchScore ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                    {/* Row 2: Comment */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-2 items-center">
                      <label className="col-span-1 text-xs font-medium text-gray-700">Comment:</label>
                      <input
                        type="text"
                        value={tempComment}
                        onChange={(e) => setTempComment(e.target.value)}
                        placeholder="Add notes..."
                        className="col-span-3 px-1.5 py-0.5 border border-gray-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-purple-400 focus:border-purple-300 bg-white text-xs hover:border-gray-300 transition-colors"
                      />
                      <button
                        onClick={() => handleCommentSave()}
                        disabled={isSavingComment || !currentPageId || tempComment === jdData.comment}
                        className="col-span-1 w-full px-2 py-1 bg-purple-500 text-white rounded-lg hover:bg-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:opacity-50 text-xs transition-colors"
                      >
                        {isSavingComment ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  </div>
                )}
                
                {activeOperationTab === 1 && (
                  /* Status Tab - 3 Dropdowns + 1 Save Button */
                  <div className="grid grid-cols-7 gap-2 items-center h-full">
                    <select
                      value={tempApplicationStage}
                      onChange={(e) => setTempApplicationStage(e.target.value)}
                      className="col-span-2 w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 bg-white text-xs"
                    >
                      <option value="">Stage...</option>
                      {availableApplicationStages.map((stage) => (
                        <option key={stage} value={stage}>
                          {stage}
                        </option>
                      ))}
                    </select>
                    <select
                      value={tempRoleGroup}
                      onChange={(e) => setTempRoleGroup(e.target.value)}
                      className="col-span-2 w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 bg-white text-xs"
                    >
                      <option value="">Group...</option>
                      {availableRoleGroups.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                    <select
                      value={tempFirmType}
                      onChange={(e) => setTempFirmType(e.target.value)}
                      className="col-span-2 w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 bg-white text-xs"
                    >
                      <option value="">Type...</option>
                      {availableFirmTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={handleStatusSave}
                      disabled={(isSavingApplicationStage || isSavingRoleGroup || isSavingFirmType) || !currentPageId || (tempApplicationStage === jdData.application_stage && tempRoleGroup === jdData.role_group && tempFirmType === jdData.firm_type)}
                      className="col-span-1 w-full px-2 py-1 bg-purple-500 text-white rounded-lg hover:bg-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:opacity-50 text-xs transition-colors"
                    >
                      {(isSavingApplicationStage || isSavingRoleGroup || isSavingFirmType) ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                )}
                
                {activeOperationTab === 2 && (
                  /* PDF Tab - Multi-row Layout */
                  <div className="space-y-2 h-full">
                    {/* Row 1: Current PDF */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-2 items-center">
                      <label className="col-span-1 text-xs font-medium text-gray-700">PDF:</label>
                      <div className="col-span-3">
                        {jdData.cv_pdf ? (
                          <a
                            href={jdData.cv_pdf}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors inline-block"
                          >
                            View Current
                          </a>
                        ) : (
                          <span className="text-xs text-gray-500">No PDF uploaded</span>
                        )}
                      </div>
                      <div className="col-span-1">
                        {/* Page link moved to More tab */}
                      </div>
                    </div>
                    {/* Row 2: Upload */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-2 items-center">
                      <label className="col-span-1 text-xs font-medium text-gray-700">Upload:</label>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handlePDFUpload(file)
                        }}
                        className="col-span-3 text-xs"
                        disabled={isUploadingPDF || !currentPageId}
                      />
                      <div className="col-span-1 text-xs">
                        {isUploadingPDF && <span className="text-purple-600">Uploading...</span>}
                      </div>
                    </div>
                    {/* Row 3: Status */}
                    <div className="text-xs">
                      {uploadSuccess && (
                        <span className={uploadSuccess.includes('success') ? 'text-purple-600' : 'text-purple-600'}>
                          {uploadSuccess}
                        </span>
                      )}
                    </div>
                  </div>
                )}
                
                {activeOperationTab === 3 && (
                  /* More Tab - Horizontal Button Layout */
                  <div className="flex gap-2 h-full items-center">
                    {/* Button 1: View Page */}
                    {currentPageId ? (
                      <a
                        href={`https://notion.so/${currentPageId.replace(/-/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center px-2 py-2 text-purple-600 border border-purple-300 rounded hover:border-purple-400 hover:text-purple-700 transition-colors text-xs font-medium"
                      >
                        View Page
                      </a>
                    ) : (
                      <div className="flex-1 flex items-center justify-center px-2 py-2 text-gray-400 border border-gray-200 rounded text-xs font-medium cursor-not-allowed">
                        View Page
                      </div>
                    )}
                    
                    {/* Button 2: Delete Record */}
                    {currentPageId ? (
                      <button
                        onClick={handleDeletePage}
                        disabled={isDeleting}
                        className="w-32 flex items-center justify-center px-2 py-2 text-purple-600 border border-purple-300 rounded hover:border-purple-400 hover:text-purple-700 transition-colors text-xs font-medium disabled:opacity-50 whitespace-nowrap"
                      >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                      </button>
                    ) : (
                      <div className="flex-1 flex items-center justify-center px-2 py-2 text-gray-400 border border-gray-200 rounded text-xs font-medium cursor-not-allowed">
                        Delete
                      </div>
                    )}
                    
                    {/* Button 3: Placeholder */}
                    <div className="flex-1 flex items-center justify-center px-2 py-2 text-gray-300 border-2 border-dashed border-gray-200 rounded text-xs font-medium">
                      Action 3
                    </div>
                    
                    {/* Button 4: Placeholder */}
                    <div className="flex-1 flex items-center justify-center px-2 py-2 text-gray-300 border-2 border-dashed border-gray-200 rounded text-xs font-medium">
                      Action 4
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Full Job Description <span className="text-purple-500">*</span>
          </label>
          
          {/* JD Tab Navigation */}
          <div className="mb-4">
            <nav className="flex justify-between" role="tablist">
              {['Job Description', 'Key Sentences', 'Key Words'].map((tabName, index) => {
                const isActive = activeJDTab === index
                return (
                  <button
                    key={index}
                    id={`jd-tab-${index}`}
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={`jd-panel-${index}`}
                    tabIndex={isActive ? 0 : -1}
                    onClick={() => setActiveJDTab(index)}
                    className={`w-80 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 focus:outline-none transform text-center ${
                      isActive 
                        ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md scale-105 font-semibold' 
                        : 'border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 hover:border-purple-300'
                    }`}
                  >
                    {tabName}
                  </button>
                )
              })}
            </nav>
          </div>
          
          {/* JD Tab Content - Fixed Height */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-inner h-[450px]">
            {activeJDTab === 0 ? (
              // Original Tab - Editable textarea with internal scrolling
              <div className="relative h-full">
                {/* Top gradient shadow */}
                <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-white to-transparent pointer-events-none z-10 rounded-t-lg"></div>
                {/* Bottom gradient shadow */}
                <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white to-transparent pointer-events-none z-10 rounded-b-lg"></div>
                
                <textarea
                  value={jdData.full_job_description}
                  onChange={(e) => {
                    setJdData(prev => ({ ...prev, full_job_description: e.target.value }))
                    if (jdSaved) setJdSaved(false)
                    if (jdSaveError) setJdSaveError(false)
                    if (generateError) setGenerateError(false)
                  }}
                  className="w-full h-full border-0 focus:outline-none resize-none text-gray-700 overflow-y-auto scrollbar-hide relative z-0"
                  placeholder="Paste the complete job description here..."
                />
              </div>
            ) : activeJDTab === 1 ? (
              // Key Sentences Tab
              <div className="relative h-full">
                {/* Top gradient shadow */}
                <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-white to-transparent pointer-events-none z-10 rounded-t-lg"></div>
                {/* Bottom gradient shadow */}
                <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white to-transparent pointer-events-none z-10 rounded-b-lg"></div>
                
                <div className="text-gray-700 leading-relaxed whitespace-pre-line h-full overflow-y-auto scrollbar-hide relative z-0">
                  {jdData.jd_key_sentences || 'No key sentences generated yet.'}
                </div>
              </div>
            ) : (
              // Key Words Tab
              <div className="relative h-full">
                {/* Top gradient shadow */}
                <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-white to-transparent pointer-events-none z-10 rounded-t-lg"></div>
                {/* Bottom gradient shadow */}
                <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white to-transparent pointer-events-none z-10 rounded-b-lg"></div>
                
                <div className="text-gray-700 leading-relaxed whitespace-pre-line h-full overflow-y-auto scrollbar-hide relative z-0">
                  {jdData.keywords_from_sentences || 'No keywords generated yet.'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Button Layout - Different for each tab */}
        <div className="space-y-3">
          {activeJDTab === 0 ? (
            // Original Tab: Only Save to Database button
            <div className="flex items-center gap-4 justify-end">
              <button
                onClick={handleJDSubmit}
                disabled={isSaving || !jdData.full_job_description.trim()}
                className="w-32 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 font-medium transition-colors duration-200 shadow-sm hover:shadow-md transition-shadow text-center text-sm"
                title="JD data → JD_records table → Saved record"
              >
                {isSaving ? 'Saving...' : jdSaveError ? 'Retry' : 'Save'}
              </button>
            </div>
          ) : activeJDTab === 1 ? (
            // Key Sentences Tab
            <div className="flex items-center justify-end">
              <button
                onClick={handleGenerateKeySentencesFromJD}
                disabled={isGeneratingKeySentences || !jdData.full_job_description.trim()}
                className="w-32 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 font-medium transition-colors duration-200 shadow-sm hover:shadow-md text-sm whitespace-nowrap text-center"
                title="JD text → JD_records.key_sentences → Updated record"
              >
                {isGeneratingKeySentences ? 'Generating...' : keySentencesError ? 'Retry' : 'Generate'}
              </button>
            </div>
          ) : (
            // Key Words Tab
            <div className="flex items-center justify-end">
              <button
                onClick={handleGenerateKeywordsFromSentences}
                disabled={isGeneratingKeywords || !jdData.jd_key_sentences.trim()}
                className="w-32 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 font-medium transition-colors duration-200 shadow-sm hover:shadow-md text-sm whitespace-nowrap text-center"
                title="Key sentences → JD_records.keywords → Updated record"
              >
                {isGeneratingKeywords ? 'Generating...' : keywordsError ? 'Retry' : 'Generate'}
              </button>
            </div>
          )}
        </div>
      </div>



      {/* Experience Hub Card */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800">Experience Hub</h3>
          </div>
          <button
            onClick={handleSaveAllMatched}
            disabled={isSavingAllMatched || !jdData.title || !jdData.company}
            className="w-32 px-6 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium whitespace-nowrap"
          >
            {isSavingAllMatched ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
                <span>{saveAllProgress}</span>
              </div>
            ) : (
              'Save All Matched'
            )}
          </button>
        </div>
        
        
        {/* Company Tabs */}
        <div className="mb-6">
          <nav className="flex justify-between" role="tablist">
            {companies.map((company, index) => {
              const isActive = activeExperienceHubTab === index
              const hasData = experienceData[company.name].length > 0
              
              return (
                <button
                  key={company.name}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => {
                    setActiveExperienceHubTab(index)
                    fetchExperienceData(company.name)
                  }}
                  className={`w-32 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 focus:outline-none transform text-center whitespace-nowrap ${
                    isActive 
                      ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md scale-105 font-semibold' 
                      : hasData
                        ? 'border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 hover:border-purple-300'
                        : 'border border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100 hover:border-gray-300'
                  }`}
                >
                  {company.displayName}
                </button>
              )
            })}
          </nav>
        </div>
        
        {/* Company Content */}
        {companies.map((company, index) => {
          const isActive = activeExperienceHubTab === index
          const filters = experienceFilters[company.name]
          const filteredExperiences = getFilteredExperiences(company.name)
          const loading = experienceLoading[company.name]
          
          if (!isActive) return null
          
          return (
            <div key={company.name} className="space-y-4">
              {/* Filters */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-700">Filter:</span>
                  <div className="flex items-center gap-6">
                    <button
                      onClick={() => toggleFilter(company.name, 'work')}
                      className="flex items-center gap-2 transition-colors duration-200"
                    >
                      <div className={`w-4 h-4 rounded-full border-2 border-purple-500 flex items-center justify-center ${
                        filters.work ? 'bg-purple-500' : 'bg-white'
                      }`}>
                        {filters.work && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                      <span className="text-sm text-gray-700">Work</span>
                    </button>
                    <button
                      onClick={() => toggleFilter(company.name, 'project')}
                      className="flex items-center gap-2 transition-colors duration-200"
                    >
                      <div className={`w-4 h-4 rounded-full border-2 border-purple-500 flex items-center justify-center ${
                        filters.project ? 'bg-purple-500' : 'bg-white'
                      }`}>
                        {filters.project && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                      <span className="text-sm text-gray-700">Project</span>
                    </button>
                  </div>
                  
                  {/* Target Role Filter */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Target Role:</span>
                    <select
                      value={targetRoleFilters[company.name]}
                      onChange={(e) => setTargetRoleFilters(prev => ({
                        ...prev,
                        [company.name]: e.target.value
                      }))}
                      className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm min-w-40"
                    >
                      <option value="all">All Target Roles</option>
                      {getTargetRoleOptions(company.name).map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddForm(company.name)}
                  className="w-32 px-4 py-2 bg-purple-500 text-white text-sm rounded-lg hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium transition-all duration-200 whitespace-nowrap"
                >
                  Add
                </button>
              </div>
              
              {/* Experience Records */}
              <div className="space-y-4 min-h-[400px] transition-all duration-300">
                {loading ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent"></div>
                    <span className="ml-3 text-gray-600">Loading experiences...</span>
                  </div>
                ) : filteredExperiences.length === 0 ? (
                  <div className="text-center p-8 text-gray-500">
                    <p>No experiences found for the selected filters.</p>
                    <button 
                      onClick={() => setShowAddForm(company.name)}
                      className="mt-2 text-purple-600 hover:text-purple-700 text-sm"
                    >
                      Add New Experience
                    </button>
                  </div>
                ) : (
                  filteredExperiences.map((experience) => (
                    <div key={experience.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      {/* Header Row: Title 30%, Keywords 60%, Time 10% */}
                      <div className="flex items-start mb-2">
                        <div className="w-[30%]">
                          <span className="font-bold text-gray-900 text-sm">Title:</span> <span className="text-sm">{experience.title}</span>
                        </div>
                        <div className="w-[60%]">
                          <span className="font-bold text-gray-700 text-sm">Keywords:</span>{' '}
                          {experience.keywords && experience.keywords.length > 0 ? (
                            experience.keywords.map((keyword, i) => (
                              <span key={i} className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded mr-1">
                                {keyword}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-500 text-sm">—</span>
                          )}
                        </div>
                        <div className="w-[10%] text-right">
                          <span className="text-xs text-gray-600">{experience.time || '—'}</span>
                        </div>
                      </div>
                      
                      {/* Second Row: Role Group左对齐, Comment左对齐 */}
                      <div className="flex items-start mb-3">
                        <div className="w-[30%]">
                          <span className="font-bold text-gray-700 text-sm">Role Group:</span>{' '}
                          {experience.role_group ? (
                            <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                              {experience.role_group}
                            </span>
                          ) : (
                            <span className="text-gray-500 text-sm">—</span>
                          )}
                        </div>
                        <div className="w-[60%]">
                          <span className="font-bold text-gray-700 text-sm">Comment:</span> <span className="text-sm">{experience.comment || '—'}</span>
                        </div>
                        <div className="w-[10%]">
                          {/* 空白区域 */}
                        </div>
                      </div>

                      {/* Third Row: Target Role */}
                      <div className="flex items-start mb-3">
                        <div className="flex-1">
                          <span className="font-bold text-gray-700 text-sm">Target Role:</span>{' '}
                          {experience.target_role ? (
                            <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded mr-1">
                              {experience.target_role}
                            </span>
                          ) : (
                            <span className="text-gray-500 text-sm">—</span>
                          )}
                        </div>
                      </div>
                      
                      {/* Experience Content */}
                      <div>
                        <div className="font-bold text-gray-700 mb-1">Experience:</div>
                        <div className="text-gray-800 leading-relaxed pl-4 whitespace-pre-line">
                          {experience.experience || '—'}
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex justify-end mt-4 pt-3 border-t border-gray-100">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleGenerateCustomizedExperience(company.name, experience)}
                            disabled={isGeneratingCustomized[`${company.name}-${experience.id}`] || !jdData.keywords_from_sentences?.trim() || !experience.experience?.trim()}
                            className="w-32 px-3 py-1 text-xs bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap text-center"
                            title="JD + Experience → Professional Experience DB → Customized text"
                          >
                            {isGeneratingCustomized[`${company.name}-${experience.id}`] ? 'Generating...' : 'Generate'}
                          </button>
                          <button 
                            onClick={() => handleSaveToPage(company.name, experience)}
                            disabled={isSavingToPage[`${company.name}-${experience.id}`] || !jdData.title?.trim() || !jdData.company?.trim()}
                            className="w-32 px-3 py-1 text-xs bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap text-center"
                            title="Experience record → JD_records table → JD page display"
                          >
                            {isSavingToPage[`${company.name}-${experience.id}`] ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent mx-auto"></div>
                            ) : 'Save'}
                          </button>
                          <button 
                            onClick={() => setEditingRecord(experience)}
                            className="w-32 px-3 py-1 text-xs bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors duration-200"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => deleteExperienceRecord(company.name, experience.id)}
                            className="w-32 px-3 py-1 text-xs bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors duration-200"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Add/Edit Experience Modal */}
      {(showAddForm || editingRecord) && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
          <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-6 w-full max-w-6xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">
                {editingRecord ? 'Edit Experience' : 'Add New Experience'} - {companies.find(c => c.name === (showAddForm || companies.find(comp => experienceData[comp.name].some(exp => exp.id === editingRecord?.id))?.name))?.displayName}
              </h3>
              <button
                onClick={() => {
                  setEditingRecord(null)
                  setShowAddForm(null)
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <ExperienceForm
              initialData={editingRecord}
              companyName={showAddForm || (editingRecord ? companies.find(c => experienceData[c.name].some(exp => exp.id === editingRecord.id))?.name : null)}
              onSave={async (data) => {
                const companyName = showAddForm || companies.find(c => experienceData[c.name].some(exp => exp.id === editingRecord?.id))?.name
                if (companyName) {
                  if (editingRecord) {
                    await updateExperienceRecord(companyName, { ...data, id: editingRecord.id })
                  } else {
                    await createExperienceRecord(companyName, data)
                  }
                }
              }}
              onCancel={() => {
                setEditingRecord(null)
                setShowAddForm(null)
              }}
            />
          </div>
        </div>
      )}

      {/* Customize Error Modal */}
      {showCustomizeError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* Background overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-25" onClick={() => setShowCustomizeError(false)}></div>
          {/* Modal content */}
          <div className="relative bg-white rounded-lg shadow-xl border border-purple-200 p-6 max-w-md w-full">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-purple-800">Generation Error</h3>
            </div>
            <p className="text-gray-700 mb-6">{customizeError}</p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowCustomizeError(false)}
                className="w-24 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors duration-200 whitespace-nowrap"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PromptManager Component */}
      <PromptManager
        prompts={jd2cvPrompts}
        onPromptsChange={setJd2cvPrompts}
        position="bottom-right"
        storageKey="jd2cv-prompts"
        buttonIcon="</>"
      />

      {/* Save to Page Error Modal */}
      {showSaveToPageError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* Background overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-25" onClick={() => setShowSaveToPageError(false)}></div>
          {/* Modal content */}
          <div className="relative bg-white rounded-lg shadow-xl border border-purple-200 p-6 max-w-md w-full">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-purple-800">Save Error</h3>
            </div>
            <p className="text-gray-700 mb-6">{saveToPageError}</p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowSaveToPageError(false)}
                className="w-24 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors duration-200 whitespace-nowrap"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
        </>
      ) : (
        <DashboardView />
      )}

    </div>
  )
}