import { invokeDeepSeek } from '../utils/deepseekLLM'

// Role Expert Agent - Work Experience Customization
export async function roleExpertAgent(
  jd: { title: string; full_job_description: string },
  personalInfo: any,
  roleClassification: string
): Promise<{ content: string; tokens: { prompt: number; completion: number; total: number } }> {

  // Get the work experience template based on role classification
  const workExperienceTemplate = getWorkExperienceByRole(roleClassification)

  const customizationPrompt = `
You are a senior resume experience writing expert specializing in ${roleClassification} roles.
Your task is to customize the existing work experiences so they align with the target Job Description.

JD Title: ${jd.title}
JD Description: ${jd.full_job_description}

Current work experiences:
${workExperienceTemplate}

Strict Instructions:
1. **Preserve authenticity**: Do not invent or exaggerate facts, numbers, or industries not present in the working experience. Only rephrase or highlight existing details.

2. **Keep structure stable**: Keep all original Company, Title, and Time period. Keep the same number of bullet points per experience. Rewrite each bullet, but do not merge or split.

3. **Customization rule**: Use JD keywords only as a **lens to rephrase** bullets. If a bullet naturally connects with a keyword, emphasize it with JD-style language. If no natural connection, keep the bullet with only minimal polish. Do not add keywords that don't logically fit.

4. **Language style**: Concise, professional, measurable impact. Strong action verbs. No personality traits unless already in the text.

5. **Output format**:
   Company | Title | Time
   - Bullet 1
   - Bullet 2
   (and so on)

6. **Quality enhancement rules**:
   - Each bullet should begin with a strong action verb and focus on **what I did + how I did it + impact/result**.
   - Whenever possible, emphasize **measurable outcomes** (%, $, growth, efficiency, scale, adoption, satisfaction, or other concrete indicators).
   - Prioritize achievements that demonstrate **positive impact** in areas such as business outcomes, client/stakeholder value, process or efficiency improvements, solution delivery, innovation, or collaboration.
   - Keep wording precise and avoid vague adjectives like "great", "successful", "effective".
   - Ensure every bullet communicates **tangible value delivered to the organization, clients, team, or market**, not just tasks performed.

Do not include any explanations, introductions, or extra text.
`

  try {
    // Use DeepSeek LLM for work experience customization
    const result = await invokeDeepSeek(customizationPrompt, 0.3, 6000)
    return { content: result.content.trim(), tokens: result.tokens }

  } catch (error) {
    console.error('Role Expert Agent error:', error)
    // Return template with basic customization as fallback
    return { content: workExperienceTemplate, tokens: { prompt: 0, completion: 0, total: 0 } }
  }
}

function getWorkExperienceByRole(role: string): string {
  const templates = {
    'Sales': `
StanleyHi | Founder & Full-Stack Developer | 2024 – Present

Built and commercialized 4 SaaS-style platforms (IELTS Engine, JD2CV, Readlingua, Strategy–Plan–Task), demonstrating ability to identify opportunities and convert them into market-ready offerings.

Acquired early adopters through product demos, feedback sessions, and word-of-mouth outreach, validating customer demand and accelerating adoption.

Negotiated partnerships with API providers (Gemini, DeepSeek, Hugging Face), expanding product capability and sales value proposition.

Demonstrated entrepreneurial sales acumen by aligning technical innovation with customer needs and potential revenue streams.

Savvy Pro | Academic Tutor – STEM | 2023 – 2025

Generated repeat business by delivering measurable ROI—100% pass rate and 25%+ score improvements for 10+ international students.

Grew client base across multiple countries (Italy, UK, Australia) through referrals and proactive outreach.

Designed and pitched customized learning modules as premium services, increasing upsell and long-term retention.

NCS | Financial Services Industry Lead | 2021 – 2022

Drove $5M+ pipeline and closed $2M+ in contracts by leading GTM and sales strategy across China and Singapore.

Created and pitched 3 fintech solutions that resonated with client pain points, shortening sales cycles by 25%.

Partnered with ecosystem vendors to strengthen solution offering and accelerate revenue growth.

Built executive relationships and secured sponsorship from C-level clients, contributing to 30% YoY FS vertical growth.

IceKredit | General Manager – Financial Services Industry | 2017 – 2020

Closed 20+ enterprise deals with Tier-1 banks and licensed finance firms, including $1M+ contracts for AI credit scoring solutions.

Expanded recurring revenue streams by packaging 5 standardized products, increasing scalability and reducing sales cycle complexity.

Established 6+ strategic partnerships with compliance and data vendors to enhance competitive positioning and open new revenue channels.

Consistently achieved multi-million-dollar annual sales targets through new client acquisition and account expansion.

Huawei | Technical Key Account Manager | 2016 – 2017

Supported $10M+ total deal value across one 8-figure and multiple 7-figure enterprise banking projects.

Designed and presented 10+ tailored solution proposals to C-level stakeholders, directly influencing purchase decisions.

Partnered with internal product and delivery teams to accelerate procurement timelines by 30%, enabling faster deal closure.

Strengthened long-term account trust, leading to repeat sales opportunities.

Diebold Nixdorf | Solution Architect | 2011 – 2016

Delivered 35+ end-to-end solutions to 15+ regional banks, creating multi-year renewal and upsell opportunities.

Helped clients achieve operational efficiency gains (25%) and downtime reduction (18%), contributing to high retention and follow-on sales.

Acted as sales–delivery bridge in 3 regional projects, demonstrating ability to convert technical expertise into revenue outcomes.

Expanded business presence across China and SEA through localized solution delivery.

Fuji Xerox | Solution Engineer – Banking | 2009 – 2011

Contributed to consistent quota overachievement (110%+ YoY) by customizing solutions for 12+ enterprise banking clients.

Supported presales efforts on 15+ opportunities, providing documentation and demos that accelerated deal closure cycles by ~20%.

Strengthened brand visibility by conducting 50+ training sessions and 10+ industry demos, generating new client interest.

Collaborated with account teams to expand wallet share among existing clients, ensuring sustained revenue growth.
`,
    'Business Development': `
StanleyHi | Founder & Full-Stack Developer | 2024 – Present

Launched and commercialized 4 self-built platforms (IELTS Engine, JD2CV, Readlingua, Strategy–Plan–Task), demonstrating entrepreneurial ability to identify opportunities and convert them into products with adoption potential.

Engaged early users across education and AI markets, gathering feedback to validate product–market fit and strengthen go-to-market positioning.

Built partnerships with API providers (Gemini, DeepSeek, Hugging Face) to enhance product capability and expand solution competitiveness.

Showcased strong business development mindset: translating technical capabilities into market-ready solutions that attract users and open commercial opportunities.

Savvy Pro | Academic Tutor – STEM | 2023 – 2025

Generated repeat business by delivering measurable results—100% pass rate and 25%+ score improvements for 10+ students globally.

Expanded client base across Italy, UK, and Australia through word-of-mouth referrals, demonstrating ability to build trust and grow accounts.

Designed customized learning modules as value-added services, increasing retention and long-term engagement.

NCS | Financial Services Industry Lead | 2021 – 2022

Drove $5M+ in pipeline and closed $2M+ solution contracts by leading GTM strategy across China and Singapore.

Built strategic partnerships with ecosystem vendors to strengthen fintech solution offerings and accelerate deal closure.

Secured executive sponsorship by presenting localized FS strategy to C-levels, contributing to 30% YoY vertical growth.

Expanded footprint in new markets by designing and packaging 3 fintech solutions that addressed regulatory and integration requirements.

IceKredit | General Manager – Financial Services Industry | 2017 – 2020

Closed 20+ enterprise deals with Tier-1 banks and finance firms, including $1M+ contracts for AI credit scoring platforms.

Expanded recurring revenue streams by standardizing 5 commercial products, increasing scalability and customer adoption.

Forged 6+ partnerships with data vendors and compliance providers, broadening solution competitiveness and market reach.

Delivered consistent YoY revenue growth by combining new client acquisition with expansion of existing accounts.

Huawei | Technical Key Account Manager | 2016 – 2017

Supported $10M+ deal value across one 8-figure and multiple 7-figure projects with Ping An Bank and CMB.

Secured long-term client trust by designing 10+ solution proposals that addressed compliance and integration challenges.

Strengthened pipeline growth by aligning with executive stakeholders, leading to faster approvals and additional project scope.

Expanded influence within client organizations by positioning Huawei as a trusted strategic partner.

Diebold Nixdorf | Solution Architect | 2011 – 2016

Delivered 35+ self-service banking solutions, strengthening long-term client relationships and opening repeat business opportunities.

Reduced downtime by 18% across 1,200+ ATMs, directly improving client satisfaction and driving follow-on engagements.

Partnered with 15+ enterprise clients to redesign outsourcing models, resulting in 25% efficiency gains and multi-year renewals.

Supported regional business growth in China and SEA by localizing solution delivery to meet market-specific requirements.

Fuji Xerox | Solution Engineer – Banking | 2009 – 2011

Supported account teams in achieving 110%+ YoY sales by customizing banking solutions for 12+ enterprise clients.

Drove pipeline expansion by delivering 50+ training sessions and 10+ industry demos, accelerating sales cycles by ~20%.

Strengthened BD impact by collaborating on 15+ presales opportunities, ensuring compliance-ready technical documentation.

Enhanced visibility at industry events, building credibility that contributed to deal acceleration.
`
  }

  return templates[role as keyof typeof templates] || templates['Sales']
}