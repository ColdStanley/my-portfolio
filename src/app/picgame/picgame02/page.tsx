// src/app/picgame/picgame02/page.tsx
'use client'

import PicGameDisplay from '@/components/picgame/PicGameDisplay'

const quotes = {
  lt: [
    '这里是战场，我是主角！',
    '别小看我，我可是全服最强辅助！',
    '戴上这副耳机，就能听见胜利的节奏！',
    '想赢比赛？先问问我愿不愿意出手～',
    '电竞少女，可不仅仅会唱歌哦！',
  ],
  rt: [
    '这台设备可是我的宝贝～',
    '操控键盘的我最帅气了！',
    '粉紫渐变，是我独特的战斗色！',
    '我在异次元发光发热，也闪耀现实！',
    '别眨眼，一眨眼我就Carry全场啦！',
  ],
  lb: [
    '战靴在脚，信心满满！',
    '快节奏、精准操作，是我的标签！',
    '每一次点击，都是命运的抉择～',
    '你能跟上我的节奏吗？',
    '胜利就在脚下，我一步步踩上巅峰！',
  ],
  rb: [
    '准备好一起作战了吗？',
    '用音乐控制节奏，用操作拿下胜利！',
    '不只是可爱，还是实力派！',
    '别以为我只会卖萌～我还能Carry你！',
    '上麦前别忘了：今天，我是你的队长！',
  ],
}

const description = (
  <>
    欢迎进入她的电竞主场！<br /><br />
    这位来自异次元的歌姬，一边用甜美嗓音掌控全场，一边用超快手速制霸电竞舞台。她有着粉紫渐变的秀发、标志性的猫耳耳机，坐在战椅上的她霸气外露，每一帧都是高清壁纸！<br /><br />
    别被她软萌的外表欺骗了——她可是操作与意识并存的女王，战绩辉煌，圈粉无数。<br /><br />
    如果你渴望和她一起并肩作战，那就加入她的频道吧！
  </>
)

export default function PicGame02Page() {
  return (
    <PicGameDisplay
      imageUrl="/images/picgame02.png"
      quotes={quotes}
      description={description}
    />
  )
}
