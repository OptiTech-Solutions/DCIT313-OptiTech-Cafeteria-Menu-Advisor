import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import { loadActivity } from '../utils/activity'
import Card from '../components/Card'
import SectionHeader from '../components/SectionHeader'
import ShowcaseCard from '../components/ShowcaseCard'
import mealPlanning from '../assets/meal-planning-trello.jpg'

export default function Dashboard() {
  const { user } = useAuth()
  const firstName = user?.name?.split(' ')[0] || 'Friend'
  const activity = loadActivity()
  const [activeActivity, setActiveActivity] = useState(null)

  return (
    <div className="space-y-10">
      <section className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-6">
          <SectionHeader
            eyebrow="Dashboard"
            title={`Welcome back, ${firstName} \uD83D\uDC4B`}
            description="Your expert system is ready to recommend balanced, delicious meals based on your goals and preferences."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="flex flex-col justify-between gap-6 bg-white/90">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-ink/40">Quick Action</p>
                <h3 className="mt-2 text-xl font-semibold text-ink">Get Recommendation</h3>
                <p className="mt-2 text-sm text-ink/60">
                  Answer a few questions and receive meal suggestions with clear reasoning.
                </p>
              </div>
              <Link
                to="/recommendations"
                className="inline-flex w-fit items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white shadow-card transition hover:-translate-y-0.5"
              >
                Start now
              </Link>
            </Card>
            <Card className="flex flex-col justify-between gap-6 bg-white/90">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-ink/40">Plan Ahead</p>
                <h3 className="mt-2 text-xl font-semibold text-ink">Generate Weekly Plan</h3>
                <p className="mt-2 text-sm text-ink/60">
                  Build a 7-day plan tailored to your dietary profile and cafeteria availability.
                </p>
              </div>
              <Link
                to="/weekly-plan"
                className="inline-flex w-fit items-center gap-2 rounded-full border border-ink/20 px-4 py-2 text-sm font-semibold text-ink/70 transition hover:border-ink/40 hover:text-ink"
              >
                Create plan
              </Link>
            </Card>
          </div>
        </div>

        <ShowcaseCard
          eyebrow="Insight"
          title="Smart Meal Insights"
          description="Connect your preferences with Prolog-backed rules to unlock healthier, tastier choices."
          tone="warm"
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <Card className="flex flex-col gap-4 bg-white/90">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-ink">Recent Activity</h3>
            <span className="text-xs uppercase tracking-[0.3em] text-ink/40">Last 5</span>
          </div>
          {activity.length === 0 ? (
            <p className="text-sm text-ink/60">
              No recent activity yet. Your new recommendations and weekly plans will show up here.
            </p>
          ) : (
            <div className="space-y-3">
              {activity.map((item, index) => (
                <button
                  type="button"
                  key={`${item.title}-${index}`}
                  onClick={() => setActiveActivity(item)}
                  className="flex w-full items-start justify-between rounded-2xl border border-ink/10 bg-white px-4 py-3 text-left transition hover:-translate-y-0.5 hover:border-ink/20"
                >
                  <div>
                    <p className="text-sm font-semibold text-ink">{item.title}</p>
                    <p className="text-xs text-ink/50">{item.subtitle}</p>
                  </div>
                  <span className="text-xs font-semibold text-ink/40">{item.time}</span>
                </button>
              ))}
            </div>
          )}
        </Card>

        <ShowcaseCard
          eyebrow="Planner"
          title="Weekly Rhythm"
          description="Keep your cafeteria choices on track with structured meal plans for every day."
          tone="blush"
          images={[mealPlanning]}
          imageSize="h-70 w-70 md:h-74 md:w-74"
          imageRounded="rounded-[36px]"
          imageWrapperClass="p-6"
        />
      </section>

      {activeActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-soft">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-ink/40">Activity</p>
                <h3 className="mt-2 text-xl font-semibold text-ink">{activeActivity.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveActivity(null)}
                className="text-sm font-semibold text-ink/60"
              >
                Close
              </button>
            </div>
            <div className="mt-4 space-y-2 text-sm text-ink/70">
              <p>{activeActivity.subtitle}</p>
              <p className="text-xs uppercase tracking-[0.3em] text-ink/40">Time</p>
              <p className="text-sm text-ink/70">{activeActivity.time}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
