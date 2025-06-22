import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const questionId = searchParams.get('questionId')

  if (!questionId) {
    return NextResponse.json({ error: 'Missing questionId' }, { status: 400 })
  }

  console.log('🧪 questionId (uuid):', questionId)

  const { data, error } = await supabase
    .from('ielts_speaking_data')
    .select('*')
    .eq('id', questionId)
    .single()

  if (error || !data) {
    // 更好的错误处理，可以区分是未找到还是其他数据库错误
    console.error('❌ Supabase query failed:', error?.message || 'Data not found');
    return NextResponse.json({ error: error?.message || 'Question not found' }, { status: 404 })
  }

  // ✅ 格式转换，适配前端
  const answers = [6, 7, 8].map((band) => {
    const bandKey = `band${band}`

    // 🏆 健壮性改进点 1：安全地从 data 对象中获取原始字符串，确保即使字段为 null 也至少是空字符串
    const rawHighlightWords = (data[`${bandKey}_highlight_words`] || '') as string;
    const rawHighlightNotes = (data[`${bandKey}_highlight_notes`] || '') as string;

    return {
      level: `Band ${band}`,
      text: data[`${bandKey}_text`], // 假设 text 字段总是存在的
      // 🏆 健壮性改进点 2：parseExplanation 函数内部处理多行和子内容的逻辑
      bandHighlightWords: safeSplit(rawHighlightWords),
      bandHighlightNotes: Object.entries(
        parseExplanation(rawHighlightNotes) // parseExplanation 现在返回的是 Record<string, string>
      ).map(([word, note]) => ({ word, note })),
    }
  })

  return NextResponse.json({ answers })
}

// ✅ 安全拆关键词
function safeSplit(input: string | null): string[] {
  // 🏆 健壮性改进点 3：确保 input 总是字符串。因为上面已经用 || '' 处理，这里可以更自信
  // 保持兼容中英文逗号
  return (input || '') // 即使外面处理过，这里再加一层防御也无妨
    .split(/[，,]/)
    .map((w) => w.trim())
    .filter(Boolean);
}

// ✅ 拆解释内容为 {关键词: 解释}
// 此函数现在必须能够处理 "关键词:中文解释\n用法\n例句" 这种格式
// 并将整个 "中文解释\n用法\n例句" 作为 value 返回
function parseExplanation(noteText: string | null): Record<string, string> {
  if (typeof noteText !== 'string' || !noteText) { // 🏆 健壮性改进点 4：更严格的类型和空值检查
    return {};
  }

  // 假设 noteText 是多行字符串，每行一个 key:value 对
  const lines = noteText.split('\n'); // 匹配人工录入的换行
  const explanations: Record<string, string> = {};

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue; // 跳过空行

    // 使用第一个冒号进行分割，保留冒号后面的所有内容作为 value
    const firstColonIndex = trimmedLine.indexOf(':');
    if (firstColonIndex === -1) {
      // 🏆 健壮性改进点 5：处理没有冒号的行，可以忽略或记录错误
      console.warn(`⚠️ Invalid note line format (no colon found): "${trimmedLine}"`);
      continue;
    }

    const key = trimmedLine.substring(0, firstColonIndex).trim();
    // value 现在将是 "中文解释\n用法\n例句" 这种带换行的字符串
    const value = trimmedLine.substring(firstColonIndex + 1).trim();

    if (key && value) {
      explanations[key] = value;
    } else {
      // 🏆 健壮性改进点 6：处理键或值为空的情况
      console.warn(`⚠️ Invalid note line (empty key or value): "${trimmedLine}"`);
    }
  }

  return explanations;
}