import { ChevronLeft, Trophy } from 'lucide-react'
import { useApp } from '../context/AppContext'
import ProgressRing from '../components/ProgressRing'
import EmptyState from '../components/EmptyState'

function formatDate(iso) {
  if (!iso) return null
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function EndingsChecklist({ navigate, params }) {
  const { books, getBookEndings, getEndingsFoundCount, toggleEnding, getActiveSession } = useApp()
  const book = books.find(b => b.id === params?.bookId)

  if (!book) {
    return (
      <div className="page-container flex items-center justify-center">
        <EmptyState emoji="📕" title="Book not found" description="" />
      </div>
    )
  }

  const bookEndings = getBookEndings(book.id)
  const foundCount = getEndingsFoundCount(book.id)
  const activeSession = getActiveSession(book.id)
  const pct = book.totalEndings > 0 ? Math.round((foundCount / book.totalEndings) * 100) : 0

  if (book.totalEndings === 0) {
    return (
      <div className="page-container">
        <div className="page-header">
          <button onClick={() => navigate('book-detail', { bookId: book.id })}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-amber-100 text-stone-600 active:scale-95 transition-all">
            <ChevronLeft size={20} />
          </button>
        </div>
        <EmptyState
          emoji="📋"
          title="No endings defined"
          description="Edit this book to add a total endings count."
        />
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
            <h1 className="text-lg font-bold text-stone-800">Endings</h1>
            <p className="text-xs text-stone-400">{book.title}</p>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 flex flex-col gap-5">
        {/* Progress summary */}
        <div className="card p-5">
          <div className="flex items-center gap-5">
            <ProgressRing
              value={foundCount}
              max={book.totalEndings}
              size={80}
              strokeWidth={7}
              color={book.coverColor}
            />
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-stone-800">{pct}%</h2>
              <p className="text-sm text-stone-500 mt-0.5">
                {foundCount} of {book.totalEndings} endings discovered
              </p>
              {pct === 100 && (
                <div className="flex items-center gap-1.5 mt-2">
                  <Trophy size={14} className="text-amber-500" />
                  <span className="text-xs font-semibold text-amber-700">Complete!</span>
                </div>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="h-2 bg-amber-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, backgroundColor: book.coverColor }}
              />
            </div>
          </div>
        </div>

        {/* Endings grid */}
        <div>
          <p className="section-label mb-3">Tap an ending to mark it found</p>
          <div className="grid grid-cols-4 gap-2.5">
            {Array.from({ length: book.totalEndings }, (_, i) => i + 1).map(num => {
              const endingData = bookEndings[num] || { found: false }
              const found = endingData.found

              return (
                <button
                  key={num}
                  onClick={() => toggleEnding(book.id, num, activeSession?.id)}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center transition-all duration-200 active:scale-90 shadow-sm ${
                    found
                      ? 'text-white shadow-md scale-[1.02]'
                      : 'bg-white border border-amber-100 text-stone-400'
                  }`}
                  style={found ? { backgroundColor: book.coverColor } : {}}
                >
                  <span className={`text-base font-bold ${found ? 'text-white' : 'text-stone-700'}`}>
                    {num}
                  </span>
                  {found && (
                    <span className="text-xs text-white/80 mt-0.5">✓</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Found endings detail */}
        {foundCount > 0 && (
          <div>
            <h2 className="section-label mb-3">Discovery Log</h2>
            <div className="flex flex-col gap-2">
              {Object.entries(bookEndings)
                .filter(([, data]) => data.found)
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([num, data]) => (
                  <div key={num} className="card">
                    <div className="p-3 flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white shrink-0"
                        style={{ backgroundColor: book.coverColor }}
                      >
                        {num}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-stone-700">Ending #{num}</p>
                        {data.foundAt && (
                          <p className="text-xs text-stone-400">{formatDate(data.foundAt)}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
