import HomeCardsSection from "@/components/HomeCardsSection";
import HeroImageGrid from "../components/HeroImageGrid";


export default function HomePage() {
  return (
    <main className="min-h-screen bg-white pt-1">
      <HeroImageGrid /> 
      <hr className="my-8 border-t border-gray-200 max-w-6xl mx-auto" />
      <HomeCardsSection />
    </main>
  )
}
