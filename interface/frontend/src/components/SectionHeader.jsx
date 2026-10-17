export default function SectionHeader({ eyebrow, title, description, align = 'left' }) {
  const alignClass = align === 'center' ? 'text-center' : 'text-left'

  return (
    <div className={`space-y-1.5 ${alignClass}`}>
      {eyebrow && (
        <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full mb-1">
          {eyebrow}
        </span>
      )}
      <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{title}</h2>
      {description && <p className="text-sm text-slate-500 max-w-2xl">{description}</p>}
    </div>
  )
}
