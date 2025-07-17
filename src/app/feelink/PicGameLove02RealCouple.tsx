'use client'

import FeelinkDisplay from '@/components/feelink/FeelinkDisplay'

const quotes = {
  lt: [
    "You remembered my coffee order before I did.",
    "You stayed quiet when I needed it, and loud when I didn’t know I did.",
    "You laughed at that stupid meme I sent at 2am. That meant more than you think.",
    "You never made me explain the bad days. You just stayed.",
    "Every little thing you do feels like a reason to stay longer.",
  ],
  rt: [
    "I’m still not over how lucky I got with you. Like—statistically, how?",
    "You're basically my favorite person, and that’s dangerously permanent.",
    "If this was a video game, you'd be the reason I save my progress.",
    "You make fast food feel like a five-star date. No notes.",
    "I don’t know what I did right, but I’d do it again to find you.",
  ],
  lb: [
    "You don’t ask for much, but you give everything.",
    "Sometimes I just look at you and think—yeah, I’m home.",
    "I know I forget to say it, but I notice all of it. All of you.",
    "You showed up in my life like quiet magic. I never saw you coming.",
    "You're not loud love. You're quiet, everyday, constant love. The best kind.",
  ],
  rb: [
    "Thank you—for being soft when life’s been sharp.",
    "You’re the calm I never knew I needed.",
    "I love you. Not just for who you are, but for how you make me feel like myself.",
    "Thank you for choosing me. Again and again, even on my worst days.",
    "Loving you feels like breathing. Effortless, necessary, and mine.",
  ],
}

const description = (
  <>
    I didn’t take this picture to show the food.<br /><br />
    I took it because, for a second, I realized—this is what it feels like to be safe.<br /><br />
    I don’t say it enough, but I love you. And I’m thankful every damn day.
  </>
)

export default function PicGameLove02RealCouple() {
  return (
    <FeelinkDisplay
      imageUrl="/images/picgamelove02realcouple.png"
      quotes={quotes}
      description={description}
    />
  )
}
