'use client'

import PicGameDisplay from '@/components/picgame/PicGameDisplay'

const quotes = {
  lt: [
    '雨中漫步配蹦迪的鞋，风雅与疯批只在一念之间！ | Une promenade sous la pluie avec des baskets de club, entre chic et choc !',
    'Nancy 的眼神告诉我：滑冰不如火锅。 | Dans les yeux de Nancy : la fondue > le patinage.',
    '“教堂是景点，还是我神圣得像景点？” | “L’église est un monument, ou c’est moi qui brille comme un ?”',
    '我们跨年倒计时的方式是：数着谁第一个摔跤。 | Notre décompte du Nouvel An ? Compter qui tombe en premier.',
    '“人类滑冰，而我滑出风情。” | “Les gens patinent, moi je glisse avec grâce.”',
  ],
  rt: [
    '摩天轮之上，我许的愿是：别再冻脸。 | En haut de la grande roue, j’ai souhaité : plus de nez gelé.',
    'Monica 一直在问：为什么滑冰场没有暖气？ | Monica demande : pourquoi il n’y a pas de chauffage sur la glace ?',
    '圣诞节气氛拉满，我们包场自拍十分钟。 | Ambiance de Noël : 10 minutes de selfies comme des stars.',
    '“我笑着，是因为你们都冻得脸僵。” | “Je souris parce que vous avez tous perdu vos joues.”',
    '蒙特利尔的冬天就像我们友情一样——冻得牢固。 | L’hiver à Montréal ? Comme notre amitié : solide et glacé.',
  ],
  lb: [
    '“裙子底下是秋裤，谁懂谁懂！” | “Des leggings sous la jupe... les vrais savent !”',
    '那天的滑冰，是我人生最接近冬奥的一刻。 | Ce jour-là, j’ai frôlé les JO d’hiver.',
    '“我来滑冰，不是来摔交际花的。” | “Je patine, je ne chute pas comme une drama queen.”',
    '圣诞节，我们交换了笑声和热量。 | À Noël, on a échangé des fous rires et des calories.',
    '“我只滑一次，然后决定转行做圣诞老人。” | “Un tour de glace et j’envisage une carrière de Père Noël.”',
  ],
  rb: [
    'Stanley 说：我摔跤不是笨，是重力太喜欢我。 | Stanley dit : ce n’est pas de la maladresse, c’est la gravité qui m’adore.',
    '“吃法餐是我们的奖励，尤其在摔了三跤后。” | “La cuisine française, notre récompense après trois gamelles.”',
    '“自拍五连拍，滑冰五连摔。” | “5 selfies, 5 chutes. Équilibre parfait.”',
    '“这张照片里谁最会滑？当然是我话多。” | “Le meilleur patineur ? Celui qui parle le plus, bien sûr !”',
    '“那天我的笑是热的，脚是冷的。” | “Ce jour-là, mon sourire était chaud, mes pieds glacés.”',
  ],
}

const description = (
  <>
    我们在蒙特利尔度过了冻到飞起的假期，从圣诞滑到跨年，滑冰、逛教堂、吃法餐、看摩天轮，样样不落！<br />
    Nos vacances à Montréal ? Un frisson sans fin ! Patinage, église, cuisine française et grande roue, tout y est passé !<br /><br />
    Nancy 的表情告诉我们“我可以不滑，但你不能不拍”；Monica 在等一个暖气开关；Stanley 则在坚持“只要我笑得比你多，我就赢了”。<br />
    L’expression de Nancy : “Je glisse pas, mais tu prends la photo.” Monica cherche le chauffage. Stanley ? Il pense qu’un sourire suffit à gagner.<br /><br />
    如果这都不算快乐，那快乐一定穿着冰鞋藏起来了！<br />
    Et si ce n’est pas ça le bonheur... alors il a dû enfiler des patins et se cacher !
  </>
)

export default function Page() {
  return (
    <PicGameDisplay
      imageUrl="/images/picgamenms.png"
      description={description}
      quotes={quotes}
    />
  )
}
