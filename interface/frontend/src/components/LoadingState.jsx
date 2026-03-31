export default function LoadingState({ label = 'Loading' }) {
  return (
    <div className="flex items-center gap-3 text-sm text-ink/60">
      <span className="h-3 w-3 animate-pulse rounded-full bg-saffron" />
      <span>{label}</span>
    </div>
  )
}
