import { Link } from 'react-router-dom'
import Card from '../components/Card'

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl">
      <Card className="bg-white/90 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-ink/40">404</p>
        <h2 className="mt-3 text-3xl font-semibold text-ink">Page not found</h2>
        <p className="mt-2 text-sm text-ink/60">
          The page you are looking for does not exist. Return to the dashboard to continue.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center rounded-full bg-ink px-5 py-2 text-sm font-semibold text-white shadow-card transition hover:-translate-y-0.5"
        >
          Go to dashboard
        </Link>
      </Card>
    </div>
  )
}
