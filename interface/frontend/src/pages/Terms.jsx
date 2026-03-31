import Card from '../components/Card'
import SectionHeader from '../components/SectionHeader'

export default function Terms() {
  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Terms"
        title="Terms of Service"
        description="These terms outline how you can use the Cafeteria Menu Advisor."
      />

      <Card className="bg-white/90">
        <div className="space-y-4 text-sm text-ink/70">
          <p>
            By using this application, you agree to use it for personal, educational, and cafeteria
            planning purposes. The recommendations are advisory and based on the knowledge base
            rules at the time of your request.
          </p>
          <p>
            OptiTech Solutions is not liable for dietary outcomes or decisions made based on the
            recommendations. Always verify ingredients and allergens with cafeteria staff.
          </p>
          <p>
            We may update the knowledge base and UI features periodically. Continued use of the
            application means you accept any updates to these terms.
          </p>
        </div>
      </Card>
    </div>
  )
}
