import { BookOpen, Plus, Settings } from 'lucide-react'

const tabs = [
  { id: 'home', label: 'Shelf', icon: BookOpen },
  { id: 'add', label: 'Add Book', icon: Plus },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export default function BottomNav({ currentPage, navigate }) {
  const isActive = (id) => {
    if (id === 'home') return currentPage === 'home'
    if (id === 'add') return currentPage === 'add-book'
    if (id === 'settings') return currentPage === 'settings'
    return false
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-amber-100 safe-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map(({ id, label, icon: Icon }) => {
          const active = isActive(id)
          return (
            <button
              key={id}
              onClick={() => {
                if (id === 'home') navigate('home')
                else if (id === 'add') navigate('add-book')
                else if (id === 'settings') navigate('settings')
              }}
              className={`flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-all duration-200 active:scale-95 ${
                active
                  ? 'text-stone-800'
                  : 'text-stone-400'
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all duration-200 ${active ? 'bg-amber-100' : ''}`}>
                <Icon
                  size={20}
                  strokeWidth={active ? 2.5 : 1.8}
                />
              </div>
              <span className={`text-xs font-medium ${active ? 'text-stone-800' : 'text-stone-400'}`}>
                {label}
              </span>
            </button>
          )
        })}
      </div>
      {/* Safe area spacer for iPhone home indicator */}
      <div className="h-safe-bottom" />
    </nav>
  )
}
