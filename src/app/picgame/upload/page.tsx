'use client'

import { useState } from 'react'
import PicGameUploadHeader from '@/components/picgame/picgame-upload/PicGameUploadHeader'
import UploadFormRow from '@/components/picgame/picgame-upload/UploadFormRow'
import QuoteSuggestionPanel from '@/components/picgame/picgame-upload/QuoteSuggestionPanel'

export default function PicGameUploadPage() {
  const [quotes, setQuotes] = useState('')

  const handleInsertQuote = (text: string) => {
    setQuotes(prev => (prev ? prev + '\n' + text : text))
  }

  const love = [
    "I've had feelings for you for so long but never said a word.",
    "Meeting you is the luckiest thing that's ever happened to me.",
    "If I could do it all over again, I'd still choose you.",
    "I want to walk through the rest of my life with you.",
    "Your smile finds its way into my dreams.",
    "Every time our eyes meet, I get nervous—and hopeful.",
    "Every message I send is just me waiting for your reply.",
  ]

  const apology = [
    "I'm truly sorry—I never meant to hurt you.",
    "You shouldn't have had to carry that alone. I’m sorry.",
    "I regret it all and I wish I could make it right.",
    "Would you please give me one more chance?",
    "Your forgiveness would mean the world to me.",
    "Just because I didn’t say it, doesn’t mean I didn’t care.",
    "I'm not perfect, but I’m trying to be better.",
  ]

  const blessing = [
    "May your heart always find its light, and your eyes their wonder.",
    "May your path be long—but never lonely.",
    "May your biggest dreams never be wasted.",
    "May kindness always find you first.",
    "Wishing you peace, joy, and everything in between.",
    "May you never be betrayed—or have to shrink yourself again.",
  ]

  const thanks = [
    "Thank you for always being there.",
    "Thanks for everything you’ve done quietly behind the scenes.",
    "Thank you for your patience and understanding.",
    "Grateful for your patience—even when I’m hard to deal with.",
    "Thank you for never giving up on me.",
    "You complete my world—thank you.",
    "Thank you for stepping into my life.",
  ]

  // ✅ 修复按钮功能
  const onInsertFromCategory = (category: 'love' | 'apology' | 'blessing' | 'thanks') => {
    const map = { love, apology, blessing, thanks }
    const selected = [...map[category]].sort(() => 0.5 - Math.random()).slice(0, 5)
    setQuotes(prev => (prev ? prev + '\n' + selected.join('\n') : selected.join('\n')))
  }

  return (
    <div className="min-h-screen px-4 py-8 space-y-6 bg-gray-50">
      <PicGameUploadHeader />
      <UploadFormRow
        quotes={quotes}
        setQuotes={setQuotes}
        onInsertFromCategory={onInsertFromCategory}
      />
      <QuoteSuggestionPanel
        love={love}
        apology={apology}
        blessing={blessing}
        thanks={thanks}
        onClickItem={handleInsertQuote}
      />
    </div>
  )
}
