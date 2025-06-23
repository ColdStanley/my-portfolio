'use client'

import CardWrapper from './CardWrapper'
import MaskItem from './MaskItem'
import { MaskData } from '../page'

interface Props {
  imageList: string[]
  masks: MaskData[]
  deletableMode: boolean
  onUpdateMask: (id: number, updates: Partial<MaskData>) => void
  onDeleteMask: (id: number) => void
}

export default function ImageCanvas({
  imageList,
  masks,
  deletableMode,
  onUpdateMask,
  onDeleteMask,
}: Props) {
  return (
    <div className="relative w-full h-full">
      {/* 图片列表展示 */}
      <div className="space-y-6">
        {imageList.map((src, index) => (
          <CardWrapper key={index}>
            <img src={src} className="w-full object-contain" alt={`uploaded-${index}`} />
          </CardWrapper>
        ))}
      </div>

      {/* 所有遮罩统一渲染在上层 */}
      {masks
        .filter((m): m is MaskData => !!m && typeof m === 'object') // 防止空值或错误遮罩导致报错
        .map((mask) => (
          <MaskItem
            key={mask.id}
            mask={mask}
            deletableMode={deletableMode}
            onUpdate={onUpdateMask}
            onDelete={onDeleteMask}
          />
        ))}
    </div>
  )
}
