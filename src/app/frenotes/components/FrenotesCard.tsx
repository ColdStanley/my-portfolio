// src/app/frenotes/components/FrenotesCard.tsx
'use client'

import React from 'react'
import { FrenotesItem } from '../types/frenotes'
import { motion } from 'framer-motion'
import { parseSentencePairs } from '../utils/parseSentencePairs'
import FrenotesHighlightedText from './FrenotesHighlightedText'; // 导入高亮组件

interface FrenotesCardProps {
  item: FrenotesItem
}

// 辅助函数：处理双语标签显示
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
  return map?.[value] || value?.charAt(0)?.toUpperCase() + value?.slice(1) || '';
}

export default function FrenotesCard({ item }: FrenotesCardProps) {
  if (!item) {
    console.warn("FrenotesCard received an undefined or null item prop.");
    return null;
  }

  const parsedSentencePairs = item.sentence_pairs ? parseSentencePairs(item.sentence_pairs) : []

  // tipContent 直接使用 item.note，不再进行核心表达的移除，因为高亮组件会处理
  const tipContent = item.note || null;


  return (
    <motion.div
      // 优化点1: 整体区块间距调整为更紧凑的 gap-1.5
      className="bg-white p-5 rounded-xl shadow-md border border-gray-100 flex flex-col gap-1.5"
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {/* 1. 句对 (sentence_pairs) - 主要学习材料 */}
      {parsedSentencePairs?.length > 0 && (
        // 优化点2: 减少底部外边距，从 mb-2 调整到 mb-1.5
        // 优化点3: 减少底部内边距，从 pb-3 调整到 pb-2.5
        <div className="border-b border-gray-200 pb-2.5 mb-1.5">
          <p className="text-base font-semibold text-gray-800 mb-1">学习材料 / 小新闻：</p>
          {/* 优化点4: 句对内部垂直间距调整为更紧凑的 space-y-0.5 */}
          <div className="space-y-0.5">
            {parsedSentencePairs.map(([original, translation], index) => (
              // 优化点5: 句对背景色调整为更浅的 bg-gray-100，增加一丝对比度但依然柔和
              <div key={index} className="bg-gray-100 p-2 rounded">
                <p className="text-sm text-gray-800 font-medium whitespace-normal overflow-visible break-words">
                  <FrenotesHighlightedText text={original} item={item} />
                </p>
                {translation && (
                  // 优化点6: 中文译文颜色调整为更浅的 text-gray-500，降低视觉突出度
                  <p className="text-sm text-gray-500 mt-1 whitespace-normal overflow-visible break-words">
                    <FrenotesHighlightedText text={translation} item={item} />
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. 核心表达 (Core Expressions) 及其对应的用法/解释 (expression_usage) 
          此部分已通过 FrenotesHighlightedText 集成，无需此处显示。*/}


      {/* 3. 可复用例句 (reusable_sentence1, reusable_sentence2) */}
      {(item.reusable_sentence1 || item.reusable_sentence2) && (
        // 优化点7: 减少垂直间距和内边距，从 space-y-1.5 pt-2 mt-2 调整
        <div className="space-y-1 border-t border-gray-100 pt-1.5 mt-1.5">
          <p className="text-base font-semibold text-gray-800">实践例句：</p>
          {item.reusable_sentence1 && (
            <p className="text-gray-700 italic whitespace-normal overflow-visible break-words">
              <FrenotesHighlightedText text={item.reusable_sentence1} item={item} />
            </p>
          )}
          {item.reusable_sentence2 && (
            <p className="text-gray-700 italic whitespace-normal overflow-visible break-words">
              <FrenotesHighlightedText text={item.reusable_sentence2} item={item} />
            </p>
          )}
        </div>
      )}

      {/* 4. 附加笔记或提示 (note 字段) */}
      {tipContent && (
        // 优化点8: 减少顶部内边距和外边距，从 pt-2 mt-2 调整
        <p className="text-sm text-gray-500 italic border-l-2 border-purple-200 pl-2 pt-1.5 mt-1.5 whitespace-normal overflow-visible break-words">
          <span className="font-semibold">提示：</span>
          <FrenotesHighlightedText text={tipContent} item={item} />
        </p>
      )}

      {/* 5. 上下文笔记 (context_note) */}
      {item.context_note && (
        // 优化点9: 减少顶部内边距和外边距，从 pt-2 mt-2 调整
        // 优化点10: 中文背景颜色调整为更浅的 text-gray-500，进一步降低视觉突出度
        <p className="text-xs text-gray-500 border-t border-dashed border-gray-200 pt-1.5 mt-1.5 whitespace-normal overflow-visible break-words">
          <span className="font-semibold">背景：</span>
          <FrenotesHighlightedText text={item.context_note} item={item} />
        </p>
      )}

      {/* 6. 分类标签 (topic, difficulty, emotion_or_tone) */}
      <div className="flex flex-wrap gap-1 mt-auto pt-1.5 border-t border-gray-100"> {/* 优化点11: 标签间距调整为更紧凑的 gap-1 */}
        {item?.topic && (
          // 优化点12: 标签背景色调整为更融合的 bg-gray-100，文本色 text-gray-600
          <span className="px-2.5 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full whitespace-normal overflow-visible break-words">
            {bilingualLabel(item.topic)}
          </span>
        )}
        {item?.difficulty && (
          // 优化点12: 标签背景色调整为更融合的 bg-gray-100，文本色 text-gray-600
          <span className="px-2.5 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full whitespace-normal overflow-visible break-words">
            {bilingualLabel(item.difficulty)}
          </span>
        )}
        {item?.emotion_or_tone && (
          // 优化点12: 标签背景色调整为更融合的 bg-gray-100，文本色 text-gray-600
          <span className="px-2.5 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full whitespace-normal overflow-visible break-words">
            {bilingualLabel(item.emotion_or_tone)}
          </span>
        )}
      </div>
    </motion.div>
  );
}
