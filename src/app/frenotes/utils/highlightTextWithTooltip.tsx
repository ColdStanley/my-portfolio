    // src/app/frenotes/utils/highlightTextWithTooltip.tsx
    'use client';

    import React, { useRef } from 'react';
    // 导入 @floating-ui/react-dom 提供的核心 Hooks
    import {
      useTooltip, // <-- 从 @floating-ui/react-dom 导入
      useHover,   // <-- 从 @floating-ui/react-dom 导入
      useFocus,   // <-- 从 @floating-ui/react-dom 导入
      useInteractions, // <-- 从 @floating-ui/react-dom 导入
      arrow,      // <-- 从 @floating-ui/react-dom 导入
      offset,     // <-- 从 @floating-ui/react-dom 导入
      shift,      // <-- 从 @floating-ui/react-dom 导入
      autoPlacement // <-- 从 @floating-ui/react-dom 导入
    } from '@floating-ui/react-dom'; // <-- 注意这里是 @floating-ui/react-dom

    // 导入 @floating-ui/react 提供的组件
    import {
      FloatingPortal,
      FloatingArrow
    } from '@floating-ui/react'; // <-- 注意这里是 @floating-ui/react

    // 定义 HighlightedText 组件的属性接口
    interface HighlightedTextProps {
      text: string;
      highlightWords: string[];
      tooltips: Record<string, string>;
    }

    // 独立的 TooltipWrapper 组件，用于管理单个 Tooltip 的逻辑
    interface TooltipWrapperProps {
        children: React.ReactNode;
        content: string;
    }

    const TooltipWrapper: React.FC<TooltipWrapperProps> = ({ children, content }) => {
        const arrowRef = useRef(null);

        const { refs, floatingStyles, context } = useTooltip({
            placement: 'top',
            open: false,
            middleware: [
                offset(8),
                shift({ padding: 10 }),
                arrow({ element: arrowRef }),
                autoPlacement({
                    crossAxis: false,
                    alignment: null,
                    allowedPlacements: ['top', 'bottom', 'left', 'right']
                })
            ],
            onOpenChange: (open) => {
                if (open) {
                    setTimeout(() => context.onOpenChange(true), 100);
                } else {
                    context.onOpenChange(false);
                }
            },
        });

        const hover = useHover(context, { delay: { open: 100, close: 0 } });
        const focus = useFocus(context);

        const { getReferenceProps, getFloatingProps } = useInteractions([
            hover,
            focus,
        ]);

        const isOpen = context.open;

        return (
            <>
                {React.cloneElement(children as React.ReactElement, getReferenceProps({ ref: refs.setReference }))}

                <FloatingPortal>
                    {isOpen && (
                        <div
                            ref={refs.setFloating}
                            style={floatingStyles}
                            className="frenotes-custom-tooltip"
                            {...getFloatingProps()}
                        >
                            {content}
                            <FloatingArrow ref={arrowRef} context={context} className="floating-arrow" />
                        </div>
                    )}
                </FloatingPortal>
            </>
        );
    };

    /**
     * React 组件，用于在给定文本中高亮指定词汇，并在鼠标悬停时显示自定义的 Tooltip 浮窗。
     * 浮窗样式：磨砂玻璃效果，微滑动 + 淡入动画。
     * 鼠标光标：变为 pointer。
     */
    const HighlightedText: React.FC<HighlightedTextProps> = ({ text, highlightWords, tooltips }) => {
      if (!text) {
        return null;
      }

      const customStyles = `
        /* 自定义 Frenotes Tooltip 样式 */
        .frenotes-custom-tooltip {
          background-color: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          border-radius: 0.5rem;
          border: 1px solid rgba(229, 231, 235, 0.5);
          color: #374151;
          font-size: 0.875rem;
          line-height: 1.5;
          padding: 0.75rem 1rem;
          max-width: 240px;
          text-align: left;
          opacity: 0;
          transition: opacity 0.2s ease-out, transform 0.2s ease-out;
        }

        .frenotes-custom-tooltip[data-state="open"] {
            opacity: 1;
            transform: translateY(0);
        }
        .frenotes-custom-tooltip[data-placement^="bottom"] {
            transform: translateY(5px);
        }
        .frenotes-custom-tooltip[data-placement^="top"] {
            transform: translateY(-5px);
        }
        .frenotes-custom-tooltip[data-placement^="left"] {
            transform: translateX(5px);
        }
        .frenotes-custom-tooltip[data-placement^="right"] {
            transform: translateX(-5px);
        }

        .frenotes-custom-tooltip .floating-arrow {
          fill: rgba(255, 255, 255, 0.9);
          filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.05));
        }

        .highlighted-word-cursor {
            cursor: pointer !important;
        }
      `;

      const sortedHighlightWords = [...highlightWords].sort((a, b) => b.length - a.length);

      let resultNodes: (string | JSX.Element)[] = [text]; 

      sortedHighlightWords.forEach(word => {
        const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${escapedWord})`, 'gi');
        
        let nextNodes: (string | JSX.Element)[] = [];

        resultNodes.forEach((node, nodeIndex) => {
          if (typeof node === 'string') {
            let lastIndex = 0;
            let match;
            const tempParts: (string | JSX.Element)[] = [];

            while ((match = regex.exec(node)) !== null) {
              if (match.index > lastIndex) {
                tempParts.push(node.substring(lastIndex, match.index));
              }
              const matchedText = match[0]; 
              tempParts.push(
                <TooltipWrapper 
                    key={`${matchedText}-${match.index}-${nodeIndex}-${Math.random().toString(36).substring(7)}`}
                    content={tooltips?.[matchedText.toLowerCase()] || '无解释'}
                >
                    <span
                      className="inline-block px-1 rounded-md bg-purple-100 text-purple-700 
                                 font-semibold transition-colors duration-200 
                                 hover:bg-purple-200 highlighted-word-cursor"
                    >
                      {matchedText}
                    </span>
                </TooltipWrapper>
              );
              lastIndex = regex.lastIndex;
            }

            if (lastIndex < node.length) {
              tempParts.push(node.substring(lastIndex));
            }
            nextNodes = nextNodes.concat(tempParts);
          } else {
            nextNodes.push(node);
          }
        });
        resultNodes = nextNodes;
      });

      return (
        <>
          <style>{customStyles}</style>
          {resultNodes}
        </>
      );
    };

    export default HighlightedText;
    