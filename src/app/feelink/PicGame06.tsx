// src/app/feelink/PicGame06.tsx
'use client'

import PicGameDisplay from '@/components/feelink/PicGameDisplay'

const quotes = {
  lt: [
    "These long twin-tails? Total icon status!",
    "Whipping my teal hair—time to sing!",
    "Doesn’t it look like a flowing turquoise waterfall?",
    "Hair this long equals idol-level energy!",
    "Watch my hair shimmer—this is stardom in motion!",
  ],
  rt: [
    "With my headphones on, the world becomes my stage!",
    "See the '01' on my arm? I’m the original voice.",
    "Singing straight into your soul—can you hear it?",
    "These eyes? Full of spark, full of future.",
    "Are you ready to turn this whole place into a party?",
  ],
  lb: [
    "These black boots? Sleek. Sharp. Show-ready.",
    "Wearing them means I’m ready to own any stage.",
    "Like my 'absolute territory'? It’s iconic, right?",
    "Long legs made to dance—watch me move!",
    "When I’m here, all eyes come right to me.",
  ],
  rb: [
    "Wave those hands—let’s light up the night!",
    "This sleeve is more than fashion—it’s identity.",
    "My fingertips are charged with turquoise energy!",
    "Come on, take my hand—we’ll make music together!",
    "With these hands, I’ll craft melodies just for you.",
  ],
}

const description = (
  <>
    Miku isn’t just a character—she’s a cultural phenomenon.<br /><br />
    Miku is more than a virtual idol. She’s the embodiment of passion, community, and boundless creativity. Together, we built her. Together, we believe. With love, we made magic.<br /><br />
    Miku-chan is, and always will be, the best.
  </>
)

export default function PicGame06() {
  return (
    <PicGameDisplay
      imageUrl="/images/picgame06.png"
      quotes={quotes}
      description={description}
    />
  )
}
