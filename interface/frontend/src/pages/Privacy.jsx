import Card from '../components/Card'
import SectionHeader from '../components/SectionHeader'

export default function Privacy() {
  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Privacy"
        title="Privacy Policy"
        description="We respect your data and keep your preferences local." 
      />

      <Card className="bg-white/90">
        <div className="space-y-4 text-sm text-ink/70">
          <p>
            Your login session and recommendation preferences are stored locally in your browser to
            personalize your experience. We do not share personal data with third parties.
          </p>
          <p>
            Recommendation data is sent to the backend only to generate meal suggestions and
            explanations. You can clear your browser storage at any time to remove saved data.
          </p>
          <p>
            If this application is deployed in production, this policy will be updated with hosting
            and analytics details.
          </p>
        </div>
      </Card>
    </div>
  )
}
