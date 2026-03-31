export default function Card({ children, className = '' }) {
  return (
    <div
      className={`rounded-3xl border border-white/70 bg-white/85 p-6 shadow-card backdrop-blur ${className}`}
    >
      {children}
    </div>
  )
}
