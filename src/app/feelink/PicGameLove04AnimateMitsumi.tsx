'use client'

import PicGameDisplay from '@/components/feelink/PicGameDisplay'

const quotes = {
  lt: [
    "You always look so calm. I wonder if it’s ever tiring.",
    "I noticed how quiet you got. I just didn’t know how to ask.",
    "You’re the kind of person who listens even when no one talks.",
    "Sometimes, I pretend I don’t see you struggling. I’m sorry.",
    "You make everyone feel lighter, even when you're heavy inside.",
  ],
  rt: [
    "If you're waiting for someone to say it’s okay to be unsure—hi, it’s me.",
    "I don’t want you to be perfect. Just honest.",
    "I never know what to say. But I’ll stay here anyway.",
    "You don't need a reason to rest. You already did enough.",
    "Maybe I don't understand everything, but I want to try—with you.",
  ],
  lb: [
    "I say things weird sometimes, but I mean them. Especially to you.",
    "Even if I mess it up, I want to be the one who stays.",
    "Sometimes my heart feels too loud when you’re around.",
    "I might not know the right words, but I’m not going anywhere.",
    "You looked down, so I reached out. It felt right.",
  ],
  rb: [
    "You matter to me. Even when you think you don’t.",
    "If this is confusing, we can figure it out slowly. Together.",
    "You don’t have to say anything. I just wanted you to know.",
    "Being near you makes hard things feel… a little easier.",
    "You’re not alone. I’m right here. Really.",
  ]
}

const description = (
  <>
    （Iwakura Mitsumi / いわくら みつみ） → （Shima Sousuke / しま そうすけ）<br /><br />
    You don’t have to smile all the time, you know.<br />
    I like the version of you who doesn’t have it all together. I really do.<br /><br />
    So even if you feel like you messed up, or said the wrong thing, or didn’t try hard enough—<br />
    just know this: you’re allowed to be human around me.<br /><br />
    I’m not going anywhere.
  </>
)

export default function PicGameLove04AnimateMitsumi() {
  return (
    <PicGameDisplay
      imageUrl="/images/picgamelove04animatemitsumi.png"
      quotes={quotes}
      description={description}
    />
  )
}
