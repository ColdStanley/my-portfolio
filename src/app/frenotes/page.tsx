'use client'

import { useEffect, useState } from 'react'
import { FrenotesItem } from './types/frenotes'
import { fetchFrenotesData } from './utils/fetchFrenotesData'
import FrenotesHeader from './components/FrenotesHeader'
import FrenotesFilterPanel from './components/FrenotesFilterPanel'
import FrenotesContentMasonry from './components/FrenotesContentMasonry'

export default function FrenotesPage() {
  const [allItems, setAllItems] = useState<FrenotesItem[]>([])
  const [filteredItems, setFilteredItems] = useState<FrenotesItem[]>([])
  const [selectedMothertongue, setSelectedMothertongue] = useState<string | null>(null)
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      const data = await fetchFrenotesData()
      setAllItems(data)
      setFilteredItems(data)
    }
    loadData()
  }, [])

  useEffect(() => {
    const filtered = allItems.filter((item) => {
      const matchMother = selectedMothertongue ? item.mothertongue === selectedMothertongue : true
      const matchTopic = selectedTopic ? item.topic === selectedTopic : true
      const matchDiff = selectedDifficulty ? item.difficulty === selectedDifficulty : true
      return matchMother && matchTopic && matchDiff
    })
    setFilteredItems(filtered)
  }, [selectedMothertongue, selectedTopic, selectedDifficulty, allItems])

  return (
    <main className="max-w-7xl mx-auto px-4 py-10">
      <FrenotesHeader />
      <FrenotesFilterPanel
        allItems={allItems}
        selectedMothertongue={selectedMothertongue}
        selectedTopic={selectedTopic}
        selectedDifficulty={selectedDifficulty}
        onSelectMothertongue={setSelectedMothertongue}
        onSelectTopic={setSelectedTopic}
        onSelectDifficulty={setSelectedDifficulty}
      />
      <FrenotesContentMasonry items={filteredItems} />
    </main>
  )
}
