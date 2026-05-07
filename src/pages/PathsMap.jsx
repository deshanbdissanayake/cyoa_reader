import { useState } from 'react'
import { ChevronLeft, ChevronRight, GitBranch, Play } from 'lucide-react'
import { useApp } from '../context/AppContext'
import EmptyState from '../components/EmptyState'
import Modal from '../components/Modal'

// ─── Graph building ────────────────────────────────────────────────────────────

function buildGraph(sessions) {
  const nodeMap = new Map()
  const edgeMap = new Map()

  const upsertNode = (id, data) => {
    if (!nodeMap.has(id)) nodeMap.set(id, { id, ...data })
  }
  const upsertEdge = (from, to, label = '', reading = false) => {
    const key = `${from}|${to}`
    if (edgeMap.has(key)) {
      edgeMap.get(key).count++
    } else {
      edgeMap.set(key, { id: key, from, to, label, reading, count: 1 })
    }
  }

  upsertNode('start', { label: 'p.1', sub: 'Start', type: 'start', page: 1 })

  for (const session of sessions) {
    const sessionStartPage = Number(session.startPage) || 1
    let prevId = sessionStartPage === 1 ? 'start' : `p${sessionStartPage}`

    for (const d of session.decisions) {
      const fp     = Number(d.fromPage)
      const tp     = Number(d.toPage)
      const fromId = fp === 1 ? 'start' : `p${fp}`
      const toId   = `p${tp}`

      upsertNode(fromId, { label: `p.${fp}`, type: 'decision', page: fp })
      upsertNode(toId,   { label: `p.${tp}`, type: 'page',     page: tp })

      // Reading gap between previous position and this choice page
      if (prevId !== fromId) {
        upsertEdge(prevId, fromId, '', true)
      }

      upsertEdge(fromId, toId, d.choice || '', false)
      prevId = toId
    }

    if (session.endingFound) {
      const endId = `end${session.endingFound}`
      upsertNode(endId, { label: `#${session.endingFound}`, sub: 'Ending', type: 'ending', page: Infinity })
      upsertEdge(prevId, endId, '', false)
    }
  }

  return { nodes: [...nodeMap.values()], edges: [...edgeMap.values()] }
}

function computeLayout(nodes, edges) {
  const NODE_W  = 60
  const NODE_H  = 28
  const LEVEL_H = 96
  const H_GAP   = 84

  // Build outgoing adjacency
  const outgoing = new Map()
  for (const e of edges) {
    if (!outgoing.has(e.from)) outgoing.set(e.from, [])
    outgoing.get(e.from).push(e.to)
  }

  // BFS to assign levels
  const level = new Map()
  const q = ['start']
  level.set('start', 0)
  while (q.length) {
    const cur = q.shift()
    const lv  = level.get(cur)
    for (const next of (outgoing.get(cur) || [])) {
      if (!level.has(next)) {
        level.set(next, lv + 1)
        q.push(next)
      }
    }
  }

  // Group by level, sort by page number within each level
  const byLevel = new Map()
  for (const [id, lv] of level) {
    if (!byLevel.has(lv)) byLevel.set(lv, [])
    byLevel.get(lv).push(id)
  }
  for (const [, ids] of byLevel) {
    ids.sort((a, b) => {
      const pA = nodes.find(n => n.id === a)?.page ?? 0
      const pB = nodes.find(n => n.id === b)?.page ?? 0
      return pA - pB
    })
  }

  // Assign x, y (centered per level)
  const pos = new Map()
  let maxCols  = 0
  let maxLevel = 0

  for (const [lv, ids] of byLevel) {
    maxCols  = Math.max(maxCols, ids.length)
    maxLevel = Math.max(maxLevel, lv)
    const span   = (ids.length - 1) * H_GAP
    const startX = -span / 2
    ids.forEach((id, i) => {
      pos.set(id, { x: startX + i * H_GAP, y: lv * LEVEL_H })
    })
  }

  const PAD  = 44
  const svgW = Math.max(maxCols * H_GAP + PAD * 2, 260)
  const svgH = (maxLevel + 1) * LEVEL_H + NODE_H + PAD * 2

  return { pos, svgW, svgH, cx: svgW / 2, NODE_W, NODE_H, PAD }
}

// ─── SVG Flowchart ─────────────────────────────────────────────────────────────

function FlowChart({ sessions, bookColor, onNodeClick }) {
  const { nodes, edges } = buildGraph(sessions)
  const { pos, svgW, svgH, cx, NODE_W, NODE_H, PAD } = computeLayout(nodes, edges)
  const mid = `arr${bookColor.replace(/[^a-z0-9]/gi, '').slice(0, 6)}`

  return (
    <div className="overflow-x-auto overflow-y-visible -mx-1">
      <svg
        width={svgW}
        height={svgH}
        viewBox={`0 0 ${svgW} ${svgH}`}
        style={{ display: 'block', margin: '0 auto', minWidth: 240 }}
      >
        <defs>
          <marker id={mid} viewBox="0 0 10 10" refX="8" refY="5"
            markerWidth="5" markerHeight="5" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={bookColor} opacity="0.8" />
          </marker>
        </defs>

        <g transform={`translate(${cx}, ${PAD})`}>

          {/* ── Edges (draw first so nodes sit on top) ── */}
          {edges.map(e => {
            const fp = pos.get(e.from)
            const tp = pos.get(e.to)
            if (!fp || !tp) return null

            const x1 = fp.x + NODE_W / 2
            const y1 = fp.y + NODE_H + 2
            const x2 = tp.x + NODE_W / 2
            const y2 = tp.y - 3

            const dy   = Math.abs(y2 - y1) * 0.42
            const pathD = `M ${x1} ${y1} C ${x1} ${y1 + dy} ${x2} ${y2 - dy} ${x2} ${y2}`

            // Label position: 60% along the bezier (approximate)
            const lx = x1 * 0.4 + x2 * 0.6
            const ly = y1 * 0.4 + y2 * 0.6
            const trunc = e.label.length > 14 ? e.label.slice(0, 12) + '…' : e.label
            const labelOffset = x2 >= x1 ? 5 : -5
            const labelAnchor = x2 >= x1 ? 'start' : 'end'

            return (
              <g key={e.id}>
                <path
                  d={pathD}
                  fill="none"
                  stroke={bookColor}
                  strokeWidth={e.count > 1 ? 3 : 1.5}
                  strokeOpacity={e.reading ? 0.28 : 0.72}
                  strokeDasharray={e.reading ? '5 3' : undefined}
                  markerEnd={`url(#${mid})`}
                />
                {trunc && !e.reading && (
                  <text
                    x={lx + labelOffset} y={ly}
                    fontSize={7} fill="#a8a29e"
                    textAnchor={labelAnchor}
                    dominantBaseline="central"
                    style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                  >
                    {trunc}
                  </text>
                )}
              </g>
            )
          })}

          {/* ── Nodes ── */}
          {nodes.map(node => {
            const p = pos.get(node.id)
            if (!p) return null

            const isStart  = node.type === 'start'
            const isEnding = node.type === 'ending'
            const isDecision = node.type === 'decision'

            const bgFill    = isStart ? '#10b981' : isEnding ? '#f59e0b' : 'white'
            const strokeCol = isStart ? '#059669' : isEnding ? '#d97706' : bookColor
            const textCol   = isStart ? 'white'   : isEnding ? 'white'   : bookColor
            const overlayOp = isDecision ? 0.13 : 0

            const isClickable = node.type !== 'ending' && node.page !== Infinity
            return (
              <g
                key={node.id}
                transform={`translate(${p.x}, ${p.y})`}
                onClick={isClickable ? () => onNodeClick(node) : undefined}
                style={isClickable ? { cursor: 'pointer' } : undefined}
              >
                {/* Shadow */}
                <rect width={NODE_W} height={NODE_H} rx={7} ry={7}
                  fill="#00000010" transform="translate(0,1.5)" />
                {/* Background */}
                <rect width={NODE_W} height={NODE_H} rx={7} ry={7}
                  fill={bgFill}
                  stroke={strokeCol}
                  strokeWidth={isStart || isEnding ? 0 : 1.5}
                />
                {/* Tinted overlay for decision nodes */}
                {overlayOp > 0 && (
                  <rect width={NODE_W} height={NODE_H} rx={7} ry={7}
                    fill={bookColor} fillOpacity={overlayOp} />
                )}
                {/* Label */}
                <text
                  x={NODE_W / 2} y={NODE_H / 2}
                  textAnchor="middle" dominantBaseline="central"
                  fontSize={10} fontWeight="700" fill={textCol}
                  style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                >
                  {node.label}
                </text>
                {/* Sub-label below */}
                {node.sub && (
                  <text
                    x={NODE_W / 2} y={NODE_H + 10}
                    textAnchor="middle"
                    fontSize={7} fontWeight="600"
                    fill={isStart ? '#059669' : isEnding ? '#d97706' : '#a8a29e'}
                    style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                  >
                    {node.sub}
                  </text>
                )}
              </g>
            )
          })}

        </g>
      </svg>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function PathsMap({ navigate, params }) {
  const { books, getBookSessions, startSession } = useApp()
  const book = books.find(b => b.id === params?.bookId)

  const [selectedNode, setSelectedNode] = useState(null)
  const [sessionName, setSessionName]   = useState('')

  const handleNodeClick = (node) => {
    setSelectedNode(node)
    setSessionName('')
  }

  const handleStartFromNode = () => {
    const session = startSession(book.id, sessionName.trim() || undefined, selectedNode.page)
    setSelectedNode(null)
    navigate('active-session', { bookId: book.id, sessionId: session.id })
  }

  if (!book) {
    return (
      <div className="page-container flex items-center justify-center">
        <EmptyState emoji="📕" title="Book not found" description="" />
      </div>
    )
  }

  const allSessions       = getBookSessions(book.id)
  const completedSessions = allSessions.filter(s => s.isComplete)
  const activeSessions    = allSessions.filter(s => !s.isComplete)
  const uniqueEndings     = new Set(completedSessions.filter(s => s.endingFound).map(s => s.endingFound)).size

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
            <h1 className="text-lg font-bold text-stone-800 flex items-center gap-2">
              <GitBranch size={18} />
              Paths Map
            </h1>
            <p className="text-xs text-stone-400">{book.title}</p>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 flex flex-col gap-5">
        {/* Stats */}
        <div className="flex gap-3">
          {[
            { val: allSessions.length,       label: 'Runs' },
            { val: completedSessions.length, label: 'Completed' },
            { val: uniqueEndings,            label: 'Endings' },
          ].map(({ val, label }) => (
            <div key={label} className="flex-1 card p-3 text-center">
              <p className="text-xl font-bold text-stone-800">{val}</p>
              <p className="text-xs text-stone-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* SVG Flowchart */}
        <div>
          <h2 className="section-label mb-3">Explored Paths</h2>
          {completedSessions.length === 0 ? (
            <EmptyState
              emoji="🗺️"
              title="No completed runs yet"
              description="Finish a session to see your paths mapped as a flowchart."
              action={
                <button onClick={() => navigate('book-detail', { bookId: book.id })} className="btn-secondary">
                  Go to Book
                </button>
              }
            />
          ) : (
            <div className="card p-4">
              <FlowChart sessions={completedSessions} bookColor={book.coverColor} onNodeClick={handleNodeClick} />
              {/* Legend */}
              <div className="flex flex-wrap items-center gap-4 mt-4 pt-3 border-t border-amber-100">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-6 h-0.5 rounded" style={{ backgroundColor: book.coverColor, opacity: 0.75 }} />
                  <span className="text-xs text-stone-400">Choice</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-6 h-0" style={{ borderTop: `2px dashed ${book.coverColor}55` }} />
                  <span className="text-xs text-stone-400">Reading</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-3.5 h-3.5 rounded bg-emerald-500" />
                  <span className="text-xs text-stone-400">Start</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-3.5 h-3.5 rounded bg-amber-400" />
                  <span className="text-xs text-stone-400">Ending</span>
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Active sessions */}
        {activeSessions.length > 0 && (
          <div>
            <h2 className="section-label mb-3">In Progress</h2>
            <div className="flex flex-col gap-2">
              {activeSessions.map(s => (
                <button
                  key={s.id}
                  onClick={() => navigate('active-session', { bookId: book.id, sessionId: s.id })}
                  className="card p-3 flex items-center gap-3 active:scale-[0.98] transition-all text-left"
                >
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-stone-700">{s.name}</p>
                    <p className="text-xs text-stone-400 mt-0.5">
                      p.{s.currentPage} · {s.decisions.length} {s.decisions.length === 1 ? 'choice' : 'choices'}
                    </p>
                  </div>
                  <ChevronRight size={15} className="text-stone-300 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={!!selectedNode}
        onClose={() => setSelectedNode(null)}
        title={`Start from p.${selectedNode?.page}`}
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-stone-600">
            A new session will begin at <strong>page {selectedNode?.page}</strong>. You can continue reading from there.
          </p>
          <div>
            <label className="section-label block mb-2">Session Name (optional)</label>
            <input
              type="text"
              placeholder="Leave blank to auto-name"
              value={sessionName}
              onChange={e => setSessionName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleStartFromNode() }}
              className="input-field"
              autoFocus
            />
          </div>
          <button onClick={handleStartFromNode} className="btn-primary flex items-center justify-center gap-2">
            <Play size={15} fill="currentColor" />
            Start Session from p.{selectedNode?.page}
          </button>
        </div>
      </Modal>
    </div>
  )
}
