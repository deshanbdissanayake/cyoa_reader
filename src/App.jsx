import { useState, useCallback } from 'react'
import { AppProvider } from './context/AppContext'
import BottomNav from './components/BottomNav'
import Home from './pages/Home'
import AddBook from './pages/AddBook'
import BookDetail from './pages/BookDetail'
import ActiveSession from './pages/ActiveSession'
import SessionHistory from './pages/SessionHistory'
import EndingsChecklist from './pages/EndingsChecklist'
import PathsMap from './pages/PathsMap'
import Settings from './pages/Settings'

// Pages that show the bottom nav
const NAV_PAGES = ['home', 'add-book', 'settings']

function Router() {
  const [page, setPage] = useState('home')
  const [params, setParams] = useState({})

  const navigate = useCallback((newPage, newParams = {}) => {
    setPage(newPage)
    setParams(newParams)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const showNav = NAV_PAGES.includes(page)

  return (
    <div className="max-w-lg mx-auto relative min-h-screen">
      <div key={`${page}-${JSON.stringify(params)}`} className="animate-fade-in">
        {page === 'home' && <Home navigate={navigate} />}
        {page === 'add-book' && <AddBook navigate={navigate} />}
        {page === 'book-detail' && <BookDetail navigate={navigate} params={params} />}
        {page === 'active-session' && <ActiveSession navigate={navigate} params={params} />}
        {page === 'session-history' && <SessionHistory navigate={navigate} params={params} />}
        {page === 'endings' && <EndingsChecklist navigate={navigate} params={params} />}
        {page === 'paths-map' && <PathsMap navigate={navigate} params={params} />}
        {page === 'settings' && <Settings navigate={navigate} />}
      </div>

      {showNav && <BottomNav currentPage={page} navigate={navigate} />}
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <Router />
    </AppProvider>
  )
}
