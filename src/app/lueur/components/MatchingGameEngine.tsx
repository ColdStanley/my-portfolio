'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { HighlightItem } from '../types'
import FloatingCard from './FloatingCard'

interface MatchingGameEngineProps {
  data: HighlightItem[]
  isPlaying: boolean
}

export default function MatchingGameEngine({ data, isPlaying }: MatchingGameEngineProps) {
  const [selectedWord, setSelectedWord] = useState<string | null>(null)
  const [selectedNote, setSelectedNote] = useState<string | null>(null)
  const [matchedWords, setMatchedWords] = useState<Set<string>>(new Set())
  const [matchedNotes, setMatchedNotes] = useState<Set<string>>(new Set())
  const [errorPair, setErrorPair] = useState<{ word: string; note: string } | null>(null)

  // 打乱顺序（只在初次加载时生成）
  const shuffledWords = useMemo(() => {
    return [...data].sort(() => Math.random() - 0.5).map(item => item.word)
  }, [data])

  const shuffledNotes = useMemo(() => {
    return [...data].sort(() => Math.random() - 0.5).map(item => item.note)
  }, [data])

  useEffect(() => {
    if (!isPlaying) {
      setSelectedWord(null)
      setSelectedNote(null)
      setMatchedWords(new Set())
      setMatchedNotes(new Set())
      setErrorPair(null)
    }
  }, [isPlaying])

  useEffect(() => {
    if (selectedWord && selectedNote) {
      const match = data.find((item) => item.word === selectedWord && item.note === selectedNote)
      if (match) {
        setMatchedWords((prev) => new Set(prev).add(selectedWord))
        setMatchedNotes((prev) => new Set(prev).add(selectedNote))
      } else {
        setErrorPair({ word: selectedWord, note: selectedNote })
        setTimeout(() => setErrorPair(null), 800)
      }
      setSelectedWord(null)
      setSelectedNote(null)
    }
  }, [selectedWord, selectedNote, data])

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
      <div className="flex flex-col gap-y-6">
        {data.map((_, index) => {
          const word = shuffledWords[index]
          const note = shuffledNotes[index]
          if (matchedWords.has(word) || matchedNotes.has(note)) return null
          return (
            <div key={word + note} className="flex items-center justify-center gap-x-180">
              <FloatingCard
                text={word}
                type="word"
                isSelected={selectedWord === word}
                isError={errorPair?.word === word}
                onClick={() => setSelectedWord(word)}
              />
              <FloatingCard
                text={note}
                type="note"
                isSelected={selectedNote === note}
                isError={errorPair?.note === note}
                onClick={() => setSelectedNote(note)}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
