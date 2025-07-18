'use client'

import FeelinkDisplay from '@/components/feelink/FeelinkDisplay'

const quotes = "Still here. Still sorry. Still hoping. I didn't forget them—I just forgot how important this was to you. Let me show you I'm not always this dumb."

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
    <FeelinkDisplay
      imageUrl="/images/picgameapology01.png"
      quotes={quotes}
      description={description}
    />
  )
}
