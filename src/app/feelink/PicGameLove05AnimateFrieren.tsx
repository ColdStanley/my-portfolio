'use client'

import PicGameDisplay from '@/components/feelink/PicGameDisplay'

const quotes = {
  lt: [
    "You don’t have to understand right now. I’ll wait.",
    "Even if this means nothing to you today, it means something to me.",
    "I never expected you to look back. Just forward—with me.",
    "You live in centuries. I live in seconds. Still, I’m here.",
    "Even a moment beside you feels like a blessing across time.",
  ],
  rt: [
    "You don’t need to say it. I see it—in how you hesitate.",
    "This isn’t a vow. It’s a choice I’ll keep making, quietly.",
    "I’m not trying to change you. Just hoping to stay near.",
    "Let me be the chapter you forget slowly, not instantly.",
    "You look at the world like it’s fading. I want to stay bright for you.",
  ],
  lb: [
    "Even if you walk ahead, I’ll always follow just behind.",
    "I knew what loving you meant. I chose it anyway.",
    "You’ve lost more than I can count. Let me be something you keep.",
    "No one needs to know. But I’ll remember this forever.",
    "Even if I become a blur in your memory—you’ll always be clear in mine.",
  ],
  rb: [
    "I’m not asking for eternity. Just the time you’re willing to give.",
    "Your silence doesn’t scare me. I’ve learned to listen differently.",
    "When you're ready to reach back, I’ll still be holding your hand.",
    "I don’t want your past. I just want to be part of your now.",
    "You don’t have to carry me with you. Just let me walk beside you for a while.",
  ]
}

const description = (
  <>
    I know you’ve lived longer than I can ever imagine.<br />
    I won’t ask you to promise forever—because forever means something different to you.<br /><br />
    But if you’ll let me, I’ll stand by your side in the time we share.<br />
    No magic. No heroics. Just a quiet kind of love that waits without asking.<br /><br />
    You don’t have to say anything. Let me be the one who remembers.
  </>
)

export default function PicGameLove05AnimateFrieren() {
  return (
    <PicGameDisplay
      imageUrl="/images/picgamelove05animateFrieren.png"
      quotes={quotes}
      description={description}
    />
  )
}
