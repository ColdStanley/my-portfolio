import { parentAgent } from '../agents/parentAgent'
import { roleExpertAgent, ParentInsights } from '../agents/roleExpertAgent'
import { nonWorkExpertAgent } from '../agents/nonWorkExpertAgent'
import { reviewerAgent } from '../agents/reviewerAgent'

export type StageKey = 'parent' | 'roleExpert' | 'nonWorkExpert' | 'reviewer'

export interface TokensUsage {
  prompt: number
  completion: number
  total: number
}

export interface StepUpdateBase {
  stage: StageKey
  duration: number
  tokens: TokensUsage
}

export interface ParentStepUpdate extends StepUpdateBase {
  stage: 'parent'
  roleClassification: string
  focusPoints: string[]
  keywords: string[]
  keySentences: string[]
}

export interface RoleExpertStepUpdate extends StepUpdateBase {
  stage: 'roleExpert'
  workExperience: string
}

export interface NonWorkStepUpdate extends StepUpdateBase {
  stage: 'nonWorkExpert'
  personalInfo: any
}

export interface ReviewerStepUpdate extends StepUpdateBase {
  stage: 'reviewer'
  personalInfo: any
  workExperience: string
}

export type StepUpdate =
  | ParentStepUpdate
  | RoleExpertStepUpdate
  | NonWorkStepUpdate
  | ReviewerStepUpdate

export interface WorkflowResult {
  roleClassification: string
  personalInfo: any
  workExperience: string
  processingTime: number
  stepDetails: Record<StageKey, StepUpdate>
  tokenUsage: TokensUsage
}

interface WorkflowParams {
  jd: { title: string; full_job_description: string }
  personalInfo: any
  onStep?: (update: StepUpdate) => Promise<void> | void
}

const addTokens = (a: TokensUsage, b: TokensUsage): TokensUsage => ({
  prompt: a.prompt + b.prompt,
  completion: a.completion + b.completion,
  total: a.total + b.total
})

export async function runLangchainWorkflow({ jd, personalInfo, onStep }: WorkflowParams): Promise<WorkflowResult> {
  const workflowStart = Date.now()

  const stepDetails = {} as Record<StageKey, StepUpdate>
  let cumulativeTokens: TokensUsage = { prompt: 0, completion: 0, total: 0 }

  // Step 1 - Parent Agent
  const parentStart = Date.now()
  const parentResult = await parentAgent(jd)
  const parentDuration = Date.now() - parentStart

  const parentContext: ParentInsights = {
    classification: parentResult.classification,
    focusPoints: parentResult.focusPoints,
    keywords: parentResult.keywords,
    keySentences: parentResult.keySentences
  }

  const parentUpdate: ParentStepUpdate = {
    stage: 'parent',
    roleClassification: parentResult.classification,
    focusPoints: parentContext.focusPoints,
    keywords: parentContext.keywords,
    keySentences: parentContext.keySentences,
    tokens: parentResult.tokens,
    duration: parentDuration
  }
  stepDetails.parent = parentUpdate
  cumulativeTokens = addTokens(cumulativeTokens, parentResult.tokens)
  if (onStep) await onStep(parentUpdate)

  // Step 2 - Role Expert
  const roleStart = Date.now()
  const roleExpertResult = await roleExpertAgent(jd.title, parentContext)
  const customizedWorkExperience = roleExpertResult.content
  const roleDuration = Date.now() - roleStart

  const roleUpdate: RoleExpertStepUpdate = {
    stage: 'roleExpert',
    workExperience: customizedWorkExperience,
    tokens: roleExpertResult.tokens,
    duration: roleDuration
  }
  stepDetails.roleExpert = roleUpdate
  cumulativeTokens = addTokens(cumulativeTokens, roleExpertResult.tokens)
  if (onStep) await onStep(roleUpdate)

  // Step 3 - Non-work Expert
  const nonWorkStart = Date.now()
  const nonWorkExpertResult = await nonWorkExpertAgent(customizedWorkExperience, personalInfo, parentContext)
  const customizedPersonalInfo = nonWorkExpertResult.content
  const nonWorkDuration = Date.now() - nonWorkStart

  const nonWorkUpdate: NonWorkStepUpdate = {
    stage: 'nonWorkExpert',
    personalInfo: customizedPersonalInfo,
    tokens: nonWorkExpertResult.tokens,
    duration: nonWorkDuration
  }
  stepDetails.nonWorkExpert = nonWorkUpdate
  cumulativeTokens = addTokens(cumulativeTokens, nonWorkExpertResult.tokens)
  if (onStep) await onStep(nonWorkUpdate)

  // Step 4 - Reviewer
  const reviewerStart = Date.now()
  const reviewerResult = await reviewerAgent({
    workExperience: customizedWorkExperience,
    personalInfo: customizedPersonalInfo,
    originalPersonalInfo: personalInfo,
    jd,
    parentInsights: parentContext
  })
  const reviewerDuration = Date.now() - reviewerStart

  const reviewerUpdate: ReviewerStepUpdate = {
    stage: 'reviewer',
    personalInfo: reviewerResult.personalInfo,
    workExperience: reviewerResult.workExperience,
    tokens: reviewerResult.tokens,
    duration: reviewerDuration
  }
  stepDetails.reviewer = reviewerUpdate
  cumulativeTokens = addTokens(cumulativeTokens, reviewerResult.tokens)
  if (onStep) await onStep(reviewerUpdate)

  const processingTime = Date.now() - workflowStart

  return {
    roleClassification: parentResult.classification,
    personalInfo: reviewerResult.personalInfo,
    workExperience: reviewerResult.workExperience,
    processingTime,
    stepDetails,
    tokenUsage: cumulativeTokens
  }
}
