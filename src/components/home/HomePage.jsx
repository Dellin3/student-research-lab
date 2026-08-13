import { useState } from 'react'
import Seo from '../Seo.jsx'
import { getRoute } from '../../config/routes.js'
import HomeClosingCTA from './HomeClosingCTA.jsx'
import HomeHero from './HomeHero.jsx'
import PathwayOverview from './PathwayOverview.jsx'
import PrinciplesStrip from './PrinciplesStrip.jsx'
import ResearchAcrossFields from './ResearchAcrossFields.jsx'
import ResearchOutputs from './ResearchOutputs.jsx'
import ResearchReality from './ResearchReality.jsx'
import StartingPointCards from './StartingPointCards.jsx'
import './home.css'

export default function HomePage() {
  const route = getRoute('/')
  const [stuckAt, setStuckAt] = useState('direction')

  return (
    <>
      <Seo
        title={route.title}
        description={route.description}
        pathname={route.path}
      />
      <main id="main-content" className="home-page">
        <HomeHero stuckAt={stuckAt} onStuckChange={setStuckAt} />
        <PathwayOverview key={stuckAt} recommendedStage={stuckAt} />
        <StartingPointCards />
        <ResearchReality />
        <ResearchAcrossFields />
        <ResearchOutputs />
        <PrinciplesStrip />
        <HomeClosingCTA />
      </main>
    </>
  )
}
