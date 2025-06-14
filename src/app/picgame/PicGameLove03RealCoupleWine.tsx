'use client'

import PicGameDisplay from '@/components/picgame/PicGameDisplay'

const quotes = {
  lt: [
    "We had sushi on paper plates and it still felt like a five-star night.",
    "You said ‘cheers’ with soy sauce on your sleeve. Iconic.",
    "Pretty sure we burned the candle wax into the table—but worth it.",
    "You forgot the chopsticks, I forgot the wine opener. We’re still a team.",
    "Even when nothing goes to plan, you’re my favorite part of the evening.",
  ],
  rt: [
    "We could do this every Friday and I’d still smile like an idiot.",
    "You and wine are both dangerous, but only one makes my cheeks warm.",
    "No dress code, no pressure—just us being accidentally perfect.",
    "I fell for you somewhere between the sushi roll and your bad joke.",
    "You make 'doing nothing special' feel kinda magical.",
  ],
  lb: [
    "There was a moment you laughed, and I swear time softened around us.",
    "I kept watching your hands instead of the movie we never finished.",
    "It was just takeout and candlelight. But I remember how it felt.",
    "I didn’t take any pictures—but the night’s burned into memory anyway.",
    "The way you looked at me across that couch... yeah, I noticed.",
  ],
  rb: [
    "You’re not just part of my life—you’re the quiet in it.",
    "Thank you for being my soft place to land, again and again.",
    "Love isn’t loud with you. It’s steady, and warm, and right.",
    "I never need the fancy version of us. This one is enough.",
    "This—right here—is what happy looks like to me.",
  ],
}

const description = (
  <>
    We didn’t book a restaurant, or dress up, or try to impress anyone tonight.<br /><br />
    It was just wine, sushi, your laugh—and the way you still looked at me like I was something worth holding on to.<br /><br />
    Nights like this remind me I don’t need big plans to feel lucky. I just need you.
  </>
)

export default function PicGameLove03RealCoupleWine() {
  return (
    <PicGameDisplay
      imageUrl="/images/picgamelove03realcouplewine.png"
      quotes={quotes}
      description={description}
    />
  )
}
