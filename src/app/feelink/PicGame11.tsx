'use client'

import FeelinkDisplay from '@/components/feelink/FeelinkDisplay'

const quotes = {
  lt: [
    "Wands out. Homework later.",
    "Just three kids and a billion-dollar prophecy.",
    "Not all heroes wear capes—some wear sweaters and tie stripes.",
    "We didn't choose the magic life. It chose us.",
    "Patronus practice after class—bring snacks.",
  ],
  rt: [
    "This team? Chaos, courage, and caffeine.",
    "Ron’s nervous. That means something’s definitely about to explode.",
    "Hermione brought a plan. Harry brought trauma.",
    "Someone said 'detention'? Must be Tuesday.",
    "The Sorting Hat clearly had a sense of humor.",
  ],
  lb: [
    "Lumos, because none of us can find our phones.",
    "Accio courage! (And maybe a backup plan.)",
    "Every spellbook has at least one burnt page—thanks, Ron.",
    "Who needs therapy when you have spells and sarcasm?",
    "Team motto: Survive first, ask questions after.",
  ],
  rb: [
    "It’s all fun and games until Voldemort shows up again.",
    "Expecto friendshipum!",
    "Magic + trauma bonding = unbeatable trio.",
    "Our house? Gryffindor. Our vibe? Slightly unhinged.",
    "Rule #1: Don’t let Ron cook the potions again.",
  ],
}

const description = (
  <>
    The golden trio returns—spell-ready and slightly sleep-deprived.<br /><br />
    Whether it's saving the school (again), decoding magical riddles, or just dodging another cursed hallway, these three are magic’s most relatable mess.<br /><br />
    Friendship, chaos, and a whole lot of wand-flinging? You’re in the right place.
  </>
)

export default function PicGame11() {
  return (
    <FeelinkDisplay
      imageUrl="/images/picgame11.png"
      quotes={quotes}
      description={description}
    />
  )
}
