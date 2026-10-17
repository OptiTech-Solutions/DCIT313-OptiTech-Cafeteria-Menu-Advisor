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
            title={`Welcome back, ${firstName}!`}
            description="Your expert system is ready to recommend balanced, delicious meals based on your goals and preferences."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="flex flex-col justify-between gap-6 border-slate-200/80 bg-white/95">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  Quick Inference
                </span>
                <h3 className="mt-3 text-lg font-bold text-slate-900">Get Recommendation</h3>
                <p className="mt-1.5 text-sm text-slate-500">
                  Query the SWI-Prolog Horn clause engine for top meal candidates with explanations.
                </p>
              </div>
              <Link
                to="/recommendations"
                className="inline-flex w-fit items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
              >
                <span>Find Meals</span>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </Card>
            <Card className="flex flex-col justify-between gap-6 border-slate-200/80 bg-white/95">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
                  7-Day Schedule
                </span>
                <h3 className="mt-3 text-lg font-bold text-slate-900">Generate Weekly Plan</h3>
                <p className="mt-1.5 text-sm text-slate-500">
                  Build a full weekly schedule with one-click meal swapping and PDF export.
                </p>
              </div>
              <Link
                to="/weekly-plan"
                className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
              >
                <span>Create Plan</span>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
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
        <Card className="flex flex-col gap-4 border-slate-200/80 bg-white/95">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Recent Activity</h3>
            <span className="text-xs uppercase tracking-wider text-slate-400">Last 5</span>
          </div>
          {activity.length === 0 ? (
            <p className="text-sm text-slate-500">
              No recent activity yet. Your generated recommendations and weekly plans will appear here.
            </p>
          ) : (
            <div className="space-y-2.5">
              {activity.map((item, index) => (
                <button
                  type="button"
                  key={`${item.title}-${index}`}
                  onClick={() => setActiveActivity(item)}
                  className="flex w-full items-start justify-between rounded-xl border border-slate-200/70 bg-slate-50/50 px-4 py-3 text-left transition hover:border-slate-300 hover:bg-slate-50"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                    <p className="text-xs text-slate-500">{item.subtitle}</p>
                  </div>
                  <span className="text-xs font-medium text-slate-400">{item.time}</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Activity Log</p>
                <h3 className="mt-1 text-lg font-bold text-slate-900">{activeActivity.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveActivity(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <p>{activeActivity.subtitle}</p>
              <div className="rounded-lg bg-slate-50 p-3">
                <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Timestamp</span>
                <p className="mt-0.5 font-mono text-xs text-slate-700">{activeActivity.time}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
