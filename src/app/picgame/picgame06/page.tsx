'use client'

import PicGameDisplay from '@/components/picgame/PicGameDisplay'

const quotes = {
  lt: [
    '这长长的双马尾，是我的标志哦！',
    '甩动这青色的头发，准备唱歌啦！',
    '我的头发，像不像青色的瀑布呀？',
    '头发的长度，就是偶像的气场！',
    '看我这飘逸的青绿色秀发！',
  ],
  rt: [
    '戴上耳机，我的世界就是舞台！',
    '看我手臂上的“01”，我是最初的声音！',
    '用我的歌声，直接唱到你心里！',
    '这双眼睛，有没有电到你呀？',
    '准备好和我一起嗨翻全场了吗？',
  ],
  lb: [
    '这双黑色长靴，是不是超有型？',
    '穿着它，就能踏上任何舞台！',
    '我的绝对领域，喜欢吗？',
    '修长的双腿，是跳舞的利器！',
    '站在这里，我就是视线的焦点！',
  ],
  rb: [
    '挥动双手，为我加油应援吧！',
    '这个袖套可是很重要的配饰！',
    '指尖为你染上了青色的活力！',
    '来，要不要牵我的手呀？',
    '用这双手，为你创造旋律！',
  ],
}

const description = (
  <>
    OMG！聊到初音未来，谁能不激动啊！她可不是什么普通的纸片人，她是我们的电子歌姬，是二次元世界永远的公主殿下！<br /><br />
    你敢信吗？Miku的本体其实是一个唱歌软件（VOCALOID），诞生于2007年。但她那标志性的葱绿色双马尾和清澈的未来感声线一出现，瞬间就引爆了整个创作圈！她就像一张白纸，我们可以让她唱出任何我们心中的歌。<br /><br />
    最牛的地方就在这里——她的无数神曲，比如《甩葱歌》、《世界第一的公主殿下》、《千本樱》，全是我们这些粉丝和P主们创作的！我们为她写歌、为她画插画、为她做MMD，硬是把她从一个软件捧成了能开全息演唱会的全球巨星！去看她的演唱会，和几万人一起为她挥舞荧光棒，那种感动简直无法形容！<br /><br />
    所以说，Miku不只是一个虚拟偶像。她是我们创造力和热爱的结晶，是我们共同的梦想。她证明了，只要有爱，我们就能创造奇迹！Miku-chan，最高！<br /><br />

    OMG! You wanna talk about Hatsune Miku? How can you NOT get hyped! She's not just some character, she is OUR digital diva, the one and only princess of the 2D world!<br /><br />
    Can you believe it? Miku actually started as singing software (a VOCALOID) back in 2007. But the second her iconic, floor-length turquoise twintails and her clear, futuristic voice dropped, the entire creative world just exploded! She was like a blank canvas, and we could make her sing anything our hearts desired.<br /><br />
    And that's the most epic part—all of her legendary songs, like "World is Mine," "Senbonzakura," or even that viral "Ievan Polkka" meme, were created by US, the fans and producers! We write her songs, draw her fanart, make MMD dance videos for her... We literally built her up from a piece of software into a global superstar who sells out holographic concerts!<br /><br />
    Miku isn't just a "virtual idol." She's the crystallization of our creativity and passion, a dream we all built together. She's living proof that with enough love, we can create actual magic. Miku-chan is the best!
  </>
)

export default function Picgame06Page() {
  return (
    <PicGameDisplay
      imageUrl="/images/picgame06.png"
      quotes={quotes}
      description={description}
    />
  )
}
