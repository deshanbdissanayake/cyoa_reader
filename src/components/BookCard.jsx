import { BookOpen, ChevronRight } from 'lucide-react'
import { useApp } from '../context/AppContext'
import ProgressRing from './ProgressRing'

export default function BookCard({ book, onClick }) {
  const { getBookSessions, getEndingsFoundCount, getActiveSession } = useApp()
  const sessions = getBookSessions(book.id)
  const foundCount = getEndingsFoundCount(book.id)
  const activeSession = getActiveSession(book.id)
  const completedSessions = sessions.filter(s => s.isComplete).length

  return (
    <button
      onClick={onClick}
      className="card w-full text-left active:scale-[0.98] transition-all duration-150 animate-fade-in"
    >
      {/* Cover strip */}
      <div
        className="h-2 w-full"
        style={{ backgroundColor: book.coverColor }}
      />

      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Emoji cover */}
          <div
            className="w-12 h-16 rounded-lg flex items-center justify-center text-2xl shrink-0 shadow-sm"
            style={{ backgroundColor: book.coverColor + '22', border: `2px solid ${book.coverColor}33` }}
          >
            {book.coverEmoji}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-stone-800 text-base leading-tight truncate">{book.title}</h3>
            {book.author && (
              <p className="text-xs text-stone-400 mt-0.5 truncate">{book.author}</p>
            )}

            <div className="flex items-center gap-3 mt-2">
              {activeSession && (
                <span className="inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full px-2 py-0.5 font-medium">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  Reading
                </span>
              )}
              <span className="text-xs text-stone-400">{completedSessions} {completedSessions === 1 ? 'run' : 'runs'}</span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            {book.totalEndings > 0 && (
              <ProgressRing value={foundCount} max={book.totalEndings} size={52} strokeWidth={5} color={book.coverColor} />
            )}
            <ChevronRight size={16} className="text-stone-300" />
          </div>
        </div>
      </div>
    </button>
  )
}
