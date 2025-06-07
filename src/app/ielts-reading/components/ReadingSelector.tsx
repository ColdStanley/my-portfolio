'use client'

interface Props {
  selectedBook: string
  setSelectedBook: (v: string) => void
  selectedTest: string
  setSelectedTest: (v: string) => void
  selectedPassage: string
  setSelectedPassage: (v: string) => void
  selectedQuestionType: string
  setSelectedQuestionType: (v: string) => void
  questionData: any[]
  onFilterChange?: () => void  // ✅ 新增：筛选项变化时触发
}

export default function ReadingSelector({
  selectedBook,
  setSelectedBook,
  selectedTest,
  setSelectedTest,
  selectedPassage,
  setSelectedPassage,
  selectedQuestionType,
  setSelectedQuestionType,
  questionData,
  onFilterChange,
}: Props) {
  const baseClass =
    "transition-all duration-200 ease-in-out text-sm tracking-wide rounded-2xl border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white text-gray-700 hover:shadow-md px-4 py-2 w-full md:w-[22%] cursor-pointer"

  const bookOptions = Array.from(new Set(questionData.map((q) => q.Book).filter(Boolean)))

  const testOptions = Array.from(new Set(
    questionData
      .filter((q) => !selectedBook || q.Book === selectedBook)
      .map((q) => q.Test)
      .filter(Boolean)
  ))

  const passageOptions = Array.from(new Set(
    questionData
      .filter((q) => (!selectedBook || q.Book === selectedBook) && (!selectedTest || q.Test === selectedTest))
      .map((q) => q.Passage)
      .filter(Boolean)
  )).sort((a, b) => {
    const numA = parseInt(a.replace(/\D/g, '')) || 0
    const numB = parseInt(b.replace(/\D/g, '')) || 0
    return numA - numB
  })

  const typeOptions = Array.from(new Set(
    questionData
      .filter(
        (q) =>
          (!selectedBook || q.Book === selectedBook) &&
          (!selectedTest || q.Test === selectedTest) &&
          (!selectedPassage || q.Passage === selectedPassage)
      )
      .map((q) => q.QuestionType)
      .filter(Boolean)
  ))

  const handleChange = (setter: (v: string) => void) => (e: React.ChangeEvent<HTMLSelectElement>) => {
    setter(e.target.value)
    onFilterChange?.() // ✅ 调用父组件传入的回调
  }

  return (
    <div className="w-full flex flex-col md:flex-row items-center justify-start md:justify-between gap-4 mt-6 flex-wrap">
      <select
        value={selectedBook}
        onChange={handleChange(setSelectedBook)}
        className={baseClass}
      >
        <option value="">请选择剑雅编号</option>
        {bookOptions.map((book) => (
          <option key={book} value={book}>{book}</option>
        ))}
      </select>

      <select
        value={selectedTest}
        onChange={handleChange(setSelectedTest)}
        className={baseClass}
      >
        <option value="">请选择 Test</option>
        {testOptions.map((test) => (
          <option key={test} value={test}>{test}</option>
        ))}
      </select>

      <select
        value={selectedPassage}
        onChange={handleChange(setSelectedPassage)}
        className={baseClass}
      >
        <option value="">请选择 Passage</option>
        {passageOptions.map((p) => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>

      <select
        value={selectedQuestionType}
        onChange={handleChange(setSelectedQuestionType)}
        className={baseClass}
      >
        <option value="">请选择题型</option>
        {typeOptions.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>
    </div>
  )
}
