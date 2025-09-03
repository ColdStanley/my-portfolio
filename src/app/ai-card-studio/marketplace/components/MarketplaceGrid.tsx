'use client'

import { MarketplaceListItem } from '../../types'
import MarketplaceCard from './MarketplaceCard'

interface MarketplaceGridProps {
  items: MarketplaceListItem[]
  onPreview: (itemId: string) => void
}

export default function MarketplaceGrid({ items, onPreview }: MarketplaceGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map((item) => (
        <MarketplaceCard
          key={item.id}
          item={item}
          onPreview={() => onPreview(item.id)}
        />
      ))}
    </div>
  )
}