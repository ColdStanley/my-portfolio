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

  return (
    <div className="min-h-screen px-4 py-8 space-y-6 bg-gray-50">
      <PicGameUploadHeader />
      <UploadFormRow quotes={quotes} setQuotes={setQuotes} />
      <QuoteSuggestionPanel onClickItem={handleInsertQuote} />
    </div>
  )
}
