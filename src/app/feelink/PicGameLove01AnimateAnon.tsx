'use client'

import FeelinkDisplay from '@/components/feelink/FeelinkDisplay'

const quotes = "You don't have to love me back. Just don't leave. I hate how easily you make my heart race, but being near you hurts less than not being near you at all."

const description = (
  <>
    （Chihaya Anon / ちはや あのん） → （Nagasaki Soyo / ながさき そよ）<br /><br />
    I know you’re good at pretending things don’t matter.<br />
    And I’m terrible at hiding when they do.<br /><br />
    So maybe this is messy, maybe it’s too much. But I can’t keep pretending I don’t care how you look at me.<br /><br />
    If this ruins everything, fine. But if there’s even a small part of you that doesn’t want me to walk away—say something. Please.
  </>
)

export default function PicGameLove01AnimateAnon() {
  return (
    <FeelinkDisplay
      imageUrl="/images/picgamelove01animateanon.png"
      quotes={quotes}
      description={description}
    />
  )
}
