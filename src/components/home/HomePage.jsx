import Seo from '../Seo.jsx'
import { getRoute } from '../../config/routes.js'
import HomeClosingCTA from './HomeClosingCTA.jsx'
import HomeHero from './HomeHero.jsx'
import PathwayOverview from './PathwayOverview.jsx'
import PrinciplesStrip from './PrinciplesStrip.jsx'
import ResearchOutputs from './ResearchOutputs.jsx'
import ResearchReality from './ResearchReality.jsx'
import SaturnCasePreview from './SaturnCasePreview.jsx'
import StartingPointCards from './StartingPointCards.jsx'
import './home.css'

export default function HomePage() {
  const route = getRoute('/')

  return (
    <>
      <Seo
        title={route.title}
        description={route.description}
        pathname={route.path}
      />
      <main id="main-content" className="home-page">
        <HomeHero />
        <StartingPointCards />
        <PathwayOverview />
        <ResearchReality />
        <SaturnCasePreview />
        <ResearchOutputs />
        <PrinciplesStrip />
        <HomeClosingCTA />
      </main>
    </>
  )
}
