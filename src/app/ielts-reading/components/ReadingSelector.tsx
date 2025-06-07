'use client'

interface Props {
  selectedBook: string
  setSelectedBook: (v: string) => void
  selectedPassage: string
  setSelectedPassage: (v: string) => void
  selectedQuestionType: string
  setSelectedQuestionType: (v: string) => void
  questionData: any[]
}

export default function ReadingSelector({
  selectedBook,
  setSelectedBook,
  selectedPassage,
  setSelectedPassage,
  selectedQuestionType,
  setSelectedQuestionType,
  questionData,
}: Props) {
  // 从数据中提取 passage 和题型
  const passageOptions = Array.from(new Set(
    questionData.map((q) => q.Passage)
  ))
  const typeOptions = Array.from(new Set(
    questionData
      .filter((q) => !selectedPassage || q.Passage === selectedPassage)
      .map((q) => q.题型)
  ))

  return (
    <div className="w-full flex flex-col md:flex-row items-center justify-start md:justify-between gap-4 mt-6">
      {/* 剑雅编号 */}
      <select
        value={selectedBook}
        onChange={(e) => setSelectedBook(e.target.value)}
        className="w-full md:w-1/3 p-2 rounded-xl border border-purple-500 shadow focus:ring-2 focus:ring-purple-500 focus:outline-none cursor-pointer bg-white text-gray-800 hover:shadow-lg transition"
      >
        <option value="剑雅17">剑雅17</option>
      </select>

      {/* Passage */}
      <select
        value={selectedPassage}
        onChange={(e) => setSelectedPassage(e.target.value)}
        className="w-full md:w-1/3 p-2 rounded-xl border border-purple-500 shadow focus:ring-2 focus:ring-purple-500 focus:outline-none cursor-pointer bg-white text-gray-800 hover:shadow-lg transition"
      >
        <option value="">请选择 Passage</option>
        {passageOptions.map((p) => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>

      {/* 题型 */}
      <select
        value={selectedQuestionType}
        onChange={(e) => setSelectedQuestionType(e.target.value)}
        className="w-full md:w-1/3 p-2 rounded-xl border border-purple-500 shadow focus:ring-2 focus:ring-purple-500 focus:outline-none cursor-pointer bg-white text-gray-800 hover:shadow-lg transition"
      >
        <option value="">请选择题型</option>
        {typeOptions.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>
    </div>
  )
}
