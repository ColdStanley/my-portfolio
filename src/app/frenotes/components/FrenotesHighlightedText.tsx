// src/app/frenotes/components/FrenotesHighlightedText.tsx
'use client'

import React, { useState } from 'react' // 引入 useState 来管理 Popover 的打开状态
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover' // 导入 shadcn/ui 的 Popover 组件
// 注意：如果您的 `shadcn/ui` 组件安装路径不同，请调整 `@/components/ui/popover` 的路径

// 定义 FrenotesItem 的精简类型，只包含高亮所需字段
interface HighlightableFrenotesItem {
  core_expression1?: string | null;
  core_expression2?: string | null;
  core_expression3?: string | null;
  expression_usage1?: string | null;
  expression_usage2?: string | null;
  expression_usage3?: string | null;
}

interface FrenotesHighlightedTextProps {
  text: string; // 需要处理的原始文本
  item: HighlightableFrenotesItem; // 包含 core_expression 和 expression_usage 的 item
}

// 辅助函数：解析高亮词汇（来自 core_expressionX）
function parseHighlightWords(item: HighlightableFrenotesItem): string[] {
  const words: string[] = [];
  if (item.core_expression1) words.push(item.core_expression1);
  if (item.core_expression2) words.push(item.core_expression2);
  if (item.core_expression3) words.push(item.core_expression3);
  // 按长度降序排序，确保长短词匹配的优先级
  return words.filter(Boolean).sort((a, b) => b.length - a.length);
}

// 辅助函数：解析解释笔记（来自 expression_usageX），并映射到 Record<string, string>
function parseNotes(item: HighlightableFrenotesItem): Record<string, string> {
  const result: Record<string, string> = {};
  if (item.core_expression1 && item.expression_usage1) {
    result[item.core_expression1.toLowerCase()] = item.expression_usage1;
  }
  if (item.core_expression2 && item.expression_usage2) {
    result[item.core_expression2.toLowerCase()] = item.expression_usage2;
  }
  if (item.core_expression3 && item.expression_usage3) {
    result[item.core_expression3.toLowerCase()] = item.expression_usage3;
  }
  return result;
}

// 辅助函数：将文本分割成普通文本和高亮段落
function buildSegments(text: string, highlightWords: string[], notesMap: Record<string, string>) {
  const ranges: { start: number; end: number; word: string }[] = [];

  // 确保 highlightWords 数组不为空
  if (!highlightWords || highlightWords.length === 0) {
    return [{ text }]; // 如果没有高亮词，直接返回原始文本段
  }

  highlightWords.forEach((word) => {
    // 使用 \b 确保匹配整个单词，gi 确保全局和不区分大小写
    const pattern = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}\\b`, 'gi');
    let match;
    while ((match = pattern.exec(text)) !== null) {
      // 检查当前匹配是否与已存在的范围重叠，如果重叠则跳过
      const isOverlapping = ranges.some(range =>
        (match!.index < range.end && match!.index + match![0].length > range.start) ||
        (range.start < match!.index + match![0].length && range.end > match!.index)
      );
      if (!isOverlapping) {
        ranges.push({ start: match.index, end: match.index + match[0].length, word: match[0] }); // store exact matched word
      }
    }
  });

  // 按起始位置排序
  ranges.sort((a, b) => a.start - b.start);

  const result: { text: string; highlight?: { word: string; note: string } }[] = [];
  let cursor = 0;

  for (const { start, end, word } of ranges) {
    // 添加高亮词之前的文本
    if (start > cursor) {
      result.push({ text: text.slice(cursor, start) });
    }
    // 添加高亮词及其解释
    // 确保 notesMap 的键也是小写
    result.push({ text: text.slice(start, end), highlight: { word, note: notesMap[word.toLowerCase()] || '' } }); 
    cursor = end;
  }

  // 添加最后一个高亮词之后的文本
  if (cursor < text.length) {
    result.push({ text: text.slice(cursor) });
  }

  return result;
}

// 主渲染函数：生成带有高亮和 Popover 的 React 元素
export default function FrenotesHighlightedText({ text, item }: FrenotesHighlightedTextProps) {
  const highlightWords = parseHighlightWords(item);
  const notesMap = parseNotes(item); // notesMap 将核心表达（小写）映射到解释

  const parts = buildSegments(text, highlightWords, notesMap);

  // 定义高亮词汇的样式
  const highlightClassName = `
    inline-block px-2 py-1 rounded-lg /* 基础框样式：内边距、适中圆角 */
    bg-purple-100/20 /* 背景色：浅紫色，20% 透明度 */
    text-purple-800 /* 文本颜色：深紫色 */
    backdrop-blur-xs /* 核心透明效果：更小的模糊程度，更自然 */
    shadow-sm /* 默认小阴影，减少突兀感 */
    cursor-pointer /* 鼠标悬停时显示手形光标 */
    transition-all duration-200 ease-in-out /* 平滑过渡 */

    /* 悬停动效 (桌面端) */
    hover:bg-purple-200/30 /* 悬停时背景色略微加深，透明度也略增 */
    hover:shadow-md /* 悬停时阴影变大一点，增加微弱立体感 */
    hover:scale-[1.005] /* 悬停时非常轻微地放大 */
  `;

  // Popover 内容的样式
  const popoverContentClassName = `
    w-64 p-4 text-sm text-gray-700
    bg-white/90 /* 90% 不透明白色 */
    backdrop-blur-md /* 磨砂玻璃效果 */
    shadow-lg /* 更大更柔和的阴影 */
    border border-purple-200 rounded-xl /* 边框与圆角 */
    
    /* shadcn/ui (Radix UI) 默认的动效类 */
    data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95
    data-[state=open]:slide-in-from-top-2
    data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95
    data-[state=closed]:slide-out-to-top-2
  `;

  return (
    <>
      {parts.map((part, i) => {
        if (!part.highlight) {
          // 普通文本，直接渲染
          return <span key={i}>{part.text}</span>;
        }

        const { word, note } = part.highlight;
        // 使用 useState 来控制 Popover 的打开状态
        const [isOpen, setIsOpen] = useState(false);

        // 鼠标悬停延迟打开和立即关闭的定时器 ID
        const openTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
        const closeTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

        const handleMouseEnter = () => {
          if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current); // 清除可能存在的关闭定时器
            closeTimeoutRef.current = null;
          }
          if (!openTimeoutRef.current) {
            openTimeoutRef.current = setTimeout(() => {
              setIsOpen(true);
              openTimeoutRef.current = null;
            }, 200); // 200ms 延迟打开
          }
        };

        const handleMouseLeave = () => {
          if (openTimeoutRef.current) {
            clearTimeout(openTimeoutRef.current); // 清除可能存在的打开定时器
            openTimeoutRef.current = null;
          }
          // 可以设置一个很小的延迟关闭，以防鼠标快速移出移入
          if (!closeTimeoutRef.current) {
             closeTimeoutRef.current = setTimeout(() => {
                setIsOpen(false);
                closeTimeoutRef.current = null;
             }, 50); // 50ms 延迟关闭，防止闪烁
          }
        };

        return (
          // 使用 shadcn/ui 的 Popover 组件
          <Popover key={i} open={isOpen} onOpenChange={setIsOpen}> {/* 绑定打开状态 */}
            <PopoverTrigger asChild>
              <span
                className={highlightClassName}
                onMouseEnter={handleMouseEnter} // 鼠标进入时触发
                onMouseLeave={handleMouseLeave} // 鼠标离开时触发
              >
                {part.text}
              </span>
            </PopoverTrigger>
            <PopoverContent
              side="top"
              className={popoverContentClassName}
              // 确保鼠标在 Popover 内容上时不会关闭
              onMouseEnter={handleMouseEnter} 
              onMouseLeave={handleMouseLeave}
            >
              <p className="text-purple-700 font-semibold mb-2">🧠 {word}</p>
              {/* 使用 whitespace-pre-wrap 确保换行符能够显示 */}
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                {note}
              </p>
            </PopoverContent>
          </Popover>
        );
      })}
    </>
  );
}
