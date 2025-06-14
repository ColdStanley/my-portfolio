// src/app/picgame/PicGame03.tsx
'use client'

import PicGameDisplay from '@/components/picgame/PicGameDisplay'

const quotes = {
  lt: [
    "I'm your real-world Miku, right here!",
    "How’d I do? Rate my Miku cosplay!",
    "Once I put this on, I become the spirit of sound.",
    "These twin tails? Non-negotiable—pure soul energy.",
    "Forget stage lights—I love the way you look at me.",
  ],
  rt: [
    "This look? I planned every single detail!",
    "Even Miku herself would give this a thumbs-up!",
    "From hair clips to belt—100% accuracy!",
    "These headphones? Not just props—they’re part of me.",
    "Too real? Maybe just a little... and I love it.",
  ],
  lb: [
    "Standing before you—where dream meets reality.",
    "Cosplay isn’t just mimicry—it’s devotion.",
    "These legs? They've walked the red carpets of a hundred cons.",
    "Leg-lover alert: you're welcome.",
    "Captured from this angle—wallpaper material!",
  ],
  rb: [
    "Wanna snap a pic with me?",
    "Cosplay is more than costumes—it's connection.",
    "Every con is a grand performance of passion.",
    "You recognized me? Totally worth it!",
    "Becoming Miku made me truly happy.",
  ],
}

const description = (
  <>
    She's not a virtual idol—but she brings Miku to life.<br /><br />
    This dedicated cosplayer nails every detail of the iconic Miku look—from the teal twin tails and hair accessories to the costume’s intricate design. <br /><br />
    If you’re a fellow cosplay lover, this might just feel like a dream made real.
  </>
)

export default function PicGame03() {
  return (
    <PicGameDisplay
      imageUrl="/images/picgame03.png"
      quotes={quotes}
      description={description}
    />
  )
}
