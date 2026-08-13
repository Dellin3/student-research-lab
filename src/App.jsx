import { Route, Routes } from 'react-router-dom'
import HomePage from './components/home/HomePage.jsx'
import Footer from './components/layout/Footer.jsx'
import Header from './components/layout/Header.jsx'
import AiLiteraturePage from './pages/AiLiteraturePage.jsx'
import BuildProjectPage from './pages/BuildProjectPage.jsx'
import CaseStudiesPage from './pages/CaseStudiesPage.jsx'
import FindDirectionPage from './pages/FindDirectionPage.jsx'
import LearnHubPage from './pages/LearnHubPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import OutreachPage from './pages/OutreachPage.jsx'
import ResearchRecordPage from './pages/ResearchRecordPage.jsx'
import ResearchQuestionBuilderPage from './pages/ResearchQuestionBuilderPage.jsx'
import StartHerePage from './pages/StartHerePage.jsx'
import TopicNarrowingPage from './pages/TopicNarrowingPage.jsx'
import ToolsHubPage from './pages/ToolsHubPage.jsx'
import WorkflowPage from './pages/WorkflowPage.jsx'
import './App.css'

export default function App() {
  return (
    <div className="site-shell">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/start-here" element={<StartHerePage />} />
        <Route path="/learn" element={<LearnHubPage />} />
        <Route path="/tools" element={<ToolsHubPage />} />
        <Route path="/topic-narrowing" element={<TopicNarrowingPage />} />
        <Route path="/find-a-direction" element={<FindDirectionPage />} />
        <Route path="/research-workflow" element={<WorkflowPage />} />
        <Route path="/research-question-builder" element={<ResearchQuestionBuilderPage />} />
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
