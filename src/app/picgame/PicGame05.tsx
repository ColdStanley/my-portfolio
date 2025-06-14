// src/app/picgame/PicGame05.tsx
'use client'

import PicGameDisplay from '@/components/picgame/PicGameDisplay'

const quotes = {
  lt: [
    "Welcome home, master~ meow!",
    "I just hid the cat treats—guess where?",
    "Did you miss me? No ear rubs yet today!",
    "There’s a little surprise in the kitchen~",
    "Wanna curl up on the couch and watch anime together?",
  ],
  rt: [
    "These cat ears? Oh yeah, they twitch.",
    "I'm a certified pro at being adorably clingy~",
    "The moment you walk in, my tail goes wild!",
    "If you touch my ears... I might purr~",
    "Shh—no going out today. Just us, okay?",
  ],
  lb: [
    "The floor’s cold… can I nap in your lap?",
    "It’s cleaning day—look how shiny the floor is!",
    "This tail’s not a toy… but you can pet it.",
    "Look at me—am I not the most obedient little thing?",
    "Master, will you help brush my fur?",
  ],
  rb: [
    "Nyaa~ ready for some cuddles?",
    "These paws are serious business!",
    "Nap time—wanna join me?",
    "I’m all dressed up to be spoiled. Are you ready?",
    "Your one and only catgirl is waiting to be fed~",
  ],
}

const description = (
  <>
    Home feels extra cozy when your favorite catgirl is waiting for you.<br /><br />
    If you're tired, she’ll curl up beside you and whisper, “Let’s not do anything today. Just be with me.”
  </>
)

export default function PicGame05() {
  return (
    <PicGameDisplay
      imageUrl="/images/picgame05.png"
      quotes={quotes}
      description={description}
    />
  )
}
