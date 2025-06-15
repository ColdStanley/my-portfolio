'use client'

import PicGameDisplay from '@/components/feelink/PicGameDisplay'

const quotes = {
  lt: [
    "Remember that dinner? Yeah, I still cringe too.",
    "They say timing is everything—and mine sucked.",
    "If I could rewind, I’d start with ‘I’m proud of you,’ not a dumb joke.",
    "Your mom was being sweet. I was being... me. I’m sorry.",
    "Next time, I’ll just pass the salad. No commentary."
  ],
  rt: [
    "I joke when I’m nervous. Doesn’t make it okay—but it’s true.",
    "You deserved someone better at that moment. Let me try again.",
    "Even your brother gave me the side-eye. Ouch.",
    "I meant to make your night easier. I didn’t.",
    "One slip-up doesn’t mean I don’t care. You know that, right?"
  ],
  lb: [
    "Please tell your mom I really do think she’s awesome.",
    "I already rehearsed my actual apology. Twice.",
    "Still thinking about how your hand pulled away from mine...",
    "You didn’t say much on the ride home—but I heard everything.",
    "If showing up matters—I’m here."
  ],
  rb: [
    "No jokes this time. Just me, saying I messed up.",
    "I can’t undo the moment, but I can be better for the next one.",
    "This isn’t just about dinner—it’s about listening better.",
    "If love is patience, I owe you a lot.",
    "Let me be the guy who learns—especially from the stuff that matters."
  ],
}

const description = (
  <>
    I know you hate when I make jokes at the wrong time.<br /><br />
    And yeah… that dinner with your family? Definitely the wrong time.<br />
    I thought I was being charming. Turns out, I was being an idiot.<br /><br />
    So here I am, not trying to be funny. Just trying to say: I’m sorry.<br />
    And I hope you’ll let me make it up to you—with no punchlines this time.
  </>
)

export default function PicGameApology02() {
  return (
    <PicGameDisplay
      imageUrl="/images/picgameapology02.png"
      quotes={quotes}
      description={description}
    />
  )
}
