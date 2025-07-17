'use client'

import FeelinkDisplay from '@/components/feelink/FeelinkDisplay'

const quotes = {
  lt: [
    "I may be small, but my love is full-size.",
    "This ring box is 80% nerves, 20% sparkle.",
    "Do I look calm? Because inside I’m proposing in 12 different languages.",
    "I rehearsed this 87 times... and still forgot half.",
    "Kneeling is easy. Waiting for your answer? Torture.",
  ],
  rt: [
    "She gasped. That’s a good sign, right?",
    "I hope she notices the flower in my fur.",
    "This tux was a gamble. But so is love.",
    "The violin squirrels started too early—again.",
    "Mom said to bring confidence. I brought snacks too.",
  ],
  lb: [
    "If this goes viral, please crop out my tail.",
    "Honestly, I practiced in front of the mirror... and a potato.",
    "Her ‘yes’ would make this the best Tuesday ever.",
    "Proposal level: animated classic. Budget: leaf ring.",
    "This isn't a proposal. It’s a life upgrade request.",
  ],
  rb: [
    "Forever starts now. Also, dinner’s in 15 minutes.",
    "Say yes, and I’ll bake you acorn muffins forever.",
    "Marry me—not just for love, but for blanket forts.",
    "I promise: warm paws, big hugs, no drama.",
    "One heart, two squirrels, infinite snacks together.",
  ],
}

const description = (
  <>
    The big question—asked with tiny paws.<br /><br />
    This brave little gent just poured out his heart, right under the cherry blossoms, with two violin mice playing in the background. <br /><br />
    It’s clumsy, honest, and impossibly adorable—just like real love.
  </>
)

export default function PicGame10() {
  return (
    <FeelinkDisplay
      imageUrl="/images/picgame10.png"
      quotes={quotes}
      description={description}
    />
  )
}
