// src/app/picgame/PicGame04.tsx
'use client'

import PicGameDisplay from '@/components/picgame/PicGameDisplay'

const quotes = {
  lt: [
    "Good morning. Don’t forget the meeting at 9 sharp.",
    "Docs approved. Go execute—I'm watching.",
    "This isn't a pet—this is your boss.",
    "Five Zoom calls lined up today. Let’s go.",
    "You're three minutes late. Don't make it a habit.",
  ],
  rt: [
    "This suit? Custom tailored, obviously.",
    "Don’t be fooled by the fluff—I'm all business.",
    "This office runs on coffee... and me.",
    "Expense reports go through proper channels. Thanks.",
    "Just greenlit a massive new project. You’re welcome.",
  ],
  lb: [
    "Tired? Just look at me. Instant morale boost.",
    "Yes, I personally reviewed every file on this desk.",
    "Tail wag = KPI exceeded.",
    "Alright team—let’s crush this quarter!",
    "This chair? Executive throne, thank you very much.",
  ],
  rb: [
    "Too much fur? It’s called presence.",
    "Sink my teeth in and don’t let go—that’s how I manage projects.",
    "Bring your dog to work? No. Dog runs the workplace.",
    "This company wouldn’t be the same without me.",
    "Don’t pet me. I’m in a meeting.",
  ],
}

const description = (
  <>
    Who says dogs can’t be CEOs?<br /><br />
    This suited-up pup isn’t just adorable—he’s commanding the room with boss-level energy. Perfect posture, focused eyes, and a business vibe sharper than your manager’s PowerPoint.<br /><br />
    In this office, he’s not the pet. He’s the one running the show.
  </>
)

export default function PicGame04() {
  return (
    <PicGameDisplay
      imageUrl="/images/picgame04.png"
      quotes={quotes}
      description={description}
    />
  )
}
