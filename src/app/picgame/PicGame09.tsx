'use client'

import PicGameDisplay from '@/components/picgame/PicGameDisplay'

const quotes = {
  lt: [
    "Believe it!—or I’ll say it again. Louder.",
    "Training arc? More like a lifestyle.",
    "If falling down is my hobby, getting up is my flex.",
    "Dreams aren't dead—just waiting for you to catch up.",
    "Shadow clones? More like emotional support backups.",
  ],
  rt: [
    "I don’t need luck. I’ve got stubbornness.",
    "Haters said I’d never make it. I turned that into cardio.",
    "This forehead protector? It also shields my ambition.",
    "You call it ADHD. I call it ‘battle-ready enthusiasm.’",
    "Smile = default. Rage = situational.",
  ],
  lb: [
    "Every scar has a story. Mine just yells a lot.",
    "Fox inside me? Yeah, he pays rent now.",
    "I run like I mean it—and I always mean it.",
    "My ninja way? Mess up → reflect → still try.",
    "Don’t ask me to chill. That’s not on the jutsu list.",
  ],
  rb: [
    "Wanna spar? I warn you—I monologue while punching.",
    "Failure taught me more than school ever did.",
    "Loyalty: it’s in the scroll, and in the soul.",
    "Got friends who believe in me? Then I'm unstoppable.",
    "Let’s go—life doesn’t wait for doubters.",
  ],
}

const description = (
  <>
    Loud, loyal, and lowkey legendary.<br /><br />
    He’s not here to whisper goals—he shouts them from rooftops. Behind the messy hair and wild optimism is a heart that never gives up.<br /><br />
    Call him chaotic, call him cringe—but whatever you do, don’t underestimate him.
  </>
)

export default function PicGame09() {
  return (
    <PicGameDisplay
      imageUrl="/images/picgame09.png"
      quotes={quotes}
      description={description}
    />
  )
}
