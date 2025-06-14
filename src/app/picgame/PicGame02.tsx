// src/app/picgame/PicGame02.tsx
'use client'

import PicGameDisplay from '@/components/picgame/PicGameDisplay'

const quotes = {
  lt: [
    "This is my battlefield—and I’m the MVP.",
    "Don’t underestimate me—best support on the server right here!",
    "Put on these headphones and you’ll hear the rhythm of victory.",
    "Wanna win? Better hope I decide to join.",
    "A gamer girl who sings? I’m a full combo of awesome.",
  ],
  rt: [
    "This setup? My precious.",
    "Nothing looks cooler than me behind the keyboard.",
    "Pink-purple gradient: my signature power color.",
    "I shine in the digital world—and glow IRL too.",
    "Don’t blink, or you’ll miss my perfect play!",
  ],
  lb: [
    "With my game boots on, I never miss a beat.",
    "Fast hands, sharp mind—that’s my brand.",
    "Every click is a decision that changes the game.",
    "Can you keep up with my pace?",
    "Victory is under my feet—I climb to the top step by step.",
  ],
  rb: [
    "Ready to squad up?",
    "Music sets the tempo, skill seals the win!",
    "I’m not just cute—I’m clutch.",
    "Don’t think I’m all fluff—I can carry you too!",
    "Before we queue: today, I’m your captain.",
  ],
}

const description = (
  <>
    Welcome to her digital domain.<br /><br />
    This girl from another dimension commands both the stage and the arena—melting hearts with her voice while crushing enemies with her APM. <br /><br />
    If you're ready to fight alongside her—grab your gear and join her channel!
  </>
)

export default function PicGame02() {
  return (
    <PicGameDisplay
      imageUrl="/images/picgame02.png"
      quotes={quotes}
      description={description}
    />
  )
}
