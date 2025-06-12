// src/app/picgame/picgamestanleyemmanuel/page.tsx
'use client'

import PicGameDisplay from '@/components/picgame/PicGameDisplay'

const quotes = {
  lt: [
    '准备好被我们打爆了吗？Prépare-toi à te faire exploser par nous !',
    'Manuel 左手运球如风～Manuel dribble comme le vent avec sa main gauche~',
    'Stanley 今天三分不打铁！Stanley ne rate aucun tir à trois points aujourd’hui !',
    '球场上只有一个 MVP，那就是我！Il n’y a qu’un seul MVP sur le terrain : moi !',
    '对面根本追不上我们啊～Ils ne peuvent même pas nous suivre~',
  ],
  rt: [
    '车上的热身已经开始！L’échauffement commence déjà dans la voiture !',
    '等我上场，对手就只能祈祷了～Une fois que je suis sur le terrain, les adversaires peuvent juste prier~',
    'Manuel 这次不会再被盖帽了吧？Manuel, tu ne vas pas encore te faire contrer, hein ?',
    'Stanley 的防守堪比长城！La défense de Stanley est comme la Grande Muraille !',
    '后排坐好了，篮板全是我们的！Accroche-toi, tous les rebonds sont pour nous !',
  ],
  lb: [
    '谁说司机不能是得分王？Qui a dit que le chauffeur ne pouvait pas être le meilleur marqueur ?',
    '我们不光技术好，长得也帅！On est bons, et en plus on est beaux !',
    '篮下硬刚，永不退缩！On attaque le panier sans jamais reculer !',
    '这场比赛，我们打出总决赛的气势！On joue ce match comme une finale !',
    '你负责得分，我负责耍帅！Tu marques, et moi je brille !',
  ],
  rb: [
    '两个打一个算欺负人吗？Est-ce que deux contre un, c’est de la triche ?',
    '篮球是我们的语言，默契是我们的超能力！Le basket est notre langue, la complicité notre super-pouvoir !',
    '我们今天不是来打球的，是来统治球场的！On n’est pas là pour jouer, on est là pour dominer !',
    '哨响前的最后一笑～Un dernier sourire avant le coup de sifflet~',
    '球在我手里，胜利就是我们的。Le ballon dans mes mains, la victoire est à nous.',
  ],
}

const description = (
  <>
    我和 Manuel 正在开往球场的路上，别看我们现在笑得灿烂，等一下球场上可就不会留情了！<br />
    Nous sommes en route vers le terrain avec Manuel. On sourit maintenant, mais sur le terrain, pas de pitié !<br /><br />

    他是爆发力满点的快攻之王，我是精准控场的节奏大师。<br />
    C’est le roi des contre-attaques explosives, je suis le maître du tempo et des passes précises.<br /><br />

    每次上场我们都像《灌篮高手》的组合，互相默契地完成每一个回合。<br />
    À chaque match, on est comme un duo de Slam Dunk, parfaitement synchro sur chaque action.<br /><br />

    对手看到我们笑着走上场，都知道这局要玩完了～<br />
    Dès que nos adversaires nous voient arriver en souriant, ils savent déjà que c’est fini pour eux~<br /><br />

    下一球进了，我们就开车去吃炸鸡咯！<br />
    Si on met le prochain panier, c’est parti pour du poulet frit en voiture !
  </>
)

export default function PicGame08() {
  return (
    <PicGameDisplay
      imageUrl="/images/picgamestanleyemmanuel.png"
      quotes={quotes}
      description={description}
    />
  )
}
