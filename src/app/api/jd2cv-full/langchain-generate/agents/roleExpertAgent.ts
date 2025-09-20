import { invokeDeepSeek } from '../utils/deepseekLLM'

// Helper function to fetch prompt from Notion
async function fetchPromptFromNotion(project: string, agent: string): Promise<string> {
  console.log(`[RoleExpertAgent] 🔄 Fetching prompt from Notion: ${project}:${agent}`)

  const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/prompt-manager-notion?project=${project}&agent=${agent}`)

  if (!response.ok) {
    console.error(`[RoleExpertAgent] ❌ Failed to fetch prompt: ${response.status}`)
    throw new Error(`Failed to fetch prompt for ${project}:${agent} - ${response.status}`)
  }

  const data = await response.json()
  console.log(`[RoleExpertAgent] ✅ Successfully fetched prompt (version: ${data.version})`)
  return data.promptContent
}

export interface ParentInsights {
  classification: string
  focusPoints: string[]
  keywords: string[]
  keySentences: string[]
}

// Role Expert Agent - Work Experience Customization
export async function roleExpertAgent(
  jdTitle: string,
  parentInsights: ParentInsights
): Promise<{ content: string; tokens: { prompt: number; completion: number; total: number } }> {

  console.log(`[RoleExpertAgent] 🎯 Starting Role Expert Agent for: ${jdTitle}`)
  console.log(`[RoleExpertAgent] 📋 Classification: ${parentInsights.classification}`)

  const { classification, focusPoints, keywords, keySentences } = parentInsights

  // Get the work experience template based on role classification
  const workExperienceTemplate = getWorkExperienceByRole(classification)
  console.log(`[RoleExpertAgent] 📄 Work experience template loaded (${classification}), length: ${workExperienceTemplate.length}`)

  const focusSection = focusPoints.length
    ? focusPoints.map(point => `- ${point}`).join('\n')
    : '- align experience with the responsibilities implied by the role'

  const keywordSection = keywords.length
    ? keywords.map(k => `- ${k}`).join('\n')
    : '- emphasise the most relevant skills naturally'

  const sentenceSection = keySentences.length
    ? keySentences.map(s => `- "${s}"`).join('\n')
    : '- Use professional judgement to highlight accomplishments that match the role.'

  console.log(`[RoleExpertAgent] 🔢 Variables prepared: ${focusPoints.length} focus points, ${keywords.length} keywords, ${keySentences.length} key sentences`)

  try {
    // Fetch prompt template from Notion
    const promptTemplate = await fetchPromptFromNotion('JD2CV_Full', 'RoleExpert')

    // Replace variables in the prompt template
    console.log(`[RoleExpertAgent] 🔄 Replacing variables in prompt template`)
    const customizationPrompt = promptTemplate
      .replace(/\$\{classification\}/g, classification)
      .replace(/\$\{jdTitle\}/g, jdTitle)
      .replace(/\$\{focusSection\}/g, focusSection)
      .replace(/\$\{keywordSection\}/g, keywordSection)
      .replace(/\$\{sentenceSection\}/g, sentenceSection)
      .replace(/\$\{workExperienceTemplate\}/g, workExperienceTemplate)

    console.log(`[RoleExpertAgent] 📤 Sending to DeepSeek, final prompt length: ${customizationPrompt.length}`)

    const result = await invokeDeepSeek(customizationPrompt, 0.25, 5000)
    console.log(`[RoleExpertAgent] 📥 DeepSeek response received, tokens: ${JSON.stringify(result.tokens)}`)
    console.log(`[RoleExpertAgent] ✅ Role Expert Agent completed successfully`)

    return { content: result.content.trim(), tokens: result.tokens }

  } catch (error) {
    console.error('[RoleExpertAgent] ❌ Role Expert Agent error:', error)
    // In test phase, throw error instead of fallback
    throw error
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
    'Solution - General': `
StanleyHi | Founder & Full-Stack Developer | 2024 – Present

Designed and delivered 4+ end-to-end solutions in AI, education, and productivity, applying full-stack expertise in Next.js, Tailwind CSS, Supabase, and Notion API.

Built JD2CV, an AI-powered resume generator integrating rule-based matching and LLMs; Readlingua, a multilingual learning platform with contextual grammar features; and IELTS Speaking Engine, providing automated scoring and feedback.

Integrated APIs from Gemini, DeepSeek, and Hugging Face to design scalable solution architectures for LLM-based applications.

Demonstrated strong solutioning mindset: translating complex requirements into working products, aligning technology with real-world use cases.

Savvy Pro | Academic Tutor – STEM | 2023 – 2025

Translated technical concepts in Big Data, ML, and Python into tailored solutions for international students, resulting in 100% pass rate and measurable score improvements.

Designed 30+ customized "learning-as-a-service" modules, demonstrating ability to build structured, client-facing solutions under diverse requirements.

Showcased solution delivery skills through adapting technical complexity into accessible frameworks, improving client (student) engagement and adoption.

NCS | Financial Services Industry Lead | 2021 – 2022

Designed and launched 3 localized fintech solutions (WeChat-based onboarding, real-time filtering, digital compliance tools), accelerating deployments by 25% and increasing retention.

Led GTM solution strategy for FS vertical in China and Singapore, generating $5M+ pipeline and closing $2M+ contracts.

Coordinated 6 cross-functional teams (product, delivery, ecosystem) to align solution packaging with regulatory and integration requirements.

Presented sector strategy and solution roadmaps to C-level clients, influencing roadmap investment and securing executive sponsorship.

IceKredit | General Manager – Financial Services Industry | 2017 – 2020

Closed 20+ enterprise solution deals with top-tier banks, including $1M+ AI-powered credit scoring deployments.

Standardized 5 reusable solution products from client-specific implementations, improving delivery efficiency by 35% and enabling SaaS-style scaling.

Managed 10+ cross-functional teams to deliver 12 credit models into production, strengthening industry trust and adoption.

Built partnerships with regulatory and data providers to enhance solution competitiveness and compliance alignment.

Huawei | Technical Key Account Manager | 2016 – 2017

Owned technical solution delivery for 2 key global accounts (Ping An Bank, CMB) with $10M+ deal value.

Designed 10+ enterprise-grade solution proposals addressing integration, security, and compliance for core banking modernization.

Aligned 4 internal teams (product, R&D, delivery, compliance) to accelerate project approvals by 30%.

Presented solution roadmaps and architecture blueprints to C-level stakeholders, influencing multi-million-dollar procurement.

Diebold Nixdorf | Solution Architect | 2011 – 2016

Designed and delivered 35+ self-service banking solutions integrating hardware, software, and workforce, enhancing device uptime and security.

Reduced downtime by 18% across 1,200+ ATMs through predictive cash management and monitoring solutions.

Re-architected operations outsourcing models for 15+ enterprise clients, improving efficiency by 25% with SLA-driven workflows.

Led 3 regional delivery projects (China & SEA), bridging product and client requirements into tailored solutions.

Fuji Xerox | Solution Engineer – Banking | 2009 – 2011

Supported delivery of tailored banking solutions to 12+ enterprise clients, contributing to 110%+ YoY sales achievement.

Conducted 50+ training sessions to scale solution delivery across 3 regional offices.

Participated in 10+ industry demos, reducing sales cycle by ~20% through technical solution engagement.

Collaborated on 15+ presales opportunities, providing technical documentation and customization to meet compliance and integration needs.
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
`,
    'Technical Account Manager': `
StanleyHi | Founder & Full-Stack Developer | 2024 – Present

Acted as technical owner for 4 AI-driven platforms (IELTS Engine, JD2CV, Readlingua, Strategy–Plan–Task), guiding adoption and addressing user-reported issues with quick turnaround.

Designed full-stack architectures (Next.js, Supabase, Notion API, Vercel) and provided continuous technical support to ensure reliability and positive user experience.

Integrated APIs from Gemini, DeepSeek, and Hugging Face, demonstrating ability to support clients leveraging cutting-edge AI in production environments.

Functioned as a TAM-style liaison by gathering feedback, troubleshooting issues, and translating business requirements into technical improvements.

Savvy Pro | Academic Tutor – STEM | 2023 – 2025

Served as technical mentor and account manager for 10+ international students, tailoring computing lessons to individual requirements and providing hands-on support.

Achieved measurable adoption success: 100% pass rates and 25%+ score improvements, aligning with client goals.

Handled escalations by simplifying advanced data/ML concepts into actionable guidance, improving overall satisfaction and trust.

NCS | Financial Services Industry Lead | 2021 – 2022

Acted as primary technical liaison for C-level clients in China & Singapore, aligning solution deployment with regulatory requirements and client environments.

Oversaw onboarding of 3 fintech solutions, reducing time-to-value by 25% and ensuring smooth integration.

Managed executive escalations by coordinating 6 cross-functional teams to resolve integration and compliance challenges.

Built trusted relationships with enterprise stakeholders, influencing roadmap priorities and driving renewals.

IceKredit | General Manager – Financial Services Industry | 2017 – 2020

Owned technical account relationships with 20+ enterprise clients, ensuring deployment of AI-based credit systems met adoption and compliance goals.

Standardized client solutions into 5 reusable products, providing predictable onboarding experiences and faster time-to-value.

Handled escalations by coordinating data science and engineering teams, reducing deployment risks for Tier-1 banks.

Maintained renewal success (>90%) by proactively addressing technical and regulatory concerns.

Huawei | Technical Key Account Manager | 2016 – 2017

Served as TAM for Ping An Bank and China Merchants Bank, supporting $10M+ in total project value.

Designed 10+ enterprise-grade solution proposals addressing integration, security, and compliance requirements.

Managed technical escalations by aligning 4 internal teams to resolve issues, accelerating project approvals by 30%.

Acted as trusted advisor to C-level stakeholders, presenting roadmaps that influenced procurement decisions.

Diebold Nixdorf | Solution Architect | 2011 – 2016

Functioned as technical account partner for 15+ banks, ensuring 35+ solution deployments achieved SLA targets.

Reduced escalations and downtime by 18% through proactive monitoring and predictive cash management systems.

Supported adoption of new outsourcing models, providing hands-on guidance to field teams and executives.

Partnered with regional clients in China & SEA to ensure localized deployments met technical and regulatory standards.

Fuji Xerox | Solution Engineer – Banking | 2009 – 2011

Supported 12+ enterprise accounts as technical liaison, ensuring smooth adoption of Fuji Xerox banking solutions.

Conducted 50+ technical training sessions to equip consultants with customer-facing support skills.

Addressed presales escalations by providing customized technical documentation, reducing deal closure cycles by ~20%.

Partnered with account managers to deliver consistent technical success across multiple Tier-1 banking clients.
`,
    'AI Solution': `
StanleyHi | Founder & Full-Stack Developer | 2024 – Present

Designed and deployed 4 AI-driven platforms—including IELTS Speaking Engine, JD2CV (resume generator), Readlingua (multilingual EdTech), and Strategy–Plan–Task—showcasing ability to translate business needs into AI-powered solutions.

Integrated LLM APIs (Gemini, DeepSeek, Hugging Face) into production systems, enabling content generation, NLP pipelines, and interactive learning features.

Built scalable full-stack architectures (Next.js, Supabase, Vercel) to support AI workloads and ensure reliable client-facing deployments.

Delivered POC-to-production execution independently, demonstrating ability to design, prototype, and operationalize AI use cases.

Savvy Pro | Academic Tutor – STEM | 2023 – 2025

Applied AI-enhanced teaching tools to improve student outcomes, achieving 100% pass rates and 25%+ score improvements.

Translated technical concepts in ML, Python, and Big Data into accessible frameworks, showcasing ability to bridge AI technology with practical adoption.

Designed project-style lesson modules, mimicking real-world solution delivery in analytics and computing.

NCS | Financial Services Industry Lead | 2021 – 2022

Designed 3 fintech AI solutions (real-time filtering, onboarding automation, compliance checks) that accelerated deployment by 25% and improved client retention.

Presented AI solution roadmaps to C-level executives, securing $2M+ in contracts and building trust as a technical advisor.

Coordinated cross-functional teams to align AI-enabled products with regulatory requirements in China and Singapore.

IceKredit | General Manager – Financial Services Industry | 2017 – 2020

Closed 20+ enterprise AI solution deals, including $1M+ contracts for machine learning–based credit scoring and decisioning platforms.

Led delivery of 12 customized ML models into production, collaborating with data scientists and engineers to ensure adoption and compliance.

Scaled client implementations into 5 standardized AI products, improving delivery efficiency by 35% and enabling SaaS-style replication.

Huawei | Technical Key Account Manager | 2016 – 2017

Designed 10+ AI-augmented solution proposals for Ping An Bank and CMB, addressing regulatory and security needs for banking modernization.

Served as trusted advisor for $10M+ in AI-related solution value, influencing executive decisions on adoption.

Coordinated R&D, product, and compliance teams to resolve technical blockers, accelerating approvals by 30%.

Diebold Nixdorf | Solution Architect | 2011 – 2016

Deployed predictive cash management and monitoring systems for 1,200+ terminals, introducing early AI/ML components to reduce downtime by 18%.

Delivered 35+ AI-enabled operational solutions combining software, hardware, and workforce optimization for enterprise banking clients.

Acted as technical bridge across China & SEA, supporting AI solution localization and adoption.

Fuji Xerox | Solution Engineer – Banking | 2009 – 2011

Supported presales of AI-related banking solutions in 12+ enterprise accounts, contributing to 110%+ YoY sales.

Delivered 50+ training sessions and 10+ demos to educate clients on AI-enabled features, improving adoption rates and sales cycles.

Partnered with account teams to customize AI-ready solutions, ensuring integration with compliance and digital transformation goals.
`,
    'Partnerships Alliance Manager': `
StanleyHi | Founder & Full-Stack Developer | 2024 – Present

Built partnerships with API vendors (Gemini, DeepSeek, Hugging Face) to strengthen AI platform capabilities and expand solution competitiveness.

Negotiated and integrated third-party technologies into 4 SaaS-style platforms (IELTS Engine, JD2CV, Readlingua, Strategy–Plan–Task), ensuring joint value creation.

Acted as both technical and business liaison, aligning partner roadmaps with product direction to improve adoption and market reach.

Demonstrated ability to identify, onboard, and maintain partnerships that directly enhanced user value and growth.

Savvy Pro | Academic Tutor – STEM | 2023 – 2025

Expanded client reach across Italy, UK, and Australia through referral partnerships, demonstrating capability to leverage networks for growth.

Co-created tailored learning modules with students and academic peers, aligning shared goals to strengthen outcomes.

Showcased ability to build trust-based partnerships by delivering measurable improvements (100% pass rates, 25%+ score increases).

NCS | Financial Services Industry Lead | 2021 – 2022

Forged partnerships with ecosystem vendors and compliance providers to strengthen financial services solution packaging.

Drove $5M+ pipeline and $2M+ closed deals by enabling co-selling opportunities across China and Singapore markets.

Aligned cross-partner GTM strategy with local regulations, improving adoption and retention by 25%.

Built trusted alliances with C-level executives, positioning NCS as a strategic partner in the FS ecosystem.

IceKredit | General Manager – Financial Services Industry | 2017 – 2020

Established 6+ partnerships with data vendors, regulatory compliance providers, and ecosystem players, broadening solution competitiveness.

Scaled 20+ client accounts by aligning partner capabilities with enterprise client needs, driving $1M+ deals.

Standardized co-sell solution packages, enabling repeatable delivery and stronger partner enablement.

Maintained long-term strategic alliances that supported multi-year client renewals and expansion.

Huawei | Technical Key Account Manager | 2016 – 2017

Acted as alliance manager for 2 top-tier banking clients, supporting $10M+ deal value through joint planning and co-execution.

Collaborated with internal and external partners to deliver 10+ proposals tailored to compliance and integration needs.

Secured executive sponsorship by presenting partnership-driven roadmaps to C-level stakeholders.

Strengthened Huawei's ecosystem presence within financial services vertical.

Diebold Nixdorf | Solution Architect | 2011 – 2016

Managed alliances with regional banking clients and technology partners, delivering 35+ joint solutions across China & SEA.

Enabled long-term partnerships through SLA-driven performance models, resulting in 25% efficiency gains.

Acted as ecosystem connector, integrating hardware, software, and field operations into unified client offerings.

Expanded partner collaboration opportunities by introducing predictive monitoring systems, reducing downtime by 18%.

Fuji Xerox | Solution Engineer – Banking | 2009 – 2011

Supported partnerships with 12+ enterprise banking clients, contributing to 110%+ YoY quota attainment.

Enabled partner sales teams through 50+ training sessions and 10+ demos, driving co-selling success.

Collaborated with account managers to create tailored solution packages that improved compliance and integration value.

Enhanced brand presence by representing Fuji Xerox at 10+ industry events, strengthening ecosystem visibility.
`,
    'Project Manager': `
StanleyHi | Founder & Full-Stack Developer | 2024 – Present

Managed end-to-end delivery of 4 AI-driven projects (IELTS Engine, JD2CV, Readlingua, Strategy–Plan–Task), from requirements gathering to deployment on Vercel.

Defined project scope, roadmap, and milestones while coordinating design, engineering, and external API providers (Gemini, DeepSeek, Hugging Face).

Applied Agile-style iterations by incorporating user feedback and prioritizing features, ensuring on-time delivery and adoption.

Oversaw project risks and dependencies, implementing rapid mitigation strategies to maintain delivery quality.

Savvy Pro | Academic Tutor – STEM | 2023 – 2025

Designed and delivered 30+ structured lesson plans (mini-projects) for 10+ students, ensuring alignment with academic objectives and deadlines.

Managed project-like tutoring engagements, achieving 100% on-time completion and measurable results (25%+ score improvements).

Adapted scope and approach based on student needs, demonstrating flexible project execution across diverse requirements.

NCS | Financial Services Industry Lead | 2021 – 2022

Directed delivery of 3 fintech projects (onboarding platform, real-time content filtering, compliance system), reducing deployment cycles by 25%.

Coordinated 6 cross-functional teams (product, delivery, compliance, partners) to align on project milestones and requirements.

Maintained stakeholder visibility through regular executive updates, securing sponsorship and alignment with regulatory goals.

Managed $5M+ project pipeline, ensuring scope control and on-time completion that contributed to 30% YoY FS vertical growth.

IceKredit | General Manager – Financial Services Industry | 2017 – 2020

Oversaw project delivery of 12 AI-based credit scoring models for Tier-1 banks, ensuring successful deployment under strict compliance timelines.

Standardized client-specific projects into 5 reusable solution templates, reducing delivery risks and improving efficiency by 35%.

Led project teams of 10+ (data science, engineering, delivery), ensuring scope clarity and timeline adherence across multiple clients.

Reported progress and risks directly to executives, building trust and securing multi-year engagements.

Huawei | Technical Key Account Manager | 2016 – 2017

Managed multiple core banking modernization projects with Ping An Bank and CMB, covering $10M+ deal value.

Defined technical project milestones and coordinated 4 internal teams (R&D, product, delivery, compliance) to achieve 30% faster approvals.

Acted as project lead in C-level meetings, presenting roadmaps and status updates that influenced decision-making.

Ensured successful handover by monitoring risks and proactively resolving integration challenges.

Diebold Nixdorf | Solution Architect | 2011 – 2016

Delivered 35+ end-to-end banking infrastructure projects, managing timelines, scope, and client expectations across China and SEA.

Reduced downtime by 18% for 1,200+ ATMs through effective project planning and monitoring systems.

Oversaw outsourcing model transformation projects for 15+ clients, ensuring on-time delivery and 25% efficiency improvements.

Led cross-regional project teams, ensuring milestones were met while managing cultural and regulatory complexities.

Fuji Xerox | Solution Engineer – Banking | 2009 – 2011

Supported 12+ enterprise projects, contributing to 110%+ YoY sales through timely solution delivery.

Managed technical project documentation and customization, ensuring compliance and client approval within deadlines.

Conducted 50+ training sessions and 10+ demos, aligning presales project activities with client expectations.

Coordinated across account and presales teams to accelerate project timelines by ~20%.
`,
    'Key/Named Account Manager': `
StanleyHi | Founder & Full-Stack Developer | 2024 – Present

Acted as primary account manager for early adopters of 4 SaaS-style platforms (IELTS Engine, JD2CV, Readlingua, Strategy–Plan–Task), building trust and driving repeat engagement.

Gathered and translated customer feedback into feature updates, improving user retention and adoption across multiple geographies.

Established partnerships with API vendors (Gemini, DeepSeek, Hugging Face) to enhance platform value for end users.

Demonstrated account management mindset by aligning product roadmaps with client needs and ensuring measurable outcomes.

Savvy Pro | Academic Tutor – STEM | 2023 – 2025

Managed ongoing relationships with 10+ undergrad and postgrad clients, aligning customized lesson plans with long-term success goals.

Achieved >25% average score improvement and 100% pass rates, driving client satisfaction and repeat business.

Expanded key accounts through referrals and word-of-mouth across Italy, UK, and Australia.

NCS | Financial Services Industry Lead | 2021 – 2022

Owned executive relationships with Tier-1 financial clients, driving $5M+ pipeline and $2M+ contract closures.

Managed account onboarding and retention for 3 localized fintech solutions, contributing to 30% YoY vertical growth.

Acted as trusted advisor to C-level stakeholders, aligning solution packaging with regulatory requirements.

Strengthened long-term relationships through regular updates and demonstrated ROI.

IceKredit | General Manager – Financial Services Industry | 2017 – 2020

Managed 20+ strategic banking and finance accounts, ensuring successful deployment of AI-based credit scoring systems.

Drove >90% renewal rate and expanded accounts by upselling standardized solution packages.

Built partnerships with 6+ data and compliance vendors to enhance account value and strengthen long-term competitiveness.

Led multi-year engagements that delivered measurable ROI and repeat business from Tier-1 clients.

Huawei | Technical Key Account Manager | 2016 – 2017

Served as key account manager for Ping An Bank and CMB, overseeing $10M+ in projects and maintaining long-term trust.

Designed 10+ enterprise proposals aligned to client-specific requirements, supporting renewal and expansion opportunities.

Partnered with 4 internal teams to address escalations and accelerate project approvals by 30%.

Built strong C-level relationships, positioning Huawei as a strategic partner in digital banking modernization.

Diebold Nixdorf | Solution Architect | 2011 – 2016

Managed 15+ enterprise banking accounts, ensuring SLA compliance and upsell opportunities through 35+ delivered solutions.

Improved client satisfaction by reducing downtime 18% across 1,200+ ATMs, driving renewals and expansion.

Strengthened regional account footprint by supporting outsourcing model transformations with measurable ROI.

Partnered with clients across China & SEA to ensure localized adoption and repeat success.

Fuji Xerox | Solution Engineer – Banking | 2009 – 2011

Supported 12+ enterprise banking accounts, contributing to consistent quota overachievement (110%+ YoY).

Strengthened account loyalty through 50+ training sessions and 10+ demos, improving client engagement.

Partnered with account managers on 15+ presales opportunities, tailoring solutions to compliance and integration needs.

Expanded account visibility via industry events, accelerating client trust and deal closure cycles.
`,
    'Customer/Client Success': `
StanleyHi | Founder & Full-Stack Developer | 2024 – Present

Engaged early adopters of 4 self-built platforms (IELTS Speaking Engine, JD2CV, Readlingua, Strategy-Plan-Task) and collected user feedback to improve adoption and usability.

Delivered consistent client-like outcomes by transforming complex AI/EdTech concepts into intuitive tools, resulting in >1,000 recurring sessions across multiple geographies.

Drove customer success by ensuring each platform delivered measurable value—improved test prep outcomes, streamlined job applications, and enhanced language learning.

Built long-term trust by rapidly iterating features based on user feedback and demonstrating commitment to customer outcomes.

Savvy Pro | Academic Tutor – STEM | 2023 – 2025

Achieved 100% pass rate and 25%+ score improvements by tailoring lessons to each student's needs, demonstrating strong customer success and satisfaction outcomes.

Managed relationships with 10+ undergrad and postgrad students, aligning tutoring strategy to their long-term academic and career goals.

Translated complex computing concepts into accessible, engaging content, increasing adoption and learner confidence across global student base.

NCS | Financial Services Industry Lead | 2021 – 2022

Partnered with C-level clients to ensure fintech deployments met adoption and retention goals, contributing to $2M+ in contracts.

Oversaw customer onboarding for 3 localized solutions, reducing deployment friction and increasing retention by 25%.

Acted as the voice of the customer, aligning solution packaging with local compliance needs and driving satisfaction in high-stakes accounts.

Strengthened executive relationships by presenting progress updates and demonstrating ROI, securing ongoing investment.

IceKredit | General Manager – Financial Services Industry | 2017 – 2020

Built long-term relationships with 20+ enterprise clients, ensuring successful deployment of AI credit systems and driving >90% renewal rates.

Scaled customer success by standardizing client implementations into 5 reusable products, improving consistency and adoption.

Served as trusted advisor for top banks, aligning delivery with regulatory requirements and ensuring client confidence.

Maintained continuous client engagement, resulting in multi-year contracts and expansion opportunities.

Huawei | Technical Key Account Manager | 2016 – 2017

Served as primary customer success owner for two Tier-1 banking clients, supporting $10M+ in deal value and ensuring successful project rollout.

Built trust with C-level stakeholders by presenting technical roadmaps in business value terms, leading to faster approvals and expanded scope.

Partnered with internal teams to proactively address integration and compliance issues, improving client satisfaction and reducing escalations.

Maintained strong post-deployment relationships, securing repeat business and ongoing trust.

Diebold Nixdorf | Solution Architect | 2011 – 2016

Supported 15+ enterprise clients in rethinking operations outsourcing models, ensuring adoption and measurable ROI with SLA-driven performance.

Increased customer satisfaction by reducing ATM downtime by 18% across 1,200+ terminals.

Delivered 35+ customized solutions with a strong focus on user training, field support, and adoption metrics.

Acted as long-term partner to banking clients, ensuring projects achieved intended outcomes and repeat success.

Fuji Xerox | Solution Engineer – Banking | 2009 – 2011

Supported 12+ enterprise banking clients, ensuring successful customization and adoption of Fuji Xerox solutions.

Conducted 50+ training sessions for consultants and presales teams to improve client experience and standardize delivery.

Engaged clients at industry events and demos, showcasing value and accelerating adoption cycles.

Contributed to 110%+ YoY sales by strengthening client trust and long-term satisfaction.
`
  }

  return templates[role as keyof typeof templates] || templates['Solution - General']
}
