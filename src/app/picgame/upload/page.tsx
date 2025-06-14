'use client'

import { useState } from 'react'
import PicGameUploadHeader from '@/components/picgame/picgame-upload/PicGameUploadHeader'
import UploadFormRow from '@/components/picgame/picgame-upload/UploadFormRow'
import QuoteSuggestionPanel from '@/components/picgame/picgame-upload/QuoteSuggestionPanel'

export default function PicGameUploadPage() {
  const [quotes, setQuotes] = useState('')

  const handleInsertQuote = (text: string) => {
    setQuotes(prev => (prev ? prev + '\n' + text : text))
  }

  // ✨ Four categories of quote suggestions
  const love = [
    "I've had feelings for you for so long but never said a word.",
    "Meeting you is the luckiest thing that's ever happened to me.",
    "If I could do it all over again, I'd still choose you.",
    "I want to walk through the rest of my life with you.",
    "Your smile finds its way into my dreams.",
    "Every time our eyes meet, I get nervous—and hopeful.",
    "Every message I send is just me waiting for your reply.",
    "Even brief moments with you feel worth everything.",
    "I've never regretted loving you.",
    "You're the person I once wished for, silently.",
    "The world feels different when you're around.",
    "You moved into my heart and never left.",
    "When you appear, everything else quiets down.",
    "That moment I saw you, I knew I was falling.",
    "Even when you're not here, I still miss you.",
    "I've imagined our future so many times.",
    "Do you know how much your smile means to me?",
    "If you cared even a little, I’d be over the moon.",
    "I wish I could act natural around you—just once.",
    "Every subtle hint was just me trying to get closer.",
    "Your name is the shortest love poem I’ve ever known.",
    "If I could open my heart, you'd be the only one inside.",
    "I think I’m lost—can I stay in your heart?",
    "Ever since you showed up, my happiness took shape.",
    "I might need an eye exam—because all I see is you.",
    "You must be a magnet—I can’t stop being pulled to you.",
    "My world was grayscale—until you brought the color.",
    "You taught me what ‘love at first sight’ really means.",
    "You're like my favorite song—I could play you on repeat forever.",
    "If love had a shape, it would be you.",
    "I have a superpower: I’m crazy about you.",
    "You don’t need filters—you’re already perfect in my eyes.",
    "Others grew up on candy—you grew up on charm, didn’t you?",
    "I have a secret—and I want to share it for a lifetime.",
    "You’re the one unexpected thing I want to keep forever.",
    "If I were a DJ, I'd play 'Crush' just for you—would you dance with me?",
    "I want every memory of you carved into my heart.",
    "My heart has a VIP section—it’s just for you.",
    "When you smile, it feels like fireworks inside me.",
    "We’re not parallel lines—we crossed paths for a reason.",
    "My heart races every time I see you—without fail.",
    "My life is like a storybook—and you’re the best chapter yet.",
    "You're the sweetest surprise box life ever gave me.",
    "I must’ve saved the galaxy in a past life—to deserve you.",
    "You're the light that cleared all my storms.",
    "Let’s grow old watching stars, moons, and each other.",
    "My heart is always open for you—24/7.",
    "Since meeting you, I realized happiness has a heartbeat.",
    "You're the one I’ve been searching for all along.",
    "Take my hand—let’s chase all the possibilities together.",
  ]

  const apology = [
    "I'm truly sorry—I never meant to hurt you.",
    "You shouldn't have had to carry that alone. I’m sorry.",
    "I regret it all and I wish I could make it right.",
    "Would you please give me one more chance?",
    "Your forgiveness would mean the world to me.",
    "Just because I didn’t say it, doesn’t mean I didn’t care.",
    "I'm not perfect, but I’m trying to be better.",
    "I never wanted to lose you—or hurt you.",
    "I've learned, and I’ll do better next time.",
    "Thank you for even listening to me now.",
    "If words were wind, mine blew away your smile—I’m sorry.",
    "My heart feels like a lost kite—only your forgiveness can guide it back.",
    "I might’ve had a brain freeze—that’s the only excuse for what I did.",
    "Please don’t stay mad—it hurts me more than you know.",
    "I'd say sorry a thousand times—if it earns one real hug from you.",
    "Maybe it’s my fault for being too charming? Sorry anyway!",
    "Our story hit a wrong turn—but I want to set it straight again.",
    "Your smile used to light up my world—I’m sorry I dimmed it.",
    "Let me seal this apology with a kiss?",
    "I was wrong—punish me with a lifetime of loving you.",
    "I didn’t mean to upset you—but I can’t stand knowing I did.",
    "This apology may be cheap—but my sincerity is priceless.",
    "I know you’ve got a soft heart behind those strong words—please forgive me.",
    "Don’t blame my clumsiness—it comes from loving you too much.",
    "I’ll trade all my bad habits for just one forgiving smile.",
    "If apologies worked, I’d keep apologizing until your heart melted.",
    "I'm not making excuses—I’m just hoping for understanding.",
    "Sorry, I messed up—I promise to do better next time.",
    "I'll write a whole song about regret—just say you'll listen.",
    "I fear no one—but I’m terrified of you staying angry.",
  ]

  const blessing = [
    "May your heart always find its light, and your eyes their wonder.",
    "May your path be long—but never lonely.",
    "May your biggest dreams never be wasted.",
    "May kindness always find you first.",
    "Wishing you peace, joy, and everything in between.",
    "May you never be betrayed—or have to shrink yourself again.",
    "May your hard work always pay off.",
    "May your life follow the rhythm of your passion.",
    "May even your silence be understood.",
    "Never lose your gentleness or your spark.",
    "May your days carry breezes and blossoms.",
    "May your eyes always catch the light of hope.",
    "May every place you go bring peace; and every person, kindness.",
    "May your soul stay wild, free, and filled with poetry.",
    "May the world be soft to you—and your love, strong.",
    "May your waiting always lead to something wonderful.",
    "May your smile be as bright as summer sun.",
    "May you travel far—and return with a young heart.",
    "May your pen draw the path to your truest dreams.",
    "May we meet again, again and again—in joy and good health.",
    "May you move like wind and bloom like spring.",
    "May every day be a melody that lifts you.",
    "May you find peace even in the loudest chaos.",
    "May what you seek be kind—and what you get, even better.",
    "May you walk through storms and return to starlight.",
    "May every effort bring quiet, beautiful rewards.",
    "May your world be filled with flowers and fruit.",
    "May you become your own sun, glowing from within.",
    "May your heart hold a garden that never fades.",
    "May time treat you kindly, and love stay soft.",
    "May you live boldly, love deeply, and never look back with regret.",
    "May your every sunrise feel like a new beginning.",
    "May the world be worth the journey—again and again.",
    "May your story be full of wine, verses, and wild places.",
    "May every lonely hour find its warmth.",
    "Shine in your orbit—like the star you are.",
    "Every step you take—may it lead to a better view.",
    "Let your light shine in ways only you can.",
    "May your kindness be protected and returned tenfold.",
    "May your hopes come true and your path stay smooth.",
  ]

  const thanks = [
    "Thank you for always being there.",
    "Thanks for everything you’ve done quietly behind the scenes.",
    "Thank you for your patience and understanding.",
    "Grateful for your patience—even when I’m hard to deal with.",
    "Thank you for never giving up on me.",
    "You complete my world—thank you.",
    "Thank you for stepping into my life.",
    "Thanks for riding all the highs and lows with me.",
    "Your presence lights up my life—thank you.",
    "Thank you for helping me grow into a better person.",
    "Thanks for being my life coach and joy supplier.",
    "You’re proof that angels exist—and look amazing too.",
    "Thank you for letting me be foolish—without judgment.",
    "You cut through my confusion like a beam of light—thank you.",
    "Grateful that fate sent such a fun soul my way.",
    "Thanks for coloring my life beyond black and white.",
    "You were always there—even when I didn’t know I needed you.",
    "Thanks for filling my cart—and my heart.",
    "Thank you for being my rant partner and emotional sponge.",
    "You’ve given my world new shades of warmth—thank you.",
    "Thanks for giving me a push when I almost gave up.",
    "You taught me love—and how to receive it. Thank you.",
    "Your presence makes my universe whole.",
    "Thank you for curing my indecision and chronic laziness.",
    "You’re always there when it matters most—thank you.",
    "Thank you for making even the quiet days meaningful.",
    "You’re my comfort corner and soul café—thank you.",
    "You made my world softer, sweeter, warmer—thank you.",
    "Thanks for being with me through every sunrise and sunset.",
    "You remind me the best moments come unexpectedly—thank you.",
    "You guide me like starlight—thank you.",
    "You love me even when I’m a mess—thank you.",
    "You’ve filled my life with laughter and light—thank you.",
    "You’re the purest warmth I’ve known—thank you.",
    "Thanks for standing with me and witnessing it all.",
    "My world is rich because you're in it—thank you.",
    "Thanks for all the unspoken support and silent love.",
    "You’ve left a deep mark on my journey—thank you.",
    "Having you is having the whole world—thank you.",
    "You bring sunshine to my heart—thank you.",
  ]
  // ✅ 修复按钮功能
  const onInsertFromCategory = (category: 'love' | 'apology' | 'blessing' | 'thanks') => {
    const map = { love, apology, blessing, thanks }
    const selected = [...map[category]].sort(() => 0.5 - Math.random()).slice(0, 5)
    setQuotes(prev => (prev ? prev + '\n' + selected.join('\n') : selected.join('\n')))
  }

  return (
    <div className="min-h-screen px-4 py-8 space-y-6 bg-gray-50">
      <PicGameUploadHeader />
      <UploadFormRow
        quotes={quotes}
        setQuotes={setQuotes}
        onInsertFromCategory={onInsertFromCategory}
      />
      <QuoteSuggestionPanel
        love={love}
        apology={apology}
        blessing={blessing}
        thanks={thanks}
        onClickItem={handleInsertQuote}
      />
    </div>
  )
}
