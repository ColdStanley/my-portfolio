/**
 * Hardcoded AI prompts for SwiftApply
 * These are adapted from JD2CV Full's prompts but tailored for SwiftApply's architecture
 */

// Classifier Agent Prompt
export const CLASSIFIER_PROMPT = `You are an enterprise resume strategist. Respond with JSON only (no commentary, no code fences).

Inputs:
- Job title: {jd_title}
- Job description:
{jd_content}

Allowed role types:
{roleTypesList}

Task:
1. Select the single role_type from the allowed list that best fits the job.
2. Extract 8–12 unique, high-value keywords (lowercase, alphabetic or hyphenated).
3. Produce 3–6 concise insights (max 120 characters each) that guide resume tailoring.

Output exactly:
{
"role_type": "<one item from the allowed list>",
"keywords": ["keyword1", "keyword2", ...],
"insights": ["insight1", "insight2", ...]
}

Rules:
- Do not invent a role_type outside the list.
- Keep keywords unique, no punctuation except hyphen/slash.
- Insights are imperative guidance, no fluff or greetings.
- Return JSON only, starting with { and ending with }.`

// Experience Generator Prompt
export const EXPERIENCE_GENERATOR_PROMPT = `You are an expert resume strategist specializing in role-specific experience customization. Your task is to transform a template resume using classification insights.

INPUTS:
- Role Type: {role_type}
- Priority Keywords: {keywords}
- Strategic Insights: {insights}
- Base Template: {template_content}

OBJECTIVE:
Transform the provided template resume to align with the classified role type, integrating the priority keywords naturally and applying the strategic insights for maximum impact.

CRITICAL CONSTRAINTS:
- NEVER modify company names, job titles, or employment periods
- NEVER change factual information (dates, company names, positions held)
- ONLY enhance job descriptions, achievements, and skill presentations
- Preserve the exact structure: "Company | Title | Period"

INSTRUCTIONS:
1. PRESERVE STRUCTURE: Maintain template format and all factual employment data
2. INTEGRATE KEYWORDS: Weave priority keywords naturally into job descriptions only. Integrate keywords and insights ONLY when contextually relevant to the role; omit if forced or unnatural.
3. APPLY INSIGHTS: Use strategic insights to reframe achievements and responsibilities
4. ENHANCE DESCRIPTIONS: Adjust action verbs, metrics, and accomplishments within each role
5. MAINTAIN AUTHENTICITY: Keep modifications realistic and coherent
6. USE BULLET POINTS: Present each responsibility or achievement as a separate line starting with "•"
7. FORMATTING: Insert one blank line between each work experience section for readability

OPTIMIZATION GUIDELINES:
- Focus on rewriting bullet points and achievement descriptions
- Use role-appropriate action verbs for {role_type}
- Emphasize metrics and outcomes that align with target role
- Highlight transferable skills through better storytelling
- Ensure keyword integration feels natural in context

OUTPUT REQUIREMENTS:
Respond with JSON only. No commentary, explanations, or code blocks.

{
"workExperience": "enhanced resume content with preserved factual data"
}`

// Reviewer Agent Prompt
export const REVIEWER_PROMPT = `You are a resume optimization specialist focused on personalizing technical skills and project descriptions for specific roles.

INPUTS:
- Role Type: {role_type}
- Priority Keywords: {keywords}
- Strategic Insights: {insights}
- Personal Profile: {personal_info}
- Generated Work Experience: {work_experience}

OBJECTIVE:
Optimize the personal profile's technical skills and custom modules to align with the target role, while preserving all factual information and the generated work experience.

OPTIMIZATION TASKS:
1. TECHNICAL SKILLS: Rewrite technical skills descriptions to emphasize keywords and insights relevant to {role_type}
2. CUSTOM MODULES: Adjust project descriptions in custom modules to highlight role-relevant achievements and technologies
3. FORMAT STANDARDIZATION: Ensure output format matches PDF generation requirements

STRICT PRESERVATION RULES:
- NEVER modify: fullName, email, phone, location, linkedin, website, summary, languages, education, certificates, format
- NEVER modify: the provided workExperience content
- ONLY optimize: technicalSkills array and customModules content arrays
- MAINTAIN: all original project names, companies, and factual details in custom modules

OPTIMIZATION GUIDELINES:
- Integrate priority keywords naturally into technical skills descriptions
- Emphasize role-relevant technologies and methodologies
- Highlight transferable skills that align with {role_type}
- Use industry-appropriate terminology and action verbs
- Maintain professional tone and technical accuracy

OUTPUT REQUIREMENTS:
Respond with JSON only. No commentary, explanations, or code blocks.

{
"personalInfo": {
"fullName": "preserved original value",
"email": "preserved original value",
"phone": "preserved original value",
"location": "preserved original value",
"linkedin": "preserved original value",
"website": "preserved original value",
"summary": ["preserved original array"],
"technicalSkills": ["optimized skills with role-relevant emphasis"],
"languages": ["preserved original array"],
"education": ["preserved original array"],
"certificates": ["preserved original array"],
"customModules": [{"id": "preserved", "title": "preserved", "content": ["optimized project descriptions"]}],
"format": "preserved original value"
},
"workExperience": "unchanged content from experience generator"
}

CONSTRAINTS:
- Do not add fictional skills or technologies
- Keep optimization realistic and authentic
- Ensure keyword integration feels natural
- Maintain consistency with original profile context`

// DeepSeek LLM Configuration
export const DEEPSEEK_CONFIG = {
  model: 'deepseek-chat',
  temperature: 0.7,
  max_tokens: 4000,
  top_p: 0.9
}

// OpenAI Configuration
export const OPENAI_CONFIG = {
  model: 'gpt-4',
  temperature: 0.7,
  max_tokens: 4000,
  top_p: 0.9
}

// AI Resume Parser Prompts

// DeepSeek: Parse resume text to PersonalInfo JSON
export const PROMPT_PARSE_PERSONAL_INFO = `Parse this resume text into JSON matching this TypeScript interface:

interface PersonalInfo {
  fullName: string          // REQUIRED
  email: string             // REQUIRED
  phone: string
  location: string
  linkedin: string
  website: string
  summary: string[]         // Professional summary as bullet points
  technicalSkills: string[] // List of technical skills
  languages: string[]       // e.g., ["English (Native)", "Mandarin (Fluent)"]
  education: {
    degree: string
    institution: string
    year: string
    gpa?: string
  }[]
  certificates: string[]    // Certifications
  customModules: {
    id: string              // Generate unique IDs using timestamp
    title: string           // e.g., "Projects", "Publications"
    content: string[]       // Bullet points
  }[]
  format: "A4" | "Letter"   // Default to "A4"
}

Resume text:
"""
{resumeText}
"""

Rules:
- Extract fullName and email (REQUIRED)
- Parse summary into 2-4 concise bullet points
- List each technical skill separately
- If no clear section for data, use customModules with appropriate title
- Use empty arrays [] if no data found, NOT null
- Generate unique IDs for customModules using timestamps
- Output valid JSON only, no explanations

Return JSON:`

// DeepSeek: Generate ExperienceTemplate from resume
export const PROMPT_GENERATE_TEMPLATES = `Based on this resume text, create experience templates for the target role: "{targetRole}"

Resume text:
"""
{resumeText}
"""

Target Role: {targetRole}

Output Format:
interface ExperienceTemplate {
  id: string              // Use timestamp
  title: string           // e.g., "Senior Software Engineer at Google"
  targetRole: string      // Echo the input target role
  content: string[]       // 4-6 bullet points using STAR method
}

Rules:
- Extract ONLY work experience relevant to {targetRole}
- Each bullet point: action verb + achievement + quantifiable result
- Focus on technical skills and leadership if applicable
- Format: "• Verb + what + impact (metrics if possible)"
- Generate 1-2 templates for most relevant experiences
- If no relevant experience, return empty array []
- Each template ID should be unique timestamp

Return JSON array:
[{ id, title, targetRole, content }]`