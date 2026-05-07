// Data shape helpers & IDs

export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function createBook({ title, author, coverColor, coverEmoji, totalPages, totalEndings }) {
  return {
    id: generateId(),
    title,
    author,
    coverColor: coverColor || '#78716c',
    coverEmoji: coverEmoji || '📖',
    totalPages: Number(totalPages) || 0,
    totalEndings: Number(totalEndings) || 0,
    createdAt: new Date().toISOString(),
  }
}

export function createSession(bookId, name, sessionNumber = 1, startPage = 1) {
  return {
    id: generateId(),
    bookId,
    name: name || `Session ${sessionNumber}`,
    startedAt: new Date().toISOString(),
    endedAt: null,
    startPage: Number(startPage) || 1,
    currentPage: Number(startPage) || 1,
    decisions: [],
    notes: '',
    endingFound: null,
    isComplete: false,
  }
}

export function createDecision({ fromPage, choice, toPage, isRedirect = false }) {
  return {
    id: generateId(),
    fromPage: Number(fromPage),
    choice: choice || '',
    toPage: Number(toPage),
    isRedirect: Boolean(isRedirect),
    timestamp: new Date().toISOString(),
  }
}

export const COVER_COLORS = [
  { label: 'Slate', value: '#475569' },
  { label: 'Stone', value: '#78716c' },
  { label: 'Red', value: '#dc2626' },
  { label: 'Orange', value: '#ea580c' },
  { label: 'Amber', value: '#d97706' },
  { label: 'Emerald', value: '#059669' },
  { label: 'Teal', value: '#0d9488' },
  { label: 'Blue', value: '#2563eb' },
  { label: 'Violet', value: '#7c3aed' },
  { label: 'Pink', value: '#db2777' },
]

export const COVER_EMOJIS = [
  '📖', '📚', '🗺️', '⚔️', '🧙', '🏰', '🚀', '🌊', '🦁', '🐉',
  '🔮', '💀', '🌋', '🏜️', '🌿', '🧪', '🗝️', '⚡', '🌙', '🎭',
]
