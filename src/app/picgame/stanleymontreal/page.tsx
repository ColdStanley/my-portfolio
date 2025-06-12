'use client'

import PicGameDisplay from '@/components/picgame/PicGameDisplay'

const quotes = {
  lt: [
  '雨中漫步配蹦迪的鞋，风雅与疯批只在一念之间！ | Une promenade sous la pluie avec des baskets de club, entre chic et choc !',
  'Nancy 的眼神告诉我：滑冰不如火锅。 | Dans les yeux de Nancy : la fondue > le patinage.',
  '“教堂是景点，还是我神圣得像景点？” | “L’église est un monument, ou c’est moi qui brille comme un ?”',
  '我们跨年倒计时的方式是：数着谁第一个摔跤。 | Notre décompte du Nouvel An ? Compter qui tombe en premier.',
  '“人类滑冰，而我滑出风情。” | “Les gens patinent, moi je glisse avec grâce.”',

  '摩天轮上思考人生，下来的时候只想吃薯条。 | Sur la grande roue : pensées profondes. En bas : frites, direct.',
  'Monica 冰上漂移的技巧，连企鹅都看傻了。 | Même les pingouins sont jaloux du drift de Monica.',
  '圣诞节看教堂，结果我们仨在门口自拍拍了半小时。 | Noël à l’église ? 30 minutes de selfies devant, pas dedans.',
  'Stanley：冰上飞人。现实：摔倒时自带音效。 | Stanley : patineur pro ? Bruitage réaliste à la chute.',
  '“滑冰是项运动，但我们的表情是演出。” | “Le patinage est un sport, nos visages en font un spectacle.”',
  '我们唯一的默契，是谁都不会滑但都说会滑。 | Notre synchro ? Tous prétendent savoir patiner, aucun ne sait.',
  '“来蒙特利尔不是为了浪漫，是为了摔倒得有艺术性。” | “Montréal ? Pas pour le romantisme, mais pour chuter avec style.”',
  '其实我们不是滑冰，是在冬天表演慢动作。 | En vrai, on ne patine pas. On fait du ralenti hivernal.',
  '冰面上一字马失败，照片却拍得像杂志封面。 | Grand écart raté sur glace, photo digne d’un magazine.',
  '如果这次旅行拍成纪录片，片名该叫《滑倒也要笑》 | Si ce voyage était un docu : “Chuter avec le sourire”.'
],
  rt: [
  '摩天轮之上，我许的愿是：别再冻脸。 | En haut de la grande roue, j’ai souhaité : plus de nez gelé.',
  'Monica 一直在问：为什么滑冰场没有暖气？ | Monica demande : pourquoi il n’y a pas de chauffage sur la glace ?',
  '圣诞节气氛拉满，我们包场自拍十分钟。 | Ambiance de Noël : 10 minutes de selfies comme des stars.',
  '“我笑着，是因为你们都冻得脸僵。” | “Je souris parce que vous avez tous perdu vos joues.”',
  '蒙特利尔的冬天就像我们友情一样——冻得牢固。 | L’hiver à Montréal ? Comme notre amitié : solide et glacé.',

  'Stanley：外表微笑，内心冻成 PPT。 | Stanley : sourire dehors, PowerPoint glacé dedans.',
  '跨年前我们许的愿望是：吃顿不冷的饭。 | Notre vœu avant minuit ? Un dîner qui ne gèle pas.',
  '滑冰拍照三十张，笑容只成功了一张。 | 30 photos sur la glace, un seul vrai sourire.',
  '圣诞节我们交换的礼物是：一双暖手宝。 | À Noël, notre échange : une bataille de chaufferettes.',
  '“别动，我拍到了你打喷嚏的瞬间！” | “Bouge pas, j’ai capturé ton éternuement parfait !”',
  '我们不是来滑冰，是来验证谁的羽绒服保暖。 | On teste pas la glace, on teste les doudounes.',
  '自拍里我们的鼻子一个比一个红。 | Nos selfies ? Compétition de nez rouges.',
  '圣诞帽 + 滑冰鞋 = 圣诞老人的极地出差装。 | Bonnet rouge + patins = Père Noël en mission arctique.',
  '大家都在滑冰，我在滑回家的方向感。 | Tous patinent, moi je perds le nord… littéralement.',
  '笑容冻住不算什么，关键是还能拍得上镜。 | Sourire figé ? Tant qu’on est photogéniques, ça passe.'
]
,
  lb: [
  '“裙子底下是秋裤，谁懂谁懂！” | “Des leggings sous la jupe... les vrais savent !”',
  '那天的滑冰，是我人生最接近冬奥的一刻。 | Ce jour-là, j’ai frôlé les JO d’hiver.',
  '“我来滑冰，不是来摔交际花的。” | “Je patine, je ne chute pas comme une drama queen.”',
  '圣诞节，我们交换了笑声和热量。 | À Noël, on a échangé des fous rires et des calories.',
  '“我只滑一次，然后决定转行做圣诞老人。” | “Un tour de glace et j’envisage une carrière de Père Noël.”',

  '“脚冻成冰棍，但发型不能乱。” | “Pieds congelés, mais brushing intact.”',
  'Monica 摔了三次，还不忘说“我是故意的”。 | Monica est tombée trois fois, mais c’était “volontaire”.',
  '我们仨的配色就像圣诞树：红绿配齐。 | Nos looks ? Un vrai sapin de Noël ambulant.',
  'Stanley 的滑冰技术，被称为“走位随缘”。 | Le style de Stanley ? Glissades en freestyle.',
  '“为什么滑冰场没有美食区？” | “Où est le food court sur cette patinoire ?”',
  '我们交换的不是礼物，是摔跤次数。 | On a compté nos chutes au lieu des cadeaux.',
  'Nancy 摔倒时说：“这是一种风格呈现。” | Nancy en tombant : “C’est une performance artistique.”',
  '“每次摔倒都让我更接近地球妈妈。” | “Chaque chute me rapproche de Mère Nature.”',
  '“裙子飞起来的一刻，我知道我赢了。” | “Quand ma jupe s’est envolée, j’ai su que j’étais championne.”',
  '我们不是滑冰，是表演圣诞喜剧现场。 | C’était pas du patinage, c’était du stand-up de Noël.'
]
,
  rb: [
  'Stanley 说：我摔跤不是笨，是重力太喜欢我。 | Stanley dit : ce n’est pas de la maladresse, c’est la gravité qui m’adore.',
  '“吃法餐是我们的奖励，尤其在摔了三跤后。” | “La cuisine française, notre récompense après trois gamelles.”',
  '“自拍五连拍，滑冰五连摔。” | “5 selfies, 5 chutes. Équilibre parfait.”',
  '“这张照片里谁最会滑？当然是我话多。” | “Le meilleur patineur ? Celui qui parle le plus, bien sûr !”',
  '“那天我的笑是热的，脚是冷的。” | “Ce jour-là, mon sourire était chaud, mes pieds glacés.”',

  '“每摔一次，就更接近圣诞老人的气质。” | “Chaque chute me rapproche de l’esprit du Père Noël.”',
  '摩天轮下来后，我决定改行做哲学家。 | Après la grande roue, je me suis senti philosophe.',
  '“笑到腹肌疼，比滑冰还有效。” | “Fous rires = abdos, plus efficace que le patinage.”',
  '“如果滑冰能减肥，那我们都瘦成闪电了。” | “Si le patinage faisait maigrir, on serait des éclairs.”',
  '“我的帽子滑走了，但尊严我还抓得住。” | “Mon bonnet est parti, mais ma dignité est restée.”',
  '那天我们摔倒的方式，比走路还多样。 | Ce jour-là, on est tombés avec plus de style que de pas.',
  '“Monica 笑我滑跤，结果她比我还快躺地。” | Monica s’est moquée, puis a goûté la glace à son tour.',
  '我们不是在滑冰，是在演一部冬季综艺秀。 | On n’a pas patiné, on a joué une comédie d’hiver.',
  '“笑着滑，摔着笑，节奏感拿捏住了。” | “On glisse, on rit, on tombe. En rythme s’il vous plaît !”',
  '滑冰结束后我们统一说：明年改温泉！ | Après ça, on a tous dit : l’an prochain, on choisit les thermes !'
]
,
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
