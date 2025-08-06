import { NextResponse } from 'next/server'

// Prompt 模板配置
const PROMPT_TEMPLATES = {
  part1: {
    1: `Generate a natural IELTS Speaking Part 1 question about personal life, hobbies, daily activities, or familiar topics. 

Requirements:
- Use simple, conversational language
- Make it personal and relatable
- Focus on present situations or past experiences
- Avoid complex abstract concepts
- Length: 1-2 sentences maximum

Examples of good Part 1 questions:
- "What's your favorite way to relax after work?"
- "Do you prefer to shop online or in physical stores? Why?"
- "Tell me about a hobby you've had for a long time."

Generate ONE question only.`,

    2: `Analyze this IELTS Speaking Part 1 question for a student preparing for the test.

Question: {previousContent}

Please provide:
1. **Question Focus**: What the examiner wants to assess
2. **Key Language Skills**: Grammar tenses, vocabulary areas, and functions needed
3. **Answer Strategy**: How to structure a good 1-2 minute response
4. **Common Mistakes**: What students typically do wrong
5. **Assessment Criteria**: What examiners look for in Band 6+ answers

Keep the analysis practical and student-friendly.`,

    3: `Help a student brainstorm ideas for this IELTS Part 1 question:

Question: {previousContent}

Provide 4-5 guiding questions to help them think of content:
- Personal experience questions
- Opinion/preference questions  
- Example/detail questions
- Comparison questions

Format as bullet points. Make questions specific and thought-provoking to generate rich, personal responses.`,

    4: `Based on this question and brainstorming, provide specific speaking advice:

Question: {questionContent}
Student's Ideas: {guidanceContent}

Provide:
1. **Answer Framework**: Step-by-step structure template
2. **Useful Phrases**: 5-6 natural expressions for this topic
3. **Vocabulary Tips**: Topic-specific words to use
4. **Timing Advice**: How to pace the 1-2 minute response
5. **Example Opening**: Write a sample first sentence

Make advice actionable and specific to this question.`
  },

  part2: {
    1: `Generate an IELTS Speaking Part 2 cue card (topic card) following the standard format.

Create a topic about describing a person, place, object, experience, or abstract concept.

Format:
**Describe [main topic]**

You should say:
• [bullet point 1]
• [bullet point 2] 
• [bullet point 3]
• [bullet point 4]

And explain [why/how/what makes it special/important/memorable]

Requirements:
- Topic should be accessible to most candidates
- Bullet points should guide different aspects
- "Explain" part should require personal reflection
- Follow authentic IELTS format exactly`,

    2: `Analyze this IELTS Speaking Part 2 topic card for effective preparation:

{previousContent}

Provide detailed analysis:
1. **Topic Breakdown**: Explain each bullet point requirement
2. **Time Management**: How to allocate the 2-minute speaking time
3. **Language Focus**: Key grammar structures and vocabulary themes
4. **Development Strategy**: How to extend ideas naturally
5. **Assessment Criteria**: What Band 7+ responses demonstrate
6. **Common Challenges**: Typical difficulties with this topic type

Make analysis comprehensive but clear for student understanding.`,

    3: `Help brainstorm content for this IELTS Part 2 topic:

{previousContent}

For each bullet point, provide specific thinking prompts:
• **Bullet 1**: [3-4 guiding questions]
• **Bullet 2**: [3-4 guiding questions]  
• **Bullet 3**: [3-4 guiding questions]
• **Explain part**: [3-4 reflection questions]

Include prompts for:
- Specific details and examples
- Personal connections and emotions
- Descriptive language opportunities
- Story development ideas

Help the student generate rich, specific content.`,

    4: `Provide comprehensive speaking strategy for this Part 2 topic:

Topic: {questionContent}
Brainstormed Ideas: {guidanceContent}

Deliver:
1. **Structure Template**: Detailed 2-minute organization plan
2. **Opening Strategy**: How to begin confidently
3. **Development Techniques**: Ways to extend and elaborate ideas  
4. **Advanced Vocabulary**: 8-10 topic-specific sophisticated words
5. **Linking Language**: Transition phrases for smooth flow
6. **Conclusion Tips**: How to end strongly
7. **Sample Outline**: Brief example structure using their ideas

Focus on achieving Band 7+ performance.`
  },

  part3: {
    1: `Generate an IELTS Speaking Part 3 question that requires analytical and abstract thinking.

The question should:
- Connect to broader social, cultural, or global themes
- Require opinion, analysis, or speculation
- Allow for different viewpoints and deeper discussion
- Use more complex language than Parts 1-2
- Encourage critical thinking about society, trends, or human behavior

Question types to consider:
- Comparing past/present/future
- Discussing advantages/disadvantages  
- Analyzing social trends or changes
- Exploring cultural differences
- Speculating about future developments
- Examining causes and effects

Generate ONE thoughtful question that would challenge candidates to think deeply.`,

    2: `Analyze this IELTS Speaking Part 3 question for advanced preparation:

Question: {previousContent}

Provide expert analysis:
1. **Question Type**: Category and thinking skills required
2. **Answer Approach**: How to tackle this question strategically  
3. **Language Level**: Grammar structures and vocabulary needed for Band 7+
4. **Content Development**: How to build complex, nuanced arguments
5. **Critical Thinking**: What analytical skills to demonstrate
6. **Common Pitfalls**: Mistakes that limit scores
7. **Assessment Focus**: What examiners evaluate in Part 3

Prepare students for sophisticated academic-level discussion.`,

    3: `Guide deep thinking for this complex IELTS Part 3 question:

Question: {previousContent}

Help explore multiple angles:
1. **Different Perspectives**: What various viewpoints exist?
2. **Supporting Arguments**: What evidence or examples support each view?
3. **Cultural Context**: How might this vary across cultures/countries?
4. **Cause and Effect**: What factors influence this issue?
5. **Future Implications**: How might this develop over time?
6. **Personal vs. Societal**: Individual vs. collective impacts?

Encourage sophisticated, multi-dimensional thinking for Band 7+ responses.`,

    4: `Provide advanced speaking strategies for this Part 3 question:

Question: {questionContent}  
Analysis & Ideas: {guidanceContent}

Deliver sophisticated guidance:
1. **Response Structure**: How to organize complex arguments
2. **Academic Language**: Formal expressions and hedging language
3. **Argument Development**: Techniques for building persuasive points
4. **Examples & Evidence**: How to support claims effectively
5. **Balanced Discussion**: Presenting multiple sides professionally
6. **Advanced Vocabulary**: Subject-specific sophisticated terms
7. **Fluency Techniques**: Maintaining flow in complex discussions
8. **Sample Framework**: Example response structure

Target Band 8+ performance with academic-level discourse skills.`
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { part, step, previousSteps, userInput, aiModel } = body

    if (!part || !step) {
      return NextResponse.json(
        { error: 'Missing required fields: part, step' },
        { status: 400 }
      )
    }

    // 获取基础 prompt 模板
    const basePrompt = PROMPT_TEMPLATES[part as keyof typeof PROMPT_TEMPLATES]?.[step as keyof typeof PROMPT_TEMPLATES.part1]

    if (!basePrompt) {
      return NextResponse.json(
        { error: 'Invalid part or step' },
        { status: 400 }
      )
    }

    // 构建完整 prompt
    let fullPrompt = basePrompt

    // 替换前置内容占位符
    if (previousSteps && previousSteps.length > 0) {
      const previousContent = previousSteps[0]?.content || ''
      fullPrompt = fullPrompt.replace('{previousContent}', previousContent)
      
      // 特殊处理 step 4，需要问题和引导内容
      if (step === 4 && previousSteps.length >= 2) {
        fullPrompt = fullPrompt.replace('{questionContent}', previousSteps[0]?.content || '')
        fullPrompt = fullPrompt.replace('{guidanceContent}', previousSteps[2]?.content || '')
      }
    }

    // 添加用户输入
    if (userInput && userInput.trim()) {
      fullPrompt += `\n\nAdditional context from student: ${userInput}`
    }

    // 暂时返回 prompt 本身作为 mock 响应
    // TODO: 集成真实 AI API (OpenAI/DeepSeek)
    const mockResponse = await generateMockResponse(fullPrompt, part, step, aiModel || 'deepseek')

    return NextResponse.json({
      content: mockResponse,
      timestamp: new Date().toISOString(),
      prompt: fullPrompt,
      aiModel: aiModel || 'deepseek'
    })

  } catch (error) {
    console.error('AI generate error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// 临时 mock 响应函数，后续替换为真实 AI API
async function generateMockResponse(prompt: string, part: string, step: number, aiModel: string): Promise<string> {
  // 模拟 API 延迟
  await new Promise(resolve => setTimeout(resolve, 1000))

  const mockResponses = {
    part1: {
      1: "What do you usually do in your free time? Do you prefer indoor or outdoor activities?",
      2: "This question tests your ability to discuss personal preferences and habits. Key points: use present tense for habits, provide specific examples, speak for 1-2 minutes naturally.",
      3: "Think about: What activities do you actually do? When do you have free time? Why do you prefer certain activities? What equipment or preparation do you need? How do these activities make you feel?",
      4: "Framework: 'In my free time, I usually...' → 'I prefer [indoor/outdoor] because...' → 'For example, last weekend I...' → 'This makes me feel...' Use phrases like 'It depends on...', 'Generally speaking...', 'What I really enjoy is...'"
    },
    part2: {
      1: "Describe a book that you enjoyed reading.\n\nYou should say:\n• what book it was\n• when and where you read it\n• why you chose to read it\n• and explain why you enjoyed reading it",
      2: "This topic requires you to describe a specific book experience. Time allocation: 30s introduction, 1min covering bullet points, 30s explanation. Focus on storytelling, use past tenses, include sensory details and personal reflection.",
      3: "Consider: What genre was it? Fiction or non-fiction? Where did you discover it? What drew you to pick it up? What was the reading experience like? How did it affect your thoughts or emotions? What made it memorable?",
      4: "Structure: 'I'd like to talk about [book title]...' → Cover each bullet point with 2-3 sentences → Use descriptive language and personal anecdotes → End with reflection on impact. Advanced vocabulary: 'compelling', 'thought-provoking', 'captivating', 'insightful'."
    },
    part3: {
      1: "How do you think reading habits have changed over the past decade?",
      2: "This question requires analysis of social trends and changes over time. You need to compare past and present, discuss causes of change, and potentially speculate about future developments. Use formal academic language and complex sentence structures.",
      3: "Consider different angles: Digital vs. physical books, attention spans, accessibility, social media influence, educational changes, generational differences, economic factors, global pandemic effects, technology advancement.",
      4: "Structure: Present thesis → Compare past/present → Analyze causes → Consider implications → Conclude. Use academic language: 'It's evident that...', 'One significant factor is...', 'This trend can be attributed to...', 'The implications are far-reaching...'"
    }
  }

  return mockResponses[part as keyof typeof mockResponses]?.[step as keyof typeof mockResponses.part1] || 
         "Mock response not available for this configuration."
}