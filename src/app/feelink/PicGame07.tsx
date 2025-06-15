'use client'

import PicGameDisplay from '@/components/feelink/PicGameDisplay'

const quotes = {
  lt: [
    "Eat my banana peels. I was born for first place.",
    "Helmet? Nah, I’ve got plot armor.",
    "They call it karting—I call it emotional warfare.",
    "I don’t drive safe, I drive legendary.",
    "You see a red shell—I see destiny.",
  ],
  rt: [
    "This track? My turf. This turn? My legacy.",
    "Faster than Wi-Fi on campus.",
    "I drift harder than your ex moved on.",
    "Mario Kart isn’t a game—it’s a personality test.",
    "One wrong turn and your friendships go with it.",
  ],
  lb: [
    "Princess on wheels. Crown stays on during combat.",
    "Don’t underestimate the mushroom with attitude.",
    "Floating carpet > airbag.",
    "Ever seen road rage on a racetrack? Now you have.",
    "We don’t race for trophies—we race for bragging rights.",
  ],
  rb: [
    "Catch me at the finish line—or don’t.",
    "No brakes, no rules, no mercy.",
    "Who gave Toad a flying license?!",
    "This is your final lap warning: I don't lose.",
    "We don’t stop for traffic—we make the traffic.",
  ],
}

const description = (
  <>
    The race is on—and chaos is at full throttle.<br /><br />
    With a flying carpet, royal chariots, and Mushroom-powered motorcycles, this isn’t just karting—it’s an all-out cartoon showdown with banana traps, red shells, and very real emotional damage.<br /><br />
    Speed? Check. Style? Obviously. Survival? Optional.
  </>
)

export default function PicGame07() {
  return (
    <PicGameDisplay
      imageUrl="/images/picgame07.png"
      quotes={quotes}
      description={description}
    />
  )
}
