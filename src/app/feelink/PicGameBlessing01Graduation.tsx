'use client'

import PicGameDisplay from '@/components/feelink/PicGameDisplay'

const quotes = {
  lt: [
    "Sophie, you’re sitting like you didn’t just annihilate four years of chaos.",
    "You actually made that cap and gown look cool. How dare you.",
    "Not you casually slaying graduation like it’s your side quest.",
    "Pretty sure you’re the only person who smiled through finals and still had eyebrows.",
    "You look peaceful, but I know your feet are in crocs under that robe.",
  ],
  rt: [
    "You used to Google 'how to drop a class'… and now you’re out here graduating??",
    "This photo screams: ‘I survived group work, cafeteria food, and myself.’",
    "From crying over citations to smiling like a queen. Character arc complete.",
    "Honestly, if anyone could graduate in style and sarcasm, it’s you.",
    "You walked in freshman year with a backpack bigger than you. Now look at you.",
  ],
  lb: [
    "Remember when you pulled an all-nighter and still showed up in full makeup? Iconic.",
    "You once wrote an essay on a phone. In a moving Uber. You deserve this degree.",
    "Thanks for being the friend who reminded me what day the exam was. Mostly.",
    "We both know you passed that class with emotional damage and caffeine.",
    "I’m only slightly bitter that you looked this good while I looked like a leftover midterm.",
  ],
  rb: [
    "Sophie, the world has no idea what's coming. But I do—and I'm cheering.",
    "I hope post-grad life treats you like your favorite coffee order: strong, sweet, and slightly overpriced.",
    "You didn’t just finish school. You did it with grace, grit, and maybe glitter.",
    "If success had a face right now, it’d be you in that gown, smiling like a Pixar character.",
    "Proud doesn’t even cover it. Now go turn your degree into something dangerous (and fun).",
  ],
}

const description = (
  <>
    You made it through finals, bad coffee, and three existential crises—and still came out with that smile.<br /><br />
    I’ve seen you cry over a C+, dance over a B-, and somehow thrive on 4 hours of sleep and iced lattes.<br /><br />
    Watching you walk across that stage? Felt like I was cheering for all the versions of you who didn’t quit.<br />
    So proud of you, grad. Now go scare the real world a little.
  </>
)

export default function PicGameBlessing01Graduation() {
  return (
    <PicGameDisplay
      imageUrl="/images/picgameblessing01graduation.png"
      quotes={quotes}
      description={description}
    />
  )
}
