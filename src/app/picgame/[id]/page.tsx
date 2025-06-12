// ✅ 文件位置: src/app/picgame/[id]/page.tsx
'use client'

import PicGameDisplay from '@/components/picgame/PicGameDisplay'

const allPicGameData = {
  'picgame01': {
    imageUrl: '/images/picgame01.png',
    quotes: {
      lt: ['别看我穿得粉嫩，我可是街头最酷的崽！', '今天的OOTD，是不是有点甜？'],
      rt: ['你在看我吗？粉红暴击已准备完毕！', '一身粉配个性短发，是我自己的标签！'],
      lb: ['这双厚底鞋，能带我踩爆烦恼！', '可爱的袜子是细节控必备~'],
      rb: ['给你比个耶✌️，要和我做朋友吗？', '站姿一变，气场全开！']
    },
    description: `
      这是一位散发着独特个性魅力的少女，粉嫩的配色下藏着坚定的眼神。
      她仿佛走在二次元与现实之间，自信地展示着自己的风格。
    `
  },
  'picgame02': {
    imageUrl: '/images/picgame02.png',
    quotes: {
      lt: ['来听我唱一首歌吧~', '舞台灯光准备好，我闪亮登场！'],
      rt: ['麦克风是我的魔杖~', '歌声传递心意，音符组成力量！'],
      lb: ['这双鞋专属舞台~', '每一步都踩在节拍上！'],
      rb: ['双手托起旋律~', '今天的歌，是为你而唱！']
    },
    description: `
      初音未来，虚拟歌姬，电子音符中的奇迹。
      每一场演出都由粉丝与技术共同造就，这不仅是表演，更是共创。
    `
  },
  'picgame03': {
    imageUrl: '/images/picgame03.png',
    quotes: {
      lt: ['我来啦，准备一起唱歌吗？', '好朋友就是要一起唱跳不停！'],
      rt: ['耳机一戴，灵魂上线~', '从今天起，音乐是我们的约定！'],
      lb: ['跳起舞来，裙摆飞扬~', '这条裙子是我最爱的演出服！'],
      rb: ['一起拍拍拍，留下闪耀的回忆~', '照片里记录的是我们的友情~']
    },
    description: `
      镜头前是个活泼的青春偶像。
      她用自信的笑容征服每一位观众，这不只是一张自拍，更是一种态度。
    `
  },
  'picgame04': {
    imageUrl: '/images/picgame04.png',
    quotes: {
      lt: ['你猜我今天是上班，还是拯救世界？', '这身西装，不止能谈判，也能战斗。'],
      rt: ['狗狗打工人，认真起来连人都怕！', '帽子一戴，智商+100。'],
      lb: ['这条领带是职业狗的标配~', '别小看我，我可是最稳的存在。'],
      rb: ['今天的会议主题：骨头与效率。', '你愿意雇我吗？我会“汪”得很好！']
    },
    description: `
      一只穿西装的狗，坐在办公室里，眼神坚定。
      是认真的商业谈判专家，还是只想偷吃饼干的毛茸茸？
    `
  },
  'picgame05': {
    imageUrl: '/images/picgame05.png',
    quotes: {
      lt: ['喵~我可是猫中偶像~', '这姿势是不是超萌？'],
      rt: ['耳朵动一动，是不是感受到撒娇了？', '我不只是可爱，还是很聪明的哦！'],
      lb: ['坐姿优雅是猫耳娘的必修课~', '小短裙+毛衣，是宅家最舒适组合！'],
      rb: ['喜欢被摸头吗？我可是很乖的！', '陪你看剧打游戏都可以~']
    },
    description: `
      家居沙发上的猫耳少女，带来一种暖意与治愈感。
      她不只是可爱的装饰，更是宅家生活中最温柔的陪伴。
    `
  },
  'picgame06': {
    imageUrl: '/images/picgame06.png',
    quotes: {
      lt: ['这长长的双马尾,是我的标志哦!', '甩动这青色的头发,准备唱歌啦!'],
      rt: ['戴上耳机，我的世界就是舞台！', '看我手臂上的“01”，我是最初的声音！'],
      lb: ['这双黑色长靴，是不是超有型？', '我的绝对领域，喜欢吗？'],
      rb: ['挥动双手，为我加油应援吧！', '用这双手，为你创造旋律！']
    },
    description: `
      Miku不只是一个虚拟偶像。她是我们创造力和热爱的结晶，是我们共同的梦想。
      她证明了，只要有爱，我们就能创造奇迹！Miku-chan，最高！
    `
  },
}

export default function PicGamePage({ params }: { params: { id: string } }) {
  const item = allPicGameData[params.id as keyof typeof allPicGameData]

  if (!item) {
    return <div className="text-center text-gray-500 py-20">⚠️ 页面不存在</div>
  }

  return <PicGameDisplay imageUrl={item.imageUrl} quotes={item.quotes} description={item.description} />
}
