'use client'

import CardWrapper from './CardWrapper'
import MaskItem from './MaskItem'
import { MaskData } from '../page'
import Image from 'next/image'

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
          <div key={index} className="relative w-full aspect-video bg-gray-100 rounded-xl overflow-hidden shadow">
            <Image
              src={src}
              alt={`uploaded-${index}`}
              fill
              className="object-contain"
              sizes="100vw"
              placeholder="blur"
              blurDataURL="/placeholder.png" // 可用你已有图片作为占位符
            />
          </div>
        ))}
      </div>

      {/* 遮罩统一渲染在最上层 */}
      {masks.map((mask, idx) => (
        <MaskItem
          key={mask.id}
          mask={mask}
          label={`#${idx + 1}`}
          deletableMode={deletableMode}
          onUpdate={onUpdateMask}
          onDelete={onDeleteMask}
        />
      ))}
    </div>
  )
}
