// src/app/picgame/PicGame01.tsx
'use client'

import PicGameDisplay from '@/components/picgame/PicGameDisplay'

const quotes = {
  lt: [
    "Meow~ I'm your daily dose of catgirl sunshine!",
    "Look into my eyes… can you see that spark of mischief?",
    "You can’t possibly resist these perfectly twitchy ears, can you?",
    "One sweet glance, and—bam! You're under my spell.",
    "Undeniably, I’m the ultimate queen of cuteness here!",
  ],
  rt: [
    "This pink hoodie? Totally my vibe, right?",
    "Catching sunlight like it was made just for me!",
    "Number 34? My lucky charm—shh, don't tell anyone!",
    "My outfit? Youth with a splash of chaos.",
    "100% fashion energy—now with added catgirl magic!",
  ],
  lb: [
    "Pink socks + chunky shoes = the ultimate combo!",
    "Hey, look at these legs—long, right?",
    "Handpicked this outfit just to dazzle you!",
    "Every step I take is a tiny sneak-attack of charm.",
    "Confession: I’m secretly obsessed with cute socks.",
  ],
  rb: [
    "Send me your meow-energy—I'll turn it into cuteness power!",
    "Wanna hang out with me today?",
    "These hands? Only wave for people I like.",
    "Nyaa~ Headpats? Yes, please!",
    "Hold my hand—let’s go on an adventure together!",
  ],
}

const description = (
  <>
    The ultimate catgirl just logged in!<br /><br />
    Soft pastel hair fades from pink to blue, and those dreamy eyes? Totally plotting her next adorable ambush. Her oversized hoodie (number 34, if you're curious) paired with a pink skirt and high-top sneakers gives off the sweetest cotton-candy vibe.<br /><br />
    If "cute with a twist" is your style, she's your perfect match. Words may not be her thing, but every little movement whispers: “Can I have a hug, please?”<br /><br />
    Meow~ are you coming with me?
  </>
)

export default function PicGame01() {
  return (
    <PicGameDisplay
      imageUrl="/images/picgame01.png"
      quotes={quotes}
      description={description}
    />
  )
}
