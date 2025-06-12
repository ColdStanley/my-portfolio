// src/app/picgame/picgame04/page.tsx
'use client'

import PicGameDisplay from '@/components/picgame/PicGameDisplay'

const quotes = {
  lt: [
    '早上好，今天的会议记得准时出席！',
    '这文件我已经批好了，去执行吧。',
    '这狗狗不是宠物，是老板！',
    '我今天可是有五场 Zoom 要开。',
    '你今天迟到了三分钟，下次注意哦～',
  ],
  rt: [
    '我的西装是定制的，懂吗？',
    '不要被我的可爱迷惑，我是认真的！',
    '办公室不能没有我这只头脑清醒的狗！',
    '请按流程提交报销，谢谢。',
    '刚刚我批准了一个新的大项目。',
  ],
  lb: [
    '累了就看看我，提神又可爱！',
    '这些文件都得我亲自审核～',
    '我的尾巴表示今天很满意！',
    '小员工们，冲啊！',
    '这张办公椅是我的王座～',
  ],
  rb: [
    '你说我毛太多？这叫气场！',
    '咬住不放，是我做项目的态度！',
    '带狗上班？错，是狗带你上班！',
    '这公司有我才有灵魂！',
    '别摸我头，我在开会！',
  ],
}

const description = (
  <>
    谁说狗狗只能当宠物？这只穿西装的狗狗，用眼神和仪态证明，它才是办公室真正的老板！<br /><br />
    精致的小西装，坐姿端正，神情严肃，连电脑键盘前的状态都堪称职业楷模。<br /><br />
    在这张图里，它不再是萌宠，而是职场精英。可能比你还会管项目、带团队。<br /><br />
    每一次眼神交流都像是在说：“这个方案，你自己看看还有救吗？”
  </>
)

export default function PicGame04Page() {
  return (
    <PicGameDisplay
      imageUrl="/images/picgame04.png"
      quotes={quotes}
      description={description}
    />
  )
}
