'use client'

export default function QuoteSuggestionPanel() {
  const confession = [
    '我喜欢你很久了，一直没说出口。',
    '遇见你，是我最幸运的事。',
    '如果可以重来一次，我还是会选择你。',
    '我想和你一起走完接下来的日子。',
    '你笑的样子，藏进了我的梦里。',
    '每次和你对视，我都慌乱又期待。',
    '其实我每次发消息，都在等你的回复。',
    '哪怕只是短暂的相处，我都觉得值得。',
    '喜欢你这件事，我从未后悔。',
    '你是我偷偷许过愿的那个人。',
    '有你在的时候，世界变得不一样了。',
    '你走进我心里，就没想过离开。',
    '你出现的时候，整个世界都安静了。',
    '那一刻我明白，我是真的动心了。',
    '即使你不在我身边，我依然会想你。',
    '我曾无数次幻想过我们的未来。',
    '你知不知道，你的笑对我来说有多重要？',
    '如果你也在意我一点点，我就满足了。',
    '你知道我多想在你面前表现得自然一点吗？',
    '所有的暗示和小心翼翼，其实都是我在努力靠近你。',
  ]

  const apology = [
    '对不起，我真的不是故意的。',
    '我不该让你一个人承受那么多。',
    '我后悔了，真的很想补偿你。',
    '请再给我一次机会，好吗？',
    '你的一句原谅，对我来说意义重大。',
    '有些话没说出口，不代表我不在乎。',
    '我不完美，但我在努力变好。',
    '不想失去你，也不想伤害你。',
    '我懂了，以后我会更小心。',
    '谢谢你愿意听我解释。',
  ]

  const blessing = [
    '愿你心中有光，眼里有爱。',
    '前路漫漫，愿你不孤单。',
    '愿你所有梦想都不被辜负。',
    '愿你永远被温柔以待。',
    '愿你平安喜乐，万事顺遂。',
    '愿你不被辜负，也不再委屈。',
    '愿你努力的日子都有收获。',
    '愿你的人生永远朝着你热爱的方向前进。',
    '愿你在沉默中也能被理解。',
    '愿你继续保持温柔和热爱。',
  ]

  const renderScrollingList = (list: string[], prefix: string) => {
    // 复制列表项以创建无缝循环
    const doubledList = [...list, ...list];

    return (
      <div className="relative h-[520px] overflow-hidden">
        {/*
          动画现在将内容从 0%（其原始位置）移动到 -50%（其高度的一半，即原始列表的一整套）。
          我们移除 min-h-[1040px]，因为内容的高度将由其子元素决定，并且动画将处理滚动。
        */}
        <div className="absolute top-0 left-0 w-full animate-scroll-up flex flex-col gap-4 text-sm text-gray-700">
          {doubledList.map((text, idx) => (
            <div
              key={`${prefix}-${idx}`}
              className="cursor-pointer hover:bg-purple-50 p-2 rounded transition"
            >
              {text}
            </div>
          ))}
        </div>
      </div>
    );
  };


  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
      {/* 表白列 */}
      <div className="bg-white shadow rounded-xl p-6 flex flex-col">
        <h3 className="text-purple-600 font-semibold text-center mb-4">表白</h3>
        {renderScrollingList(confession, 'c')}
      </div>

      {/* Say Sorry 列 */}
      <div className="bg-white shadow rounded-xl p-6 flex flex-col">
        <h3 className="text-purple-600 font-semibold text-center mb-4">Say Sorry</h3>
        {renderScrollingList(apology, 's')}
      </div>

      {/* 祝福列 */}
      <div className="bg-white shadow rounded-xl p-6 flex flex-col">
        <h3 className="text-purple-600 font-semibold text-center mb-4">祝福</h3>
        {renderScrollingList(blessing, 'b')}
      </div>
    </div>
  )
}