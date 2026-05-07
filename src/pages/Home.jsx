import { BookOpen, Search } from 'lucide-react'
import { useState } from 'react'
import { useApp } from '../context/AppContext'
import BookCard from '../components/BookCard'
import EmptyState from '../components/EmptyState'

export default function Home({ navigate }) {
  const { books } = useApp()
  const [query, setQuery] = useState('')

  const filtered = books.filter(b =>
    b.title.toLowerCase().includes(query.toLowerCase()) ||
    (b.author && b.author.toLowerCase().includes(query.toLowerCase()))
  )

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-bold text-stone-800">Path Tracker</h1>
            <p className="text-xs text-stone-400 mt-0.5">
              {books.length} {books.length === 1 ? 'book' : 'books'} on your shelf
            </p>
          </div>
          <div className="w-9 h-9 bg-stone-800 rounded-xl flex items-center justify-center">
            <BookOpen size={18} className="text-amber-50" />
          </div>
        </div>

        {books.length > 0 && (
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search books..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="input-field pl-9 py-2.5 text-sm"
            />
          </div>
        )}
      </div>

      <div className="px-4 pt-4">
        {books.length === 0 ? (
          <EmptyState
            emoji="📚"
            title="Your shelf is empty"
            description="Add your first Interactive thriller novel book to start tracking your adventures and discovering every ending."
            action={
              <button
                onClick={() => navigate('add-book')}
                className="btn-primary"
              >
                Add Your First Book
              </button>
            }
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            emoji="🔍"
            title="No results"
            description={`No books match "${query}"`}
          />
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map(book => (
              <BookCard
                key={book.id}
                book={book}
                onClick={() => navigate('book-detail', { bookId: book.id })}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
