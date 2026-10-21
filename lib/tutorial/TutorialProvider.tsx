'use client'

import TutorialOverlay from '@/components/ui/TutorialOverlay'
import { TutorialContext, useTutorialController } from './useTutorial'

/** Pasang di app/layout.tsx, DI DALAM UIThemeProvider dan LanguageProvider. */
export default function TutorialProvider({ children }: { children: React.ReactNode }) {
  const tutorial = useTutorialController()
  return (
    <TutorialContext.Provider value={tutorial}>
      {children}
      <TutorialOverlay />
    </TutorialContext.Provider>
  )
}
