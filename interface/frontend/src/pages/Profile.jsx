import Card from '../components/Card'
import SectionHeader from '../components/SectionHeader'
import { useAuth } from '../hooks/useAuth.jsx'

export default function Profile() {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Profile"
        title="Your cafeteria profile"
        description="Review the account details tied to your expert system experience."
      />

      <Card className="bg-white/90">
        <div className="space-y-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-ink/40">Name</p>
            <p className="text-sm font-semibold text-ink">{user?.name || 'Guest User'}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-ink/40">Email</p>
            <p className="text-sm font-semibold text-ink">{user?.email || 'Not provided'}</p>
          </div>
          <p className="text-sm text-ink/60">
            Profile editing can be enabled once the backend exposes update endpoints.
          </p>
        </div>
      </Card>
    </div>
  )
}
