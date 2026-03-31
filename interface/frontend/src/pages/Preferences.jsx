import Card from '../components/Card'
import SectionHeader from '../components/SectionHeader'

export default function Preferences() {
  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Preferences"
        title="Personalize your recommendations"
        description="Store default dietary preferences once the backend supports preferences."
      />

      <Card className="bg-white/90">
        <div className="space-y-3 text-sm text-ink/60">
          <p>
            Preference storage will allow you to pre-fill the recommendation form with your usual
            choices.
          </p>
          <p>
            For now, you can update your preferences each time you request a recommendation.
          </p>
        </div>
      </Card>
    </div>
  )
}
