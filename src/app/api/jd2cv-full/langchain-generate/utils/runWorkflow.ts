import { classifierAgent, ClassificationResult } from '../agents/classifierAgent'
import { experienceGeneratorAgent } from '../agents/experienceGeneratorAgent'
import { reviewerAgent } from '../agents/reviewerAgent'

export type StageKey = 'classifier' | 'experience' | 'reviewer'

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

export interface ClassifierStepUpdate extends StepUpdateBase {
  stage: 'classifier'
  roleType: string
  keywords: string[]
  insights: string[]
}

export interface ExperienceStepUpdate extends StepUpdateBase {
  stage: 'experience'
  workExperience: string
}

export interface ReviewerStepUpdate extends StepUpdateBase {
  stage: 'reviewer'
  personalInfo: any
  workExperience: string
}

// New interface for streaming content updates within a stage
export interface StreamContentUpdate {
  stage: StageKey
  streamingContent: string
  isComplete: boolean
}

export type StepUpdate =
  | ClassifierStepUpdate
  | ExperienceStepUpdate
  | ReviewerStepUpdate
  | StreamContentUpdate

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

  // Step 1 - Classifier Agent
  const parentStart = Date.now()
  const classifierResult = await classifierAgent(jd, (chunk: string) => {
    if (onStep) {
      // Send streaming content update
      onStep({
        stage: 'classifier',
        streamingContent: chunk,
        isComplete: false
      } as StreamContentUpdate)
    }
  })
  const classifierDuration = Date.now() - parentStart

  const classifierContext: ClassificationResult = classifierResult

  const classifierUpdate: ClassifierStepUpdate = {
    stage: 'classifier',
    roleType: classifierContext.roleType,
    keywords: classifierContext.keywords,
    insights: classifierContext.insights,
    tokens: classifierContext.tokens,
    duration: classifierDuration
  }
  stepDetails.classifier = classifierUpdate
  cumulativeTokens = addTokens(cumulativeTokens, classifierContext.tokens)
  if (onStep) await onStep(classifierUpdate)

  // Step 2 - Experience Generator
  const experienceStart = Date.now()
  const experienceResult = await experienceGeneratorAgent(classifierContext, (chunk: string) => {
    if (onStep) {
      // Send streaming content update
      onStep({
        stage: 'experience',
        streamingContent: chunk,
        isComplete: false
      } as StreamContentUpdate)
    }
  })
  const customizedWorkExperience = experienceResult.workExperience
  const experienceDuration = Date.now() - experienceStart

  const experienceUpdate: ExperienceStepUpdate = {
    stage: 'experience',
    workExperience: customizedWorkExperience,
    tokens: experienceResult.tokens,
    duration: experienceDuration
  }
  stepDetails.experience = experienceUpdate
  cumulativeTokens = addTokens(cumulativeTokens, experienceResult.tokens)
  if (onStep) await onStep(experienceUpdate)

  // Step 3 - Reviewer
  const reviewerStart = Date.now()
  const reviewerResult = await reviewerAgent({
    workExperience: customizedWorkExperience,
    personalInfo,
    originalPersonalInfo: personalInfo,
    jd,
    classification: classifierContext,
    onStreamChunk: (chunk: string) => {
      if (onStep) {
        // Send streaming content update
        onStep({
          stage: 'reviewer',
          streamingContent: chunk,
          isComplete: false
        } as StreamContentUpdate)
      }
    }
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
    roleClassification: classifierContext.roleType,
    personalInfo: reviewerResult.personalInfo,
    workExperience: reviewerResult.workExperience,
    processingTime,
    stepDetails,
    tokenUsage: cumulativeTokens
  }
}
