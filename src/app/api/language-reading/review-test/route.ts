import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const articleId = searchParams.get('articleId')
    const language = searchParams.get('language')
    
    if (!articleId || !language) {
      return NextResponse.json({ error: 'Missing articleId or language' }, { status: 400 })
    }

    // 获取用户在该文章中查询过的单词
    const { data: wordQueries, error: wordError } = await supabase
      .from('english_reading_word_queries')
      .select('*')
      .eq('article_id', parseInt(articleId))
      .eq('language', language)
      .not('examples', 'is', null)
      .not('example_translation', 'is', null)

    if (wordError) {
      console.error('Database error:', wordError)
      return NextResponse.json({ error: 'Failed to fetch word queries' }, { status: 500 })
    }

    if (!wordQueries || wordQueries.length === 0) {
      return NextResponse.json({ error: 'No words found for review' }, { status: 404 })
    }

    // 处理测试题目
    const testQuestions = wordQueries.map(query => {
      return {
        id: query.id,
        type: 'word_fill',
        question: query.definition, // 中文释义
        answer: query.word_text, // 正确答案
        questionType: 'word'
      }
    })

    // 如果还有句子查询，也可以添加句子填空题
    const { data: sentenceQueries, error: sentenceError } = await supabase
      .from('english_reading_sentence_queries')
      .select('*')
      .eq('article_id', parseInt(articleId))
      .eq('language', language)
      .not('translation', 'is', null)

    const sentenceTestQuestions = wordQueries
      .filter(query => {
        const examples = Array.isArray(query.examples) ? query.examples : [query.examples]
        return examples[0] && query.example_translation
      })
      .map(query => {
        const examples = Array.isArray(query.examples) ? query.examples : [query.examples]
        const example = examples[0]

        // 创建挖空的句子
        const wordToReplace = query.word_text
        const blankSentence = example.replace(
          new RegExp(`\\b${wordToReplace}\\b`, 'gi'), 
          '_______'
        )

        return {
          id: `sent_${query.id}`,
          type: 'sentence_fill',
          chineseTranslation: query.example_translation, // 中文翻译
          englishSentence: blankSentence, // 挖空的英文句子
          answer: wordToReplace, // 正确答案
          questionType: 'sentence'
        }
      })

    // 合并单词题和句子题，随机排序
    const allQuestions = [...testQuestions, ...sentenceTestQuestions]
      .sort(() => Math.random() - 0.5)
      .slice(0, 10) // 最多10道题

    return NextResponse.json({
      questions: allQuestions,
      total: allQuestions.length
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}