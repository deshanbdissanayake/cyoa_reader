export default function EmptyState({ emoji, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center animate-fade-in">
      <div className="text-5xl mb-4">{emoji}</div>
      <h3 className="text-lg font-semibold text-stone-700 mb-2">{title}</h3>
      <p className="text-sm text-stone-400 leading-relaxed mb-6 max-w-xs">{description}</p>
      {action}
    </div>
  )
}
