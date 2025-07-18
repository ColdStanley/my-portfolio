'use client'

import FeelinkDisplay from '@/components/feelink/FeelinkDisplay'

const quotes = "Life's short—hug a marshmallow. I may look soft and squishy, but I've got a fire in me. Your go-to emotional support snack for tough days and cozy nights."

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
