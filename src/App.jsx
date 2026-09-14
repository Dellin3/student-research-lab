import { useEffect, useRef } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import useSurfaceMotion from './hooks/useSurfaceMotion.js'
import HomePage from './components/home/HomePage.jsx'
import Footer from './components/layout/Footer.jsx'
import Header from './components/layout/Header.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import ResearchRecordPage from './pages/ResearchRecordPage.jsx'
import StartHerePage from './pages/StartHerePage.jsx'
import ResourcesPage from './pages/ResourcesPage.jsx'
import AccountPage from './pages/AccountPage.jsx'
import MyResearchPage from './pages/MyResearchPage.jsx'
import AccountProvider from './account/AccountProvider.jsx'
import { useAccount } from './account/AccountContext.js'
import { rootAuthReturnPath } from './account/authState.js'
import { LEGACY_REDIRECTS } from './config/routes.js'
import './App.css'
import './styles/core.css'
import './styles/research-hub.css'
import './styles/interiors.css'
import './styles/depth.css'
import './styles/two-goals.css'
import './styles/account.css'

export default function App() {
  return <AccountProvider><AppShell /></AccountProvider>
}
function AppShell() {
  const location = useLocation()
  const { pathname } = location
  const navigate = useNavigate()
  const account = useAccount()
  const shellRef = useRef(null)
  useSurfaceMotion(shellRef, pathname)
  useEffect(() => {
    const destination = rootAuthReturnPath(location, account.status)
    if (destination) navigate(destination, { replace: true })
  }, [location, account.status, navigate])
  return <div ref={shellRef} className={`site-shell${pathname === '/' ? '' : ' is-interior'}`} data-page={pathname.slice(1) || 'home'}>
    <a className="skip-link" href="#main-content">Skip to content</a><Header />
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/start-here" element={<StartHerePage />} />
      <Route path="/resources" element={<ResourcesPage />} />
      <Route path="/worksheet" element={<ResearchRecordPage />} />
      <Route path="/account" element={<AccountPage />} />
      <Route path="/my-research" element={<MyResearchPage />} />
      {Object.entries(LEGACY_REDIRECTS).map(([path, to]) => <Route key={path} path={path} element={<Navigate to={to} replace />} />)}
      <Route path="*" element={<NotFoundPage />} />
    </Routes><Footer />
  </div>
}
