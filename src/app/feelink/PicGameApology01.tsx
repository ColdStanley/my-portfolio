'use client'

import PicGameDisplay from '@/components/feelink/PicGameDisplay'

const quotes = {
  lt: [
    "This is me, showing up late—with zero excuses and both hands up.",
    "Turns out, forgetting airport pickups is a fast way to lose trust.",
    "Yeah, I messed up. No emoji can fix that.",
    "This face? It's the 'I know I blew it' starter pack.",
    "I brought snacks. And apologies. Mostly apologies.",
  ],
  rt: [
    "You didn’t even yell. That hurt more than yelling.",
    "I would rewind today if I could. Or at least check the damn calendar.",
    "Next time, I’ll be early. Like awkwardly early.",
    "Want me to Uber your parents every Sunday for a month?",
    "If you let me earn back one thing, let it be your trust.",
  ],
  lb: [
    "I memorized their flight number this time. It’s burned into my brain.",
    "I was halfway there when I realized I’d already messed it up.",
    "I didn’t forget them. I just forgot how important this was to you.",
    "The worst part? You still said 'it’s fine.'",
    "I checked the arrival time 3 times… then still got it wrong.",
  ],
  rb: [
    "Can I trade this mistake for a slow dinner and no phones?",
    "Let me show you I’m not always this dumb. Just this once.",
    "I'll never forget this lesson—because it cost me that look you gave me.",
    "This is me, learning. Slowly, but for real.",
    "Still here. Still sorry. Still hoping.",
  ],
}

const description = (
  <>
    I told you I'd pick up your parents from the airport. You even texted me the flight info—twice.<br /><br />
    But I lost track of time, got stuck in traffic, and by the time I got there, they’d already Ubered home.<br /><br />
    You didn’t say much. Just sat across from me like this, quiet.  
    I get it. I didn’t just forget an errand—I forgot something that mattered to you.
  </>
)

export default function PicGameApology01() {
  return (
    <PicGameDisplay
      imageUrl="/images/picgameapology01.png"
      quotes={quotes}
      description={description}
    />
  )
}
