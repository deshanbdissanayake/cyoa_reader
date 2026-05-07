import { useState } from 'react'
import { ChevronLeft, Play, Clock, CheckSquare, Trash2, Plus, MapPin, GitBranch } from 'lucide-react'
import { useApp } from '../context/AppContext'
import ProgressRing from '../components/ProgressRing'
import EmptyState from '../components/EmptyState'
import Modal from '../components/Modal'

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function SessionRow({ session, onView, onDelete }) {
  return (
    <div className="card animate-fade-in">
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-stone-800 text-sm truncate">{session.name}</span>
              {!session.isComplete && (
                <span className="shrink-0 text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full px-2 py-0.5 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  Active
                </span>
              )}
            </div>
            <p className="text-xs text-stone-400 mt-0.5">{formatDate(session.startedAt)}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-xs text-stone-500 flex items-center gap-1">
                <MapPin size={11} />
                {session.decisions.length} {session.decisions.length === 1 ? 'decision' : 'decisions'}
              </span>
              {session.endingFound && (
                <span className="text-xs text-amber-700 font-medium">Ending #{session.endingFound}</span>
              )}
              {session.isComplete && !session.endingFound && (
                <span className="text-xs text-stone-400">Completed</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onView(session)}
              className="btn-secondary py-2 px-3 text-xs"
            >
              {session.isComplete ? 'View' : 'Continue'}
            </button>
            <button
              onClick={() => onDelete(session.id)}
              className="w-9 h-9 flex items-center justify-center rounded-xl text-stone-400 active:scale-95 transition-all"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function BookDetail({ navigate, params }) {
  const { books, getBookSessions, getEndingsFoundCount, getActiveSession, startSession, deleteSession, deleteBook } = useApp()
  const book = books.find(b => b.id === params?.bookId)

  const [showNewSession, setShowNewSession] = useState(false)
  const [sessionName, setSessionName] = useState('')
  const [showDeleteBook, setShowDeleteBook] = useState(false)
  const [deleteSessionId, setDeleteSessionId] = useState(null)

  if (!book) {
    return (
      <div className="page-container flex items-center justify-center">
        <EmptyState emoji="📕" title="Book not found" description="This book may have been deleted." />
      </div>
    )
  }

  const sessions = getBookSessions(book.id)
  const foundCount = getEndingsFoundCount(book.id)
  const activeSession = getActiveSession(book.id)
  const completedSessions = sessions.filter(s => s.isComplete)
  const pct = book.totalEndings > 0 ? Math.round((foundCount / book.totalEndings) * 100) : 0

  const handleStartSession = () => {
    const session = startSession(book.id, sessionName.trim() || undefined)
    setShowNewSession(false)
    setSessionName('')
    navigate('active-session', { bookId: book.id, sessionId: session.id })
  }

  const handleViewSession = (session) => {
    if (session.isComplete) {
      navigate('session-history', { bookId: book.id, sessionId: session.id })
    } else {
      navigate('active-session', { bookId: book.id, sessionId: session.id })
    }
  }

  const handleDeleteBook = () => {
    deleteBook(book.id)
    navigate('home')
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('home')}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-amber-100 text-stone-600 active:scale-95 transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => setShowDeleteBook(true)}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-stone-400 active:scale-95 transition-all"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="px-4 pt-4 flex flex-col gap-5">
        {/* Book hero */}
        <div className="card overflow-visible">
          <div className="h-1.5 w-full rounded-t-2xl" style={{ backgroundColor: book.coverColor }} />
          <div className="p-5">
            <div className="flex items-start gap-4">
              <div
                className="w-16 h-22 rounded-xl flex items-center justify-center text-3xl shadow-md shrink-0"
                style={{ backgroundColor: book.coverColor + '22', border: `2px solid ${book.coverColor}44` }}
              >
                {book.coverEmoji}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold text-stone-800 leading-tight">{book.title}</h1>
                {book.author && <p className="text-sm text-stone-500 mt-1">{book.author}</p>}
                {book.totalPages > 0 && (
                  <p className="text-xs text-stone-400 mt-1">{book.totalPages} pages</p>
                )}
              </div>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-4 mt-5 pt-4 border-t border-amber-100">
              {book.totalEndings > 0 && (
                <div className="flex items-center gap-3">
                  <ProgressRing
                    value={foundCount}
                    max={book.totalEndings}
                    size={64}
                    strokeWidth={6}
                    color={book.coverColor}
                  />
                  <div>
                    <p className="text-xs text-stone-400">Endings found</p>
                    <p className="text-lg font-bold text-stone-800">{pct}%</p>
                  </div>
                </div>
              )}
              <div className="flex-1 grid grid-cols-2 gap-3">
                <div className="bg-amber-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-stone-800">{sessions.length}</p>
                  <p className="text-xs text-stone-400 mt-0.5">Total runs</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-stone-800">{completedSessions.length}</p>
                  <p className="text-xs text-stone-400 mt-0.5">Completed</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3">
          {activeSession ? (
            <button
              onClick={() => navigate('active-session', { bookId: book.id, sessionId: activeSession.id })}
              className="btn-primary flex items-center justify-center gap-2 col-span-2"
            >
              <Play size={16} fill="currentColor" />
              Continue Reading
            </button>
          ) : (
            <button
              onClick={() => setShowNewSession(true)}
              className="btn-primary flex items-center justify-center gap-2 col-span-2"
            >
              <Plus size={18} />
              New Session
            </button>
          )}

          <button
            onClick={() => navigate('paths-map', { bookId: book.id })}
            className="btn-secondary flex items-center justify-center gap-2"
          >
            <GitBranch size={16} />
            Paths Map
          </button>

          {book.totalEndings > 0 ? (
            <button
              onClick={() => navigate('endings', { bookId: book.id })}
              className="btn-secondary flex items-center justify-center gap-2"
            >
              <CheckSquare size={16} />
              Endings
            </button>
          ) : (
            <button
              onClick={() => {
                const latest = completedSessions[0] || sessions[0]
                if (latest) navigate('session-history', { bookId: book.id, sessionId: latest.id })
              }}
              disabled={sessions.length === 0}
              className="btn-secondary flex items-center justify-center gap-2 disabled:opacity-40"
            >
              <Clock size={16} />
              History
            </button>
          )}
        </div>

        {/* Sessions list */}
        <div>
          <h2 className="section-label mb-3">Sessions</h2>
          {sessions.length === 0 ? (
            <EmptyState
              emoji="🗺️"
              title="No sessions yet"
              description="Start a new session to begin tracking your path through the book."
              action={
                <button onClick={() => setShowNewSession(true)} className="btn-secondary">
                  Start First Session
                </button>
              }
            />
          ) : (
            <div className="flex flex-col gap-3">
              {sessions.map(session => (
                <SessionRow
                  key={session.id}
                  session={session}
                  onView={handleViewSession}
                  onDelete={(id) => setDeleteSessionId(id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* New session modal */}
      <Modal isOpen={showNewSession} onClose={() => setShowNewSession(false)} title="New Session">
        <div className="flex flex-col gap-4">
          <div>
            <label className="section-label block mb-2">Session Name (optional)</label>
            <input
              type="text"
              placeholder={`Session ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
              value={sessionName}
              onChange={e => setSessionName(e.target.value)}
              className="input-field"
              autoFocus
            />
          </div>
          <button onClick={handleStartSession} className="btn-primary flex items-center justify-center gap-2">
            <Play size={16} fill="currentColor" />
            Start Reading
          </button>
        </div>
      </Modal>

      {/* Delete session confirm */}
      <Modal isOpen={!!deleteSessionId} onClose={() => setDeleteSessionId(null)} title="Delete Session?">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-stone-600">This will permanently delete the session and all its decision history.</p>
          <div className="flex gap-3">
            <button onClick={() => setDeleteSessionId(null)} className="btn-secondary flex-1">Cancel</button>
            <button
              onClick={() => { deleteSession(deleteSessionId); setDeleteSessionId(null) }}
              className="flex-1 bg-orange-500 text-white rounded-xl px-5 py-3 font-medium text-sm active:scale-95 transition-all"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete book confirm */}
      <Modal isOpen={showDeleteBook} onClose={() => setShowDeleteBook(false)} title="Delete Book?">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-stone-600">
            This will permanently delete <strong>{book.title}</strong> and all its sessions and tracking data.
          </p>
          <div className="flex gap-3">
            <button onClick={() => setShowDeleteBook(false)} className="btn-secondary flex-1">Cancel</button>
            <button
              onClick={handleDeleteBook}
              className="flex-1 bg-orange-500 text-white rounded-xl px-5 py-3 font-medium text-sm active:scale-95 transition-all"
            >
              Delete Book
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
