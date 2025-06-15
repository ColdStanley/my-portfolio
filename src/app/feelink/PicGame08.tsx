'use client'

import PicGameDisplay from '@/components/feelink/PicGameDisplay'

const quotes = {
  lt: [
    "Did you just step into a sacred barrier? Oopsie.",
    "Your aura’s… a bit dusty. Want me to cleanse it?",
    "Yes, I accept spiritual consultations. Pay in snacks.",
    "No need to bow. Just don’t lie in front of me.",
    "You brought bad vibes into my shrine? Bold move.",
  ],
  rt: [
    "The ribbon? It’s not just cute—it seals your fate.",
    "This wand? It’s also a fly swatter for demons.",
    "I see through masks—spiritual and literal.",
    "Your intentions are showing. Want help hiding them?",
    "Shh. The spirits are watching your browser history.",
  ],
  lb: [
    "This isn’t cosplay. I actually banish stuff.",
    "Exorcism level: calm voice, chaotic results.",
    "The dress code is tradition. The sarcasm is mine.",
    "Blessed, balanced… and deeply unimpressed.",
    "Shrine maiden by birth, roaster by talent.",
  ],
  rb: [
    "Ask me anything. But be prepared for the truth.",
    "Sacred charms included—emotional damage optional.",
    "My smile? 80% peace, 20% warning.",
    "You’re cute. But your karma’s a mess.",
    "Want guidance? Step into the circle. Gently.",
  ],
}

const description = (
  <>
    Dressed in red and white, armed with grace and quiet power.<br /><br />
    She’s not just a shrine maiden—she’s a spiritual firewall. 
    One look and she already knows if you skipped your apology prayers.<br /><br />
    Speak your heart. Or she’ll read it anyway.
  </>
)

export default function PicGame08() {
  return (
    <PicGameDisplay
      imageUrl="/images/picgame08.png"
      quotes={quotes}
      description={description}
    />
  )
}
