import { Route, Routes, useLocation } from 'react-router-dom'
import HomePage from './components/home/HomePage.jsx'
import Footer from './components/layout/Footer.jsx'
import Header from './components/layout/Header.jsx'
import AiLiteraturePage from './pages/AiLiteraturePage.jsx'
import BuildProjectPage from './pages/BuildProjectPage.jsx'
import CaseStudiesPage from './pages/CaseStudiesPage.jsx'
import FindDirectionPage from './pages/FindDirectionPage.jsx'
import LearnHubPage from './pages/LearnHubPage.jsx'
import InvestigationPlannerPage from './pages/InvestigationPlannerPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import OutreachPage from './pages/OutreachPage.jsx'
import ResearchRecordPage from './pages/ResearchRecordPage.jsx'
import ResearchQuestionBuilderPage from './pages/ResearchQuestionBuilderPage.jsx'
import StartHerePage from './pages/StartHerePage.jsx'
import TopicNarrowingPage from './pages/TopicNarrowingPage.jsx'
import ToolsHubPage from './pages/ToolsHubPage.jsx'
import WorkflowPage from './pages/WorkflowPage.jsx'
import ResourcesPage from './pages/ResourcesPage.jsx'
import './App.css'
import './styles/core.css'
import './styles/research-hub.css'
import './styles/interiors.css'

export default function App() {
  const { pathname } = useLocation()
  return (
    <div className={`site-shell${pathname === '/' ? '' : ' is-interior'}`} data-page={pathname.slice(1) || 'home'}>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/start-here" element={<StartHerePage />} />
        <Route path="/learn" element={<LearnHubPage />} />
        <Route path="/tools" element={<ToolsHubPage />} />
        <Route path="/resources" element={<ResourcesPage />} />
        <Route path="/topic-narrowing" element={<TopicNarrowingPage />} />
        <Route path="/find-a-direction" element={<FindDirectionPage />} />
        <Route path="/research-workflow" element={<WorkflowPage />} />
        <Route path="/research-question-builder" element={<ResearchQuestionBuilderPage />} />
        <Route path="/investigation-planner" element={<InvestigationPlannerPage />} />
        <Route path="/ai-literature" element={<AiLiteraturePage />} />
        <Route path="/build-a-project" element={<BuildProjectPage />} />
        <Route path="/outreach" element={<OutreachPage />} />
        <Route path="/worksheet" element={<ResearchRecordPage />} />
        <Route path="/case-studies" element={<CaseStudiesPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Footer />
    </div>
  )
}
