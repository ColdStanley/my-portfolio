// src/app/frenotes/components/FrenotesCard.tsx
'use client'

import React from 'react'
import { FrenotesItem } from '../types/frenotes'
import { motion } from 'framer-motion'
import { parseSentencePairs } from '../utils/parseSentencePairs'
import FrenotesHighlightedText from './FrenotesHighlightedText'

interface FrenotesCardProps {
  item: FrenotesItem
}

const bilingualLabel = (value: string): string => {
  const map: Record<string, string> = {
    health: 'Health / Santé',
    politics: 'Politics / Politique',
    education: 'Education / Éducation',
    medium: 'Medium / Moyen',
    hard: 'Hard / Difficile',
    neutral: 'Neutral / 中性',
    informative: 'Informative / 信息性',
  }
  return map?.[value] || value?.charAt(0)?.toUpperCase() + value?.slice(1) || ''
}

export default function FrenotesCard({ item }: FrenotesCardProps) {
  if (!item) {
    console.warn("FrenotesCard received an undefined or null item prop.")
    return null
  }

  const parsedSentencePairs = item.sentence_pairs ? parseSentencePairs(item.sentence_pairs) : []
  const tipContent = item.note || null

  return (
    <motion.div
      className="bg-zinc-50 p-5 rounded-xl shadow-md border border-purple-100 flex flex-col gap-2"
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {/* Title（新增） */}
      {item.title && (
        <h2 className="text-lg font-bold text-center text-purple-800 mb-1">
          {item.title}
        </h2>
      )}

      {/* 1. 句对 */}
      {parsedSentencePairs?.length > 0 && (
        <div className="border-b border-gray-200 pb-2.5 mb-1.5">
          <div className="space-y-1">
            {parsedSentencePairs.map(([original, translation], index) => (
              <div key={index} className="p-3 pl-4 bg-white border-l-4 border-purple-200 rounded shadow-sm">
                <p className="text-base text-gray-800 font-medium whitespace-normal overflow-visible break-words leading-relaxed">
                  <FrenotesHighlightedText text={original} item={item} />
                </p>
                {translation && (
                  <p className="text-sm text-gray-500 mt-1 whitespace-normal overflow-visible break-words leading-relaxed">
                    <FrenotesHighlightedText text={translation} item={item} />
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. 可复用例句 */}
      {(item.reusable_sentence1 || item.reusable_sentence2) && (
        <div className="space-y-1.5 border-t border-gray-100 pt-1.5 mt-1.5">
          <p className="text-base font-semibold text-gray-800">Practical Sentences</p>
          {item.reusable_sentence1 && (
            <p className="text-[15px] text-gray-700 italic leading-relaxed whitespace-normal overflow-visible break-words">
              {item.reusable_sentence1}
            </p>
          )}
          {item.reusable_sentence2 && (
            <p className="text-[15px] text-gray-700 italic leading-relaxed whitespace-normal overflow-visible break-words">
              {item.reusable_sentence2}
            </p>
          )}
        </div>
      )}

      {/* 3. 附加提示 */}
      {tipContent && (
        <p className="text-sm text-gray-500 italic border-l-2 border-purple-200 pl-2 pt-1.5 mt-2 whitespace-pre-line overflow-visible break-words leading-relaxed">
          {tipContent}
        </p>
      )}

      {/* 4. 背景笔记 */}
      {item.context_note && (
        <p className="text-xs text-gray-500 border-t border-dashed border-gray-200 pt-1.5 mt-1.5 whitespace-normal overflow-visible break-words leading-relaxed">
          <span className="font-semibold">Background:</span>
          {item.context_note}
        </p>
      )}

      {/* 5. 标签 */}
      <div className="flex flex-wrap gap-1 mt-auto pt-1.5 border-t border-gray-100">
        {item?.topic && (
          <span className="px-2.5 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full whitespace-normal overflow-visible break-words">
            {bilingualLabel(item.topic)}
          </span>
        )}
        {item?.difficulty && (
          <span className="px-2.5 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full whitespace-normal overflow-visible break-words">
            {bilingualLabel(item.difficulty)}
          </span>
        )}
        {item?.emotion_or_tone && (
          <span className="px-2.5 py-0.5 bg-sky-100 text-sky-700 text-xs font-medium rounded-full whitespace-normal overflow-visible break-words">
            {bilingualLabel(item.emotion_or_tone)}
          </span>
        )}
        {item?.source && (
          <span className="px-2.5 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full whitespace-normal overflow-visible break-words">
            {item.source}
          </span>
        )}
      </div>
    </motion.div>
  )
}
