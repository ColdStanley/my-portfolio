'use client'

import PicGameDisplay from '@/components/picgame/PicGameDisplay'

const quotes = {
  lt: [
    "Emma, I walked in and you had that 'surprise but I planned everything' face. Classic.",
    "Kevin had already set up the ring light like it was prom. Respect.",
    "Lily screamed louder than the playlist. My ears are still recovering.",
    "Matt tried to pretend he wasn't crying. Bro had a balloon in front of his face and misty glasses.",
    "I walked in thinking 'oh cute candles'—then saw the full charcuterie board and gave up.",
  ],
  rt: [
    "Emma deserves an Oscar for pretending this was 'just dinner.' Girl, you printed name cards.",
    "Kevin kept saying 'this lighting is tragic' while taking 48 pics of my forehead.",
    "Lily kept refilling my drink like she was running a spa. Love her, fear her.",
    "Matt held the cake like it was a bomb squad mission. I’ve never seen hands tremble that fast.",
    "Honestly, the real gift was just watching you guys try to keep a secret for 3 days.",
  ],
  lb: [
    "Emma’s spreadsheet probably had color codes. Don’t deny it.",
    "Kevin edited my party pics before I even got home. Who does that?? (Legend.)",
    "Lily posted me singing off-key to her story and captioned it 'Star of the Night'... rude.",
    "Matt tried to start a toast and ended up quoting Fast & Furious. We let him cook.",
    "I still don’t know who brought the mini disco light. But I respect the chaos.",
  ],
  rb: [
    "Emma, thank you for reminding me why I love my people—and fear your event-planning energy.",
    "Kevin, I appreciate you making me look 10% hotter in every photo. That’s real friendship.",
    "Lily, you made me feel famous and slightly bullied. I treasure it.",
    "Matt, you made me laugh so hard I snorted champagne. I forgive you for everything.",
    "You guys turned a normal Thursday into a memory I’ll keep replaying when I’m old and annoying.",
  ],
}

const description = (
  <>
    I thought we were just getting tacos.<br /><br />
    Next thing I know, there’s a crown on my head, a cake with my name, and someone yelling “blow it out like your GPA depends on it.”<br /><br />
    You are officially banned from ever “keeping it chill” again.<br />
    But seriously—thank you. That was one of the best nights I’ve had in a long time.
  </>
)

export default function PicGameThanks01HappyBirthday() {
  return (
    <PicGameDisplay
      imageUrl="/images/picgamethanks01birthdayparty.png"
      quotes={quotes}
      description={description}
    />
  )
}
