import { useState } from 'react'
import { ChevronLeft, Check } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { COVER_COLORS, COVER_EMOJIS } from '../store/dataStore'

export default function AddBook({ navigate }) {
  const { addBook } = useApp()
  const [form, setForm] = useState({
    title: '',
    author: '',
    coverColor: COVER_COLORS[1].value,
    coverEmoji: COVER_EMOJIS[0],
    totalPages: '',
    totalEndings: '',
  })
  const [errors, setErrors] = useState({})

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const validate = () => {
    const e = {}
    if (!form.title.trim()) e.title = 'Title is required'
    if (form.totalPages && Number(form.totalPages) < 1) e.totalPages = 'Must be a positive number'
    if (form.totalEndings && Number(form.totalEndings) < 1) e.totalEndings = 'Must be a positive number'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    addBook({
      ...form,
      totalPages: form.totalPages ? Number(form.totalPages) : 0,
      totalEndings: form.totalEndings ? Number(form.totalEndings) : 0,
    })
    navigate('home')
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('home')}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-amber-100 text-stone-600 active:scale-95 transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-lg font-bold text-stone-800">Add Book</h1>
        </div>
      </div>

      <div className="px-4 pt-6 flex flex-col gap-6">
        {/* Preview */}
        <div className="flex justify-center">
          <div
            className="w-24 h-32 rounded-xl flex items-center justify-center text-4xl shadow-md"
            style={{ backgroundColor: form.coverColor + '22', border: `3px solid ${form.coverColor}55` }}
          >
            {form.coverEmoji}
          </div>
        </div>

        {/* Emoji picker */}
        <div>
          <label className="section-label block mb-3">Cover Icon</label>
          <div className="grid grid-cols-10 gap-1.5">
            {COVER_EMOJIS.map(emoji => (
              <button
                key={emoji}
                onClick={() => set('coverEmoji', emoji)}
                className={`aspect-square text-xl rounded-xl flex items-center justify-center transition-all active:scale-90 ${
                  form.coverEmoji === emoji
                    ? 'bg-stone-200 scale-110 shadow-sm'
                    : 'bg-amber-50'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Color picker */}
        <div>
          <label className="section-label block mb-3">Cover Color</label>
          <div className="flex flex-wrap gap-2.5">
            {COVER_COLORS.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => set('coverColor', value)}
                title={label}
                className={`w-8 h-8 rounded-full transition-all active:scale-90 ${
                  form.coverColor === value ? 'scale-110 ring-2 ring-offset-2 ring-stone-400' : ''
                }`}
                style={{ backgroundColor: value }}
              />
            ))}
          </div>
        </div>

        {/* Text fields */}
        <div className="flex flex-col gap-4">
          <div>
            <label className="section-label block mb-2">Book Title *</label>
            <input
              type="text"
              placeholder="e.g. The Hiker"
              value={form.title}
              onChange={e => set('title', e.target.value)}
              className={`input-field ${errors.title ? 'border-red-300 ring-1 ring-red-200' : ''}`}
            />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="section-label block mb-2">Author</label>
            <input
              type="text"
              placeholder="e.g. Deshan B. Dissanayake"
              value={form.author}
              onChange={e => set('author', e.target.value)}
              className="input-field"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="section-label block mb-2">Total Pages</label>
              <input
                type="number"
                placeholder="e.g. 322"
                value={form.totalPages}
                onChange={e => set('totalPages', e.target.value)}
                min={1}
                className={`input-field ${errors.totalPages ? 'border-red-300' : ''}`}
              />
              {errors.totalPages && <p className="text-xs text-red-500 mt-1">{errors.totalPages}</p>}
            </div>
            <div>
              <label className="section-label block mb-2">Total Endings</label>
              <input
                type="number"
                placeholder="e.g. 31"
                value={form.totalEndings}
                onChange={e => set('totalEndings', e.target.value)}
                min={1}
                className={`input-field ${errors.totalEndings ? 'border-red-300' : ''}`}
              />
              {errors.totalEndings && <p className="text-xs text-red-500 mt-1">{errors.totalEndings}</p>}
            </div>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="btn-primary flex items-center justify-center gap-2 w-full mt-2"
        >
          <Check size={18} />
          Add to Shelf
        </button>
      </div>
    </div>
  )
}
