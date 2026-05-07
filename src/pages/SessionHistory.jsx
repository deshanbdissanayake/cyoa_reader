import { useState } from 'react'
import { ChevronLeft, ArrowRight, Flag, FileText, Clock } from 'lucide-react'
import { useApp } from '../context/AppContext'
import EmptyState from '../components/EmptyState'
import PathDiagram from '../components/PathDiagram'

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  })
}
function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

export default function SessionHistory({ navigate, params }) {
  const { books, sessions } = useApp()
  const book    = books.find(b => b.id === params?.bookId)
  const session = sessions.find(s => s.id === params?.sessionId)
  const [viewMode, setViewMode] = useState('diagram') // 'diagram' | 'log'

  if (!book || !session) {
    return (
      <div className="page-container flex items-center justify-center">
        <EmptyState emoji="📕" title="Session not found" description="" />
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('book-detail', { bookId: book.id })}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-amber-100 text-stone-600 active:scale-95 transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <p className="text-xs text-stone-400">{book.title}</p>
            <h1 className="text-sm font-semibold text-stone-800">{session.name}</h1>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 flex flex-col gap-5">
        {/* Session summary */}
        <div className="card">
          <div className="h-1.5 w-full rounded-t-2xl" style={{ backgroundColor: book.coverColor }} />
          <div className="p-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <p className="text-2xl font-bold text-stone-800">{session.decisions.length}</p>
                <p className="text-xs text-stone-400 mt-0.5">Choices</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-stone-800">
                  {session.endingFound ? `#${session.endingFound}` : '—'}
                </p>
                <p className="text-xs text-stone-400 mt-0.5">Ending</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-stone-800">p.{session.currentPage}</p>
                <p className="text-xs text-stone-400 mt-0.5">Final page</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-amber-100 text-xs text-stone-400">
              <Clock size={12} />
              <span>{formatDate(session.startedAt)} at {formatTime(session.startedAt)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {session.notes && (
          <div className="card">
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <FileText size={14} className="text-stone-400" />
                <h2 className="section-label">Notes</h2>
              </div>
              <p className="text-sm text-stone-600 leading-relaxed whitespace-pre-wrap">{session.notes}</p>
            </div>
          </div>
        )}

        {/* Path view toggle */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="section-label">Full Path</h2>
            <div className="flex rounded-xl bg-amber-100 p-0.5 gap-0.5">
              {['diagram', 'log'].map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all capitalize ${
                    viewMode === mode ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {viewMode === 'diagram' ? (
            <div className="card p-5">
              {session.decisions.length === 0 ? (
                <EmptyState emoji="🗺️" title="No choices logged" description="This session has no decision history." />
              ) : (
                <PathDiagram
                  decisions={session.decisions}
                  startPage={1}
                  currentPage={session.currentPage}
                  endingFound={session.endingFound}
                  isComplete={session.isComplete}
                  color={book.coverColor}
                />
              )}
            </div>
          ) : (
            session.decisions.length === 0 ? (
              <EmptyState emoji="🗺️" title="No choices logged" description="This session has no decision history." />
            ) : (
              <div className="relative">
                {/* Vertical timeline line */}
                <div className="absolute left-3 top-3 bottom-3 w-0.5 bg-amber-200 rounded-full" />
                <div className="flex flex-col gap-1">
                  {/* Start */}
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 z-10 shadow-sm">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                      Start — p.1
                    </span>
                  </div>

                  {session.decisions.map((decision, i) => (
                    <div key={decision.id} className="flex items-start gap-3 mb-3">
                      <div
                        className="w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0 z-10 shadow-sm mt-0.5"
                        style={{ backgroundColor: book.coverColor }}
                      >
                        {i + 1}
                      </div>
                      <div className="flex-1 card mb-1">
                        <div className="p-3">
                          <div className="flex items-center gap-2 text-xs mb-1">
                            <span className="font-semibold text-stone-700">p.{decision.fromPage}</span>
                            <ArrowRight size={10} className="text-stone-400" />
                            <span className="font-semibold text-stone-700">p.{decision.toPage}</span>
                            <span className="ml-auto text-stone-300">{formatTime(decision.timestamp)}</span>
                          </div>
                          {decision.choice && (
                            <p className="text-sm text-stone-600 leading-snug">{decision.choice}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* End */}
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 shadow-sm ${
                      session.endingFound ? 'bg-amber-500' : 'bg-stone-400'
                    }`}>
                      <Flag size={12} className="text-white" />
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                      session.endingFound
                        ? 'text-amber-700 bg-amber-50 border-amber-100'
                        : 'text-stone-500 bg-stone-50 border-stone-100'
                    }`}>
                      {session.endingFound
                        ? `Ending #${session.endingFound} — p.${session.currentPage}`
                        : `Stopped at p.${session.currentPage}`}
                    </span>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}
