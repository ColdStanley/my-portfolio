'use client'

interface Props {
  love: string[]
  apology: string[]
  blessing: string[]
  thanks: string[]
  onClickItem: (text: string) => void
}

export default function QuoteSuggestionPanel({
  love,
  apology,
  blessing,
  thanks,
  onClickItem,
}: Props) {
  const renderScrollingList = (list: string[], prefix: string) => {
    const doubledList = [...list, ...list] // 实现滚动效果

    return (
      <div className="relative h-[520px] overflow-hidden">
        <div className="absolute top-0 left-0 w-full animate-scroll-up flex flex-col gap-4 text-sm text-gray-700">
          {doubledList.map((text, idx) => (
            <div
              key={`${prefix}-${idx}`}
              className="cursor-pointer hover:bg-purple-50 p-2 rounded transition"
              onClick={() => onClickItem(text)} // ✅ 点击单条插入 quotes
            >
              {text}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
      {/* 表白列 */}
      <div className="bg-white shadow rounded-xl p-6 flex flex-col">
        <h3 className="text-purple-600 font-semibold text-center mb-4">I LOVE You</h3>
        {renderScrollingList(love, 'love')}
      </div>

      {/* 道歉列 */}
      <div className="bg-white shadow rounded-xl p-6 flex flex-col">
        <h3 className="text-purple-600 font-semibold text-center mb-4">Say Sorry</h3>
        {renderScrollingList(apology, 'apol')}
      </div>

      {/* 祝福列 */}
      <div className="bg-white shadow rounded-xl p-6 flex flex-col">
        <h3 className="text-purple-600 font-semibold text-center mb-4">Blessing</h3>
        {renderScrollingList(blessing, 'bless')}
      </div>

      {/* 感谢列 */}
      <div className="bg-white shadow rounded-xl p-6 flex flex-col">
        <h3 className="text-purple-600 font-semibold text-center mb-4">Thanks</h3>
        {renderScrollingList(thanks, 'thx')}
      </div>
    </div>
  )
}
