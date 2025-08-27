// JD Record type definition for Supabase jd_records table
export interface JDRecord {
  id: string
  user_id: string
  created_at: string
  updated_at: string

  // Core fields
  title: string
  company: string
  full_job_description?: string

  // Analysis results
  jd_key_sentences?: string
  keywords_from_sentences?: string
  match_score?: number

  // Classification tags
  application_stage?: string
  role_group?: string
  firm_type?: string
  comment?: string

  // CV related
  cv_pdf_url?: string
  cv_pdf_filename?: string
}

// For API requests
export interface CreateJDRequest {
  title: string
  company: string
  full_job_description?: string
  application_stage?: string
  role_group?: string
  firm_type?: string
  comment?: string
  match_score?: number
}

export interface UpdateJDRequest extends Partial<CreateJDRequest> {
  id: string
}

// Application stage options
export const APPLICATION_STAGES = [
  'Applied',
  'Interview Scheduled',
  'In Process',
  'Offer',
  'Rejected',
  'Withdrawn'
] as const

export type ApplicationStage = typeof APPLICATION_STAGES[number]