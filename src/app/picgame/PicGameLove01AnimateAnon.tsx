'use client'

import PicGameDisplay from '@/components/picgame/PicGameDisplay'

const quotes = {
  lt: [
    "You always look away when I try to meet your eyes.",
    "I hate how easily you make my heart race.",
    "I kept replaying yesterday. Every silence. Every glance.",
    "You smile like nothing matters. But it does. You do.",
    "Every time you walk away, I wish I had said more.",
  ],
  rt: [
    "You’re quieter now. Is it me? Or something I said?",
    "I wanted to pretend it was just a phase. It’s not.",
    "Maybe I read too much into things. But you let me.",
    "I don’t want to be just another friend who fades.",
    "Tell me if this is wrong. I’ll still mean every word.",
  ],
  lb: [
    "I practiced what to say. None of it felt right.",
    "Being near you hurts—but not being near you is worse.",
    "Sometimes, I swear you hear the things I don’t say.",
    "You held my wrist once. I still remember how warm you were.",
    "If this is one-sided, I’ll carry it quietly. I promise.",
  ],
  rb: [
    "I don’t want perfect. I just want honest—with you.",
    "I’ll wait, if waiting means there’s a chance.",
    "Even if you don’t feel the same... just stay.",
    "Let me stay in your silence a little longer.",
    "You don’t have to love me back. Just don’t leave.",
  ]
}

const description = (
  <>
    （Chihaya Anon / ちはや あのん） → （Nagasaki Soyo / ながさき そよ）<br /><br />
    I know you’re good at pretending things don’t matter.<br />
    And I’m terrible at hiding when they do.<br /><br />
    So maybe this is messy, maybe it’s too much. But I can’t keep pretending I don’t care how you look at me.<br /><br />
    If this ruins everything, fine. But if there’s even a small part of you that doesn’t want me to walk away—say something. Please.
  </>
)

export default function PicGameLove01AnimateAnon() {
  return (
    <PicGameDisplay
      imageUrl="/images/picgamelove01animateanon.png"
      quotes={quotes}
      description={description}
    />
  )
}
