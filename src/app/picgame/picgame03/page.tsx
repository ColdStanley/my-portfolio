// src/app/picgame/picgame03/page.tsx
'use client'

import PicGameDisplay from '@/components/picgame/PicGameDisplay'

const quotes = {
  lt: [
    '我就是你现实中的初音未来！',
    '真人 Cosplay 的我，能打几分？',
    '穿上这身装扮，我就化身音之精灵！',
    '双马尾是灵魂，不能少的一根都没有！',
    '比起舞台灯光，我更喜欢你注视的目光～',
  ],
  rt: [
    '这可是我精心准备的造型！',
    '细节拉满，Miku 本人都要点赞！',
    '从发饰到腰带，每一处都还原原作！',
    '耳机是道具，更是态度！',
    '是不是有点真得过分啦？',
  ],
  lb: [
    '站在你面前，是梦与现实的交汇～',
    'Cosplay，不只是模仿，更是热爱！',
    '你看这双腿，走过了无数漫展的红毯～',
    '腿控福利时间到了～',
    '这角度拍下去，就是壁纸级别！',
  ],
  rb: [
    '和我合张影吧？',
    'Coser 与角色之间的连接，不止于衣装！',
    '每一场漫展，都是一场华丽的演出～',
    '看到你认出我，就值了！',
    'Cos 成 Miku，我真的超开心！',
  ],
}

const description = (
  <>
    她不是虚拟偶像，但她让初音未来走进了现实世界。<br /><br />
    这位Coser完美还原了Miku的经典造型，从蓝绿色双马尾、发饰到标志性的服装细节，每一处都体现出对角色的热爱与用心。<br /><br />
    拍摄场地布光专业，镜头捕捉下她动人神情的每一刻，每一帧都仿佛Miku在现实中真实现身。<br /><br />
    喜欢 Cosplay 的你，也许会从她身上看到梦想成真的模样。
  </>
)

export default function PicGame03Page() {
  return (
    <PicGameDisplay
      imageUrl="/images/picgame03.png"
      quotes={quotes}
      description={description}
    />
  )
}
