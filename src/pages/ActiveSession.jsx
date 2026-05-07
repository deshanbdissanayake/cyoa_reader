import { useState } from 'react'
import { ChevronLeft, ArrowRight, Trash2, Flag, FileText, ChevronDown, ChevronUp, GitBranch, ChevronRight } from 'lucide-react'
import { useApp } from '../context/AppContext'
import EmptyState from '../components/EmptyState'
import Modal from '../components/Modal'

export default function ActiveSession({ navigate, params }) {
  const { books, sessions, addDecision, removeDecision, updateSessionNotes, updateCurrentPage, completeSession } = useApp()

  const book    = books.find(b => b.id === params?.bookId)
  const session = sessions.find(s => s.id === params?.sessionId)

  const [showDecision, setShowDecision]   = useState(false)
  const [jumpToPage, setJumpToPage]       = useState('')
  const [choiceText, setChoiceText]       = useState('')
  const [formError, setFormError]         = useState('')
  const [showNotes, setShowNotes]         = useState(false)
  const [showComplete, setShowComplete]   = useState(false)
  const [endingNumber, setEndingNumber]   = useState('')
  const [pageEditing, setPageEditing]     = useState(false)
  const [pageInput, setPageInput]         = useState('')

  if (!book || !session) {
    return (
      <div className="page-container flex items-center justify-center">
        <EmptyState emoji="📕" title="Session not found" description="" />
      </div>
    )
  }

  const currentPage = session.currentPage || 1

  const goNext = () => updateCurrentPage(session.id, currentPage + 1)
  const goPrev = () => { if (currentPage > 1) updateCurrentPage(session.id, currentPage - 1) }

  const commitPageEdit = () => {
    const n = Number(pageInput)
    if (n > 0) updateCurrentPage(session.id, n)
    setPageEditing(false)
    setPageInput('')
  }

  const openDecision = () => {
    setJumpToPage('')
    setChoiceText('')
    setFormError('')
    setShowDecision(true)
  }

  const handleLogDecision = () => {
    setFormError('')
    if (!jumpToPage) { setFormError('"Jump to page" is required'); return }
    const toN = Number(jumpToPage)
    if (isNaN(toN) || toN < 1) { setFormError('Enter a valid page number'); return }
    addDecision(session.id, { fromPage: String(currentPage), choice: choiceText, toPage: String(toN) })
    updateCurrentPage(session.id, toN)
    setShowDecision(false)
    setJumpToPage('')
    setChoiceText('')
    setFormError('')
  }

  const handleComplete = () => {
    completeSession(session.id, endingNumber ? Number(endingNumber) : null)
    navigate('session-history', { bookId: book.id, sessionId: session.id })
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('book-detail', { bookId: book.id })}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-amber-100 text-stone-600 active:scale-95 transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="text-center">
            <p className="text-xs text-stone-400">{book.title}</p>
            <h1 className="text-sm font-semibold text-stone-800">{session.name}</h1>
          </div>
          <button
            onClick={() => setShowComplete(true)}
            className="flex items-center gap-1.5 bg-stone-800 text-amber-50 rounded-xl px-3 py-2 text-xs font-medium active:scale-95 transition-all"
          >
            <Flag size={13} />
            End
          </button>
        </div>
      </div>

      <div className="px-4 pt-4 flex flex-col gap-4">

        {/* ── Current Page ── */}
        <div className="card overflow-hidden">
          <div className="h-1.5 w-full" style={{ backgroundColor: book.coverColor }} />
          <div className="p-5">
            <p className="text-xs text-stone-400 text-center mb-4">Current Page</p>
            {pageEditing ? (
              <input
                type="number" onWheel={e => e.target.blur()}
                value={pageInput}
                min={1}
                autoFocus
                onChange={e => setPageInput(e.target.value)}
                onBlur={commitPageEdit}
                onKeyDown={e => { if (e.key === 'Enter') commitPageEdit() }}
                className="w-32 h-32 rounded-2xl mx-auto mb-5 text-5xl font-black text-center border-2 focus:outline-none block"
                style={{ color: book.coverColor, borderColor: book.coverColor, backgroundColor: book.coverColor + '18' }}
              />
            ) : (
              <button
                onClick={() => { setPageInput(String(currentPage)); setPageEditing(true) }}
                className="w-32 h-32 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-md active:opacity-70 transition-opacity"
                style={{ backgroundColor: book.coverColor + '18', border: `2px solid ${book.coverColor}44` }}
              >
                <span className="text-5xl font-black" style={{ color: book.coverColor }}>{currentPage}</span>
              </button>
            )}

            {/* Navigation buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={goPrev}
                disabled={currentPage <= 1}
                className="w-12 h-12 rounded-xl bg-amber-100 text-stone-600 flex items-center justify-center active:scale-90 transition-all disabled:opacity-30 shrink-0"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={goNext}
                className="flex-1 h-12 rounded-xl text-white font-bold text-base flex items-center justify-center gap-2 active:scale-[0.97] transition-all shadow-sm"
                style={{ backgroundColor: book.coverColor }}
              >
                Next Page
                <ChevronRight size={18} />
              </button>
            </div>

            <p className="text-xs text-stone-400 text-center mt-3">
              {session.decisions.length} {session.decisions.length === 1 ? 'decision' : 'decisions'} logged
            </p>
          </div>
        </div>

        {/* ── Decision Point ── */}
        {showDecision ? (
          <div className="card animate-fade-in">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-stone-700 flex items-center gap-2">
                  <GitBranch size={15} style={{ color: book.coverColor }} />
                  Decision on p.{currentPage}
                </h2>
                <button
                  onClick={() => setShowDecision(false)}
                  className="text-xs text-stone-400 active:opacity-60"
                >
                  Cancel
                </button>
              </div>

              <div className="flex gap-2 mb-3">
                <div className="flex items-end pb-3 text-xs text-stone-400 font-medium shrink-0">
                  p.{currentPage}
                </div>
                <div className="flex items-end pb-3">
                  <ArrowRight size={16} className="text-stone-300" />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-stone-400 mb-1 block">Jump to page *</label>
                  <input
                    type="number" onWheel={e => e.target.blur()}
                    placeholder="e.g. 45"
                    value={jumpToPage}
                    onChange={e => setJumpToPage(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleLogDecision() }}
                    className="input-field text-center"
                    min={1}
                    autoFocus
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="text-xs text-stone-400 mb-1 block">You chose (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Took the left tunnel"
                  value={choiceText}
                  onChange={e => setChoiceText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleLogDecision() }}
                  className="input-field"
                />
              </div>

              {formError && <p className="text-xs text-red-500 mb-2">{formError}</p>}

              <button
                onClick={handleLogDecision}
                className="w-full h-11 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                style={{ backgroundColor: book.coverColor }}
              >
                <GitBranch size={14} />
                Log &amp; Jump
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={openDecision}
            className="w-full py-3.5 rounded-xl border-2 border-dashed border-red-400 text-red-600 text-sm font-medium flex items-center justify-center gap-2 active:scale-[0.98] transition-all bg-red-50"
          >
            <GitBranch size={16} />
            Decision Point on this page?
          </button>
        )}

        {/* ── Session Notes ── */}
        <div className="card">
          <button
            onClick={() => setShowNotes(!showNotes)}
            className="w-full flex items-center justify-between p-4"
          >
            <div className="flex items-center gap-2 text-sm font-medium text-stone-700">
              <FileText size={15} />
              Session Notes
            </div>
            {showNotes ? <ChevronUp size={16} className="text-stone-400" /> : <ChevronDown size={16} className="text-stone-400" />}
          </button>
          {showNotes && (
            <div className="px-4 pb-4 animate-fade-in">
              <textarea
                rows={4}
                placeholder="Thoughts, observations, hints to remember..."
                value={session.notes}
                onChange={e => updateSessionNotes(session.id, e.target.value)}
                className="input-field resize-none"
              />
            </div>
          )}
        </div>

        {/* ── Recent Choices ── */}
        {session.decisions.length > 0 && (
          <div>
            <h2 className="section-label mb-2">Choices Logged</h2>
            <div className="flex flex-col gap-2">
              {[...session.decisions].reverse().map((d, i) => (
                <div key={d.id} className="card animate-fade-in">
                  <div className="p-3 flex items-start gap-3">
                    <div
                      className="w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5"
                      style={{ backgroundColor: book.coverColor }}
                    >
                      {session.decisions.length - i}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 text-xs text-stone-500">
                        <span className="font-semibold text-stone-700">p.{d.fromPage}</span>
                        <ArrowRight size={10} />
                        <span className="font-semibold text-stone-700">p.{d.toPage}</span>
                      </div>
                      {d.choice && <p className="text-sm text-stone-600 leading-snug mt-0.5">{d.choice}</p>}
                    </div>
                    <button
                      onClick={() => removeDecision(session.id, d.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-stone-300 active:scale-95 transition-all shrink-0"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* End session modal */}
      <Modal isOpen={showComplete} onClose={() => setShowComplete(false)} title="End Session">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-stone-600">
            You've logged {session.decisions.length} choice {session.decisions.length === 1 ? 'point' : 'points'}. Did you reach an ending?
          </p>
          {book.totalEndings > 0 && (
            <div>
              <label className="section-label block mb-2">Ending Number (optional)</label>
              <input
                type="number" onWheel={e => e.target.blur()}
                placeholder={`1 – ${book.totalEndings}`}
                value={endingNumber}
                onChange={e => setEndingNumber(e.target.value)}
                min={1}
                max={book.totalEndings}
                className="input-field"
              />
            </div>
          )}
          <div className="flex gap-3">
            <button onClick={() => setShowComplete(false)} className="btn-secondary flex-1">Keep Reading</button>
            <button onClick={handleComplete} className="btn-primary flex-1 flex items-center justify-center gap-2">
              <Flag size={15} />
              End Session
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
