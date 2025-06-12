// src/app/picgame/picgame01/page.tsx
'use client'

import PicGameDisplay from '@/components/picgame/PicGameDisplay'

const quotes = {
  lt: [
  "Meow~ I'm your daily dose of catgirl sunshine!",
  "Peek into my eyes... there's a sparkly secret just for you~",
  "Bet you can't resist these purr-fect cat ears, huh?",
  "One cute glance and—boom! You're under my spell!",
  "No doubt about it—I'm the absolute queen of cuteness around here!",
],
  rt: [
    '嘿嘿，这件粉色卫衣超适合我吧？',
    '站在阳光下，是不是特别软萌？',
    '34这个数字，是我的幸运密码～',
    '我的穿搭就是青春代表！',
    '时尚值100分，还带猫咪buff！',
  ],
  lb: [
    '粉嫩袜子+厚底鞋=最强搭配！',
    '快看我的腿，是不是细又长～',
    '这身衣服是我精心挑的哦！',
    '脚下每一步，都是撒娇进攻～',
    '偷偷告诉你，我最爱买袜子啦！',
  ],
  rb: [
    '给我投个喵力吧～',
    '今天要和我一起玩耍吗？',
    '这双手只为喜欢的人挥舞！',
    '喵喵～快来摸摸我！',
    '牵着我的手，一起去冒险吧！',
  ],
}

const description = (
  <>
    猫系少女今日上线！<br /><br />
    她有着柔和的粉发和蓝发渐变，懵懂又灵动的双眼像是在发呆，其实心里已经偷偷盘算着今天要怎么“撒娇攻击”了。她的34号运动卫衣宽松舒适，搭配粉色短裙和高帮球鞋，整个人就是一颗软糯的棉花糖！<br /><br />
    如果你喜欢甜甜的风格，那她一定是你的首选！她可能不善言辞，但每一个小动作都在表达：“我想你抱抱我～”<br /><br />
    喵～你要和我一起走吗？
  </>
)

export default function PicGame01Page() {
  return (
    <PicGameDisplay
      imageUrl="/images/picgame01.png"
      quotes={quotes}
      description={description}
    />
  )
}
