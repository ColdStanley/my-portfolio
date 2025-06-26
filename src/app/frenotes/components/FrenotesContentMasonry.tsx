// components/FrenotesContentMasonry.tsx
'use client'

import { FrenotesItem } from '../types/frenotes'
import FrenotesCard from './FrenotesCard'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react' // Import useState and useEffect for column management

interface Props {
  items: FrenotesItem[]
}

// Helper function to distribute items into columns for pseudo-masonry
const distributeItemsIntoColumns = (items: FrenotesItem[], numColumns: number) => {
  const columns: FrenotesItem[][] = Array.from({ length: numColumns }, () => []);
  
  // Simple round-robin distribution
  items.forEach((item, index) => {
    columns[index % numColumns].push(item);
  });

  return columns;
};


export default function FrenotesContentMasonry({ items }: Props) {
  const numColumns = 2; // Fixed number of columns
  const [columnItems, setColumnItems] = useState<FrenotesItem[][]>([]);

  useEffect(() => {
    // Filter out null/undefined items early before distribution
    const validItems = items.filter(item => item !== null && item !== undefined);
    setColumnItems(distributeItemsIntoColumns(validItems, numColumns));
  }, [items, numColumns]); // Re-distribute if items or numColumns change

  return (
    <motion.div
      className="p-6 border border-gray-200 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
      initial="hidden"
      animate="visible"
      variants={{
        visible: { transition: { staggerChildren: 0.08 } },
        hidden: {}
      }}
    >
      {/* This is the Flexbox container for the columns */}
      <div className="flex gap-6"> {/* Use flexbox to create columns */}
        {columnItems.map((column, colIndex) => (
          <div key={colIndex} className="flex flex-col gap-6 flex-1"> {/* Each column is a flex container */}
            {column.map(item => (
              <motion.div
                key={item.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="will-change-transform"
              >
                <FrenotesCard item={item} />
              </motion.div>
            ))}
          </div>
        ))}
      </div>
    </motion.div>
  )
}