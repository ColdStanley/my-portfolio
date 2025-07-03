// components/SpeakingBoosterPlanView.tsx
'use client'

import BoosterInputPanel from './BoosterInputPanel'
import BoosterSpeakingGoalPanel from './BoosterSpeakingGoalPanel'
import BoosterSpeakingKeyPointPanel from './BoosterSpeakingKeyPointPanel'
import BoosterSpeakingPlanCardList from './BoosterSpeakingPlanCardList'

export default function SpeakingBoosterPlanView() {
  return (
    <div className="w-full space-y-12 text-base">
      <BoosterInputPanel />
      <BoosterSpeakingGoalPanel />
      <BoosterSpeakingKeyPointPanel />
      <BoosterSpeakingPlanCardList />
    </div>
  )
}
