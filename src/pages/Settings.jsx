import { useState, useRef } from 'react'
import { Download, Upload, Trash2, ChevronRight, BookOpen, Database, AlertTriangle } from 'lucide-react'
import { useApp } from '../context/AppContext'
import Modal from '../components/Modal'

function SettingRow({ icon: Icon, label, description, onClick, variant = 'default', rightLabel }) {
  const colorMap = {
    default: 'text-stone-600',
    danger: 'text-red-500',
    success: 'text-emerald-600',
  }
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4 active:bg-amber-50 transition-all rounded-xl text-left"
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
        variant === 'danger' ? 'bg-red-50' : 'bg-amber-100'
      }`}>
        <Icon size={18} className={colorMap[variant]} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${colorMap[variant]}`}>{label}</p>
        {description && <p className="text-xs text-stone-400 mt-0.5 leading-snug">{description}</p>}
      </div>
      {rightLabel
        ? <span className="text-xs text-stone-400 shrink-0">{rightLabel}</span>
        : <ChevronRight size={16} className="text-stone-300 shrink-0" />
      }
    </button>
  )
}

export default function Settings() {
  const { books, sessions, exportData, importData, clearAllData } = useApp()
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [importStatus, setImportStatus] = useState(null)
  const fileInputRef = useRef(null)

  const totalDecisions = sessions.reduce((sum, s) => sum + s.decisions.length, 0)

  const handleImport = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const success = importData(ev.target.result)
      setImportStatus(success ? 'success' : 'error')
      setTimeout(() => setImportStatus(null), 3000)
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleClear = () => {
    clearAllData()
    setShowClearConfirm(false)
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="text-xl font-bold text-stone-800">Settings</h1>
        <p className="text-xs text-stone-400 mt-0.5">Data & preferences</p>
      </div>

      <div className="px-4 pt-4 flex flex-col gap-5">
        {/* Stats card */}
        <div className="card p-5">
          <h2 className="section-label mb-4">Library Stats</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-stone-800">{books.length}</p>
              <p className="text-xs text-stone-400 mt-0.5">Books</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-stone-800">{sessions.length}</p>
              <p className="text-xs text-stone-400 mt-0.5">Sessions</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-stone-800">{totalDecisions}</p>
              <p className="text-xs text-stone-400 mt-0.5">Decisions</p>
            </div>
          </div>
        </div>

        {/* Data actions */}
        <div className="card divide-y divide-amber-50">
          <div className="px-1">
            <h2 className="section-label px-3 pt-4 pb-2">Data Management</h2>
          </div>
          <SettingRow
            icon={Download}
            label="Export Data"
            description="Download all books, sessions, and progress as a JSON backup file"
            onClick={exportData}
            variant="success"
          />
          <SettingRow
            icon={Upload}
            label="Import Data"
            description="Restore from a previously exported JSON backup file"
            onClick={() => fileInputRef.current?.click()}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={handleImport}
          />
        </div>

        {/* Import status */}
        {importStatus && (
          <div className={`rounded-xl p-3 text-sm font-medium text-center animate-fade-in ${
            importStatus === 'success'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
              : 'bg-red-50 text-red-600 border border-red-100'
          }`}>
            {importStatus === 'success' ? '✓ Data imported successfully' : '✕ Import failed — invalid file'}
          </div>
        )}

        {/* Danger zone */}
        <div className="card divide-y divide-amber-50">
          <div className="px-1">
            <h2 className="section-label px-3 pt-4 pb-2 text-red-400">Danger Zone</h2>
          </div>
          <SettingRow
            icon={Trash2}
            label="Clear All Data"
            description="Permanently delete all books, sessions, and tracking data"
            onClick={() => setShowClearConfirm(true)}
            variant="danger"
          />
        </div>

        {/* About */}
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-stone-800 rounded-xl flex items-center justify-center">
              <BookOpen size={18} className="text-amber-50" />
            </div>
            <div>
              <p className="font-semibold text-stone-800 text-sm">Path Tracker - by Alura Books</p>
              <p className="text-xs text-stone-400">v1.0 · Your Interactive thriller novel companion</p>
            </div>
          </div>
          <p className="text-xs text-stone-400 leading-relaxed">
            Track your choose-your-own-adventure journeys. All data is stored locally on your device — nothing is uploaded anywhere.
          </p>
        </div>

        <div className="flex items-center gap-2 justify-center">
          <Database size={12} className="text-stone-300" />
          <p className="text-xs text-stone-300">All data stored locally in your browser</p>
        </div>
      </div>

      {/* Clear confirm modal */}
      <Modal isOpen={showClearConfirm} onClose={() => setShowClearConfirm(false)} title="Clear All Data?">
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3 p-3 bg-red-50 rounded-xl">
            <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 leading-snug">
              This will permanently delete all <strong>{books.length} books</strong>, <strong>{sessions.length} sessions</strong>, and all tracking data. This cannot be undone.
            </p>
          </div>
          <p className="text-sm text-stone-500">Consider exporting a backup first.</p>
          <div className="flex gap-3">
            <button onClick={() => setShowClearConfirm(false)} className="btn-secondary flex-1">Cancel</button>
            <button
              onClick={handleClear}
              className="flex-1 bg-red-500 text-white rounded-xl px-5 py-3 font-medium text-sm active:scale-95 transition-all"
            >
              Delete Everything
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
