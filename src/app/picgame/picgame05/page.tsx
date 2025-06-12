// src/app/picgame/picgame05/page.tsx
'use client'

import PicGameDisplay from '@/components/picgame/PicGameDisplay'

const quotes = {
  lt: [
    '欢迎回来，主人～喵！',
    '我刚刚才把猫粮藏好了，你猜猜在哪？',
    '是不是想我啦，今天没摸耳朵！',
    '厨房那边有惊喜哦～',
    '要不要一起窝在沙发上看动漫？',
  ],
  rt: [
    '这双猫耳可是会动的呢！',
    '我可是专业的撒娇猫娘～',
    '你一回家，我的尾巴就不听话了！',
    '你摸我耳朵的时候，我会叫的～',
    '嘘，今天我们不出门，就待在一起！',
  ],
  lb: [
    '地板好凉，我可以躺你怀里吗？',
    '今天是猫娘打扫日，地板都亮了～',
    '这尾巴不是玩具，但你可以摸～',
    '你看我这个姿势，是不是超级乖？',
    '主人，要帮我梳毛吗？',
  ],
  rb: [
    '喵呜～今天要贴贴吗？',
    '我的小爪子可不是闹着玩的！',
    '午睡时间到，要不要一起？',
    '我准备好变身了，你准备好宠爱了吗？',
    '你的专属猫娘，正在等你投喂～',
  ],
}

const description = (
  <>
    家是最温暖的地方，尤其当里面有一位慵懒可爱的猫娘在等你回家时。<br /><br />
    她穿着轻松的居家服，耳朵轻轻晃动，尾巴懒洋洋地摆动，每个动作都在说：“主人，欢迎回来～”<br /><br />
    沙发是她的领地，厨房是她的战场，阳台是她晒太阳的王座。<br /><br />
    如果你累了，她会靠在你身边，轻声说：“今天，什么都别做，就陪我吧。”
  </>
)

export default function PicGame05Page() {
  return (
    <PicGameDisplay
      imageUrl="/images/picgame05.png"
      quotes={quotes}
      description={description}
    />
  )
}
