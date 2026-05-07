import { createContext, useContext, useCallback } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { createBook, createSession, createDecision, generateId } from '../store/dataStore'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [books, setBooks] = useLocalStorage('pathtracker_books', [])
  const [sessions, setSessions] = useLocalStorage('pathtracker_sessions', [])
  const [endings, setEndings] = useLocalStorage('pathtracker_endings', {})
  // endings shape: { [bookId]: { [endingNumber]: { found: bool, sessionId, foundAt } } }

  // --- Books ---
  const addBook = useCallback((data) => {
    const book = createBook(data)
    setBooks(prev => [book, ...prev])
    // Initialize endings tracker
    if (data.totalEndings > 0) {
      const endingMap = {}
      for (let i = 1; i <= data.totalEndings; i++) {
        endingMap[i] = { found: false, sessionId: null, foundAt: null }
      }
      setEndings(prev => ({ ...prev, [book.id]: endingMap }))
    }
    return book
  }, [setBooks, setEndings])

  const deleteBook = useCallback((bookId) => {
    setBooks(prev => prev.filter(b => b.id !== bookId))
    setSessions(prev => prev.filter(s => s.bookId !== bookId))
    setEndings(prev => {
      const next = { ...prev }
      delete next[bookId]
      return next
    })
  }, [setBooks, setSessions, setEndings])

  const updateBook = useCallback((bookId, data) => {
    setBooks(prev => prev.map(b => b.id === bookId ? { ...b, ...data } : b))
  }, [setBooks])

  // --- Sessions ---
  const startSession = useCallback((bookId, name, startPage = 1) => {
    const id = generateId()
    setSessions(prev => {
      const bookSessionCount = prev.filter(s => s.bookId === bookId).length
      const session = createSession(bookId, name, bookSessionCount + 1, startPage)
      return [{ ...session, id }, ...prev]
    })
    return { id }
  }, [setSessions])

  const updateSession = useCallback((sessionId, data) => {
    setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, ...data } : s))
  }, [setSessions])

  const completeSession = useCallback((sessionId, endingNumber) => {
    setSessions(prev => {
      const session = prev.find(s => s.id === sessionId)
      if (endingNumber && session) {
        setEndings(prevEndings => {
          const bookEndings = prevEndings[session.bookId] || {}
          if (bookEndings[endingNumber]?.found) return prevEndings
          return {
            ...prevEndings,
            [session.bookId]: {
              ...bookEndings,
              [endingNumber]: { found: true, sessionId, foundAt: new Date().toISOString() },
            },
          }
        })
      }
      return prev.map(s =>
        s.id === sessionId
          ? { ...s, isComplete: true, endedAt: new Date().toISOString(), endingFound: endingNumber || null }
          : s
      )
    })
  }, [setSessions, setEndings])

  const deleteSession = useCallback((sessionId) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId))
  }, [setSessions])

  const addDecision = useCallback((sessionId, decisionData) => {
    const decision = createDecision(decisionData)
    setSessions(prev => prev.map(s =>
      s.id === sessionId
        ? { ...s, decisions: [...s.decisions, decision], currentPage: decisionData.toPage }
        : s
    ))
    return decision
  }, [setSessions])

  const removeDecision = useCallback((sessionId, decisionId) => {
    setSessions(prev => prev.map(s => {
      if (s.id !== sessionId) return s
      const decisions = s.decisions.filter(d => d.id !== decisionId)
      const lastDecision = decisions[decisions.length - 1]
      return {
        ...s,
        decisions,
        currentPage: lastDecision ? lastDecision.toPage : 1,
      }
    }))
  }, [setSessions])

  const updateSessionNotes = useCallback((sessionId, notes) => {
    setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, notes } : s))
  }, [setSessions])

  const updateCurrentPage = useCallback((sessionId, page) => {
    setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, currentPage: Number(page) } : s))
  }, [setSessions])

  // --- Endings ---
  const toggleEnding = useCallback((bookId, endingNumber, sessionId) => {
    setEndings(prev => {
      const bookEndings = prev[bookId] || {}
      const current = bookEndings[endingNumber] || { found: false }
      return {
        ...prev,
        [bookId]: {
          ...bookEndings,
          [endingNumber]: current.found
            ? { found: false, sessionId: null, foundAt: null }
            : { found: true, sessionId: sessionId || null, foundAt: new Date().toISOString() },
        },
      }
    })
  }, [setEndings])

  // --- Data management ---
  const exportData = useCallback(() => {
    const data = { books, sessions, endings, exportedAt: new Date().toISOString(), version: 1 }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pathtracker-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [books, sessions, endings])

  const importData = useCallback((jsonData) => {
    try {
      const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData
      if (data.books) setBooks(data.books)
      if (data.sessions) setSessions(data.sessions)
      if (data.endings) setEndings(data.endings)
      return true
    } catch {
      return false
    }
  }, [setBooks, setSessions, setEndings])

  const clearAllData = useCallback(() => {
    setBooks([])
    setSessions([])
    setEndings({})
  }, [setBooks, setSessions, setEndings])

  // --- Computed helpers ---
  const getBookSessions = useCallback((bookId) =>
    sessions.filter(s => s.bookId === bookId).sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt)),
    [sessions])

  const getBookEndings = useCallback((bookId) => endings[bookId] || {}, [endings])

  const getEndingsFoundCount = useCallback((bookId) => {
    const bookEndings = endings[bookId] || {}
    return Object.values(bookEndings).filter(e => e.found).length
  }, [endings])

  const getActiveSession = useCallback((bookId) =>
    sessions.find(s => s.bookId === bookId && !s.isComplete),
    [sessions])

  const value = {
    books,
    sessions,
    endings,
    addBook,
    deleteBook,
    updateBook,
    startSession,
    updateSession,
    completeSession,
    deleteSession,
    addDecision,
    removeDecision,
    updateSessionNotes,
    updateCurrentPage,
    toggleEnding,
    exportData,
    importData,
    clearAllData,
    getBookSessions,
    getBookEndings,
    getEndingsFoundCount,
    getActiveSession,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
