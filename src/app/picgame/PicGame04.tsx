'use client'

import PicGameDisplay from '@/components/picgame/PicGameDisplay'

const quotes = {
  lt: [
    "Yes, I look like I hacked your dreams—and installed neon.",
    "Goth? Kinda. Glitchcore? Maybe. Just me? Always.",
    "My hair has its own power grid.",
    "Smiling ironically since '99.",
    "Don't worry, I only curse Wi-Fi signals.",
  ],
  rt: [
    "These goggles? Not just for show—I see through your nonsense.",
    "Winged eyeliner sharp enough to delete your bad vibes.",
    "I sparkle... in the darkest codebases.",
    "The green is not envy. It's voltage.",
    "This isn’t cosplay—it’s mood armor.",
  ],
  lb: [
    "I dress like I’m about to DJ in a haunted server room.",
    "Cyber boots powered by caffeine and defiance.",
    "Fishnet sleeves: dramatic effect, zero signal loss.",
    "Outfit: 80% black, 20% glow-in-the-dark chaos.",
    "My aesthetic? Hacker Barbie meets bass drop demon.",
  ],
  rb: [
    "Let’s take a walk—through a digital dystopia.",
    "You're not afraid of the dark. You're afraid of the eyeliner in it.",
    "Wanna join my rave cult? Bring glowsticks and attitude.",
    "This smile? Debugged it myself.",
    "Say hi now, before I vanish into a techno mist.",
  ],
}

const description = (
  <>
    She’s not just dressed to impress—she’s coded to disrupt.<br /><br />
    With neon dreadlocks, fishnet flair, and enough charisma to overload a server farm, she’s your favorite paradox: spooky but soft, intense but inviting.<br /><br />
    Step closer. She bites... in binary.
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
