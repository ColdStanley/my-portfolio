import IELTSHeader from './components/IELTSHeader'
import IELTSInteraction from './components/IELTSInteraction'

export default function IELTS7Page() {
  return (
    <main className="flex flex-col items-center justify-center gap-8 p-6 max-w-7xl mx-auto font-sans text-gray-800">
      <IELTSHeader />
      <IELTSInteraction />
    </main>
  )
}
