import { ArrowDown, BookOpen, Flag } from 'lucide-react'

// Build ordered segments: alternating read-segments and decision nodes
export function buildSegments(decisions, startPage, currentPage) {
  const segments = []
  let cursor = Number(startPage) || 1

  for (const d of decisions) {
    const choicePage = Number(d.fromPage)
    const jumpPage   = Number(d.toPage)

    // Reading segment before this choice point
    if (choicePage > cursor) {
      segments.push({ type: 'read', from: cursor, to: choicePage, inProgress: false })
    }

    // Decision node
    segments.push({ type: 'decision', fromPage: choicePage, choice: d.choice, toPage: jumpPage, id: d.id })
    cursor = jumpPage
  }

  // Trailing reading segment (currently in progress, or just a marker)
  const cur = Number(currentPage) || cursor
  if (cur > cursor) {
    segments.push({ type: 'read', from: cursor, to: cur, inProgress: true })
  }

  return segments
}

function Connector({ dashed = false }) {
  return (
    <div className={`w-0.5 h-4 mx-auto ${dashed ? 'border-l-2 border-dashed border-amber-300' : 'bg-stone-200'}`} />
  )
}

function ReadSegment({ from, to, inProgress }) {
  const pages = to - from
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs w-full max-w-xs mx-auto ${
      inProgress
        ? 'bg-amber-50 border border-dashed border-amber-300 text-amber-700'
        : 'bg-stone-50 border border-stone-100 text-stone-500'
    }`}>
      <BookOpen size={11} className="shrink-0 opacity-60" />
      <span className="flex-1 text-center">
        <span className="font-semibold">p.{from}</span>
        <span className="mx-1 opacity-50">—</span>
        <span className="font-semibold">p.{to}</span>
        <span className="ml-1 opacity-60">
          ({pages} {pages === 1 ? 'page' : 'pages'})
        </span>
      </span>
      {inProgress && <span className="text-amber-500 font-medium shrink-0">reading</span>}
    </div>
  )
}

function DecisionNode({ fromPage, choice, toPage, color }) {
  return (
    <div className="w-full max-w-xs mx-auto">
      <div
        className="rounded-2xl p-3 w-full shadow-sm"
        style={{ backgroundColor: color + '18', border: `1.5px solid ${color}44` }}
      >
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: color }}>
            p.{fromPage}
          </span>
          <ArrowDown size={12} className="opacity-40" />
          <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: color }}>
            p.{toPage}
          </span>
        </div>
        {choice ? (
          <p className="text-xs text-center leading-snug mt-1" style={{ color }}>
            "{choice}"
          </p>
        ) : (
          <p className="text-xs text-center opacity-40 mt-1">Choice logged</p>
        )}
      </div>
    </div>
  )
}

export default function PathDiagram({ decisions = [], startPage = 1, currentPage, endingFound, isComplete, color = '#78716c', compact = false }) {
  const segments = buildSegments(decisions, startPage, currentPage)
  const cur = Number(currentPage) || Number(startPage) || 1

  if (compact) {
    // Compact horizontal strip for book-level paths map
    return (
      <div className="flex items-center gap-1 flex-wrap">
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
        {segments.map((seg, i) =>
          seg.type === 'read' ? (
            <span key={i} className="text-xs text-stone-400">
              ──<span className="text-stone-500 font-medium">p.{seg.to}</span>
            </span>
          ) : (
            <span key={i} className="flex items-center gap-0.5">
              <span className="text-xs px-1.5 py-0.5 rounded font-medium text-white" style={{ backgroundColor: color }}>
                →p.{seg.toPage}
              </span>
            </span>
          )
        )}
        {isComplete ? (
          <span className="text-xs font-semibold text-amber-700 flex items-center gap-0.5">
            <Flag size={10} />
            {endingFound ? `#${endingFound}` : 'Done'}
          </span>
        ) : (
          <span className="text-xs text-stone-400">…p.{cur}</span>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center w-full py-2 animate-fade-in">
      {/* Start node */}
      <div className="flex flex-col items-center">
        <div className="w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
        <span className="text-xs font-semibold text-emerald-700 mt-1">Start — p.{startPage}</span>
      </div>

      {segments.length === 0 && (
        <>
          <Connector dashed />
          <div className="text-xs text-stone-400 py-2 text-center px-4">
            Log your first choice point to build your path map
          </div>
        </>
      )}

      {segments.map((seg, i) => (
        <div key={i} className="flex flex-col items-center w-full">
          <Connector dashed={seg.type === 'read' && seg.inProgress} />
          {seg.type === 'read'
            ? <ReadSegment from={seg.from} to={seg.to} inProgress={seg.inProgress} />
            : <DecisionNode fromPage={seg.fromPage} choice={seg.choice} toPage={seg.toPage} color={color} />
          }
        </div>
      ))}

      {/* Terminal node */}
      <Connector dashed={!isComplete} />
      {isComplete ? (
        <div className="flex flex-col items-center gap-1">
          <div className="w-3 h-3 rounded-full ring-4 ring-amber-100" style={{ backgroundColor: '#f59e0b' }} />
          <span className="text-xs font-semibold text-amber-700 flex items-center gap-1">
            <Flag size={11} />
            {endingFound ? `Ending #${endingFound} — p.${cur}` : `Ended at p.${cur}`}
          </span>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-stone-400 ring-4 ring-stone-100" />
          <span className="text-xs font-semibold text-stone-500">Currently reading p.{cur}</span>
        </div>
      )}
    </div>
  )
}
