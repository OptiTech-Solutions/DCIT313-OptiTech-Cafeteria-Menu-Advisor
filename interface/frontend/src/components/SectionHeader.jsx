export default function SectionHeader({ eyebrow, title, description, align = 'left' }) {
  const alignClass = align === 'center' ? 'text-center' : 'text-left'

  return (
    <div className={`space-y-2 ${alignClass}`}>
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-ink/40">
          {eyebrow}
        </p>
      )}
      <h2 className="display-font text-3xl font-semibold text-ink">{title}</h2>
      {description && <p className="text-sm text-ink/60">{description}</p>}
    </div>
  )
}
