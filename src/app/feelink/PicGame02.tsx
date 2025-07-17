'use client'

import FeelinkDisplay from '@/components/feelink/FeelinkDisplay'

const quotes = {
  lt: [
    "Soft? Yes. Squishy? Absolutely. Deadly in dodgeball? You bet.",
    "I may look like a marshmallow, but I’ve got a fire in me.",
    "They told me I was too soft for this world—so I became unburnt s’more king.",
    "My superpower? Hug attacks. No one survives.",
    "Caution: excessively huggable. Proceed at your own risk.",
  ],
  rt: [
    "Eyes like licorice, heart like hot cocoa.",
    "Don’t mistake fluff for weakness—I’m emotionally indestructible.",
    "I roll like I cuddle: full force and all-in.",
    "I’m not small—I’m travel-sized for your convenience!",
    "Smile powered by sugar and pure vibes.",
  ],
  lb: [
    "Legs? Sturdy. Built to bounce through life's soft landings.",
    "Feet made for tiptoeing into hearts.",
    "100% organic marshmallow. No additives, just attitude.",
    "Bouncy steps, soft goals, firm beliefs.",
    "Yes, I have feet. No, I don’t run marathons.",
  ],
  rb: [
    "Let’s stick together—like s’mores on a campfire night.",
    "Got graham crackers? I come with emotional support.",
    "Hot chocolate's sidekick reporting for duty!",
    "Wanna roast me? Too late, I’m already sweet and toasted.",
    "Life’s short—hug a marshmallow.",
  ],
}

const description = (
  <>
    Meet the fluffiest friend you never knew you needed.<br /><br />
    He doesn’t talk much—but his squish says it all. 
    Always smiling, always soft—your go-to emotional support snack for tough days and cozy nights.<br /><br />
    Perfectly toasted? Maybe. Emotionally available? Always.
  </>
)

export default function PicGame02() {
  return (
    <FeelinkDisplay
      imageUrl="/images/picgame02.png"
      quotes={quotes}
      description={description}
    />
  )
}
