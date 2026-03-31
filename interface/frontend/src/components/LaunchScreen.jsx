import RotatingMealImage from './RotatingMealImage'
import { MEAL_IMAGE_POOL } from '../utils/mealImages'

export default function LaunchScreen({ phase = 'enter' }) {
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-[#14110E] text-white launch-screen ${
        phase === 'exit' ? 'launch-exit' : ''
      }`}
    >
      <div className="relative mx-auto flex w-full max-w-4xl flex-col items-center px-6 text-center">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-saffron/30 blur-3xl" />
          <div className="absolute bottom-[-20%] right-10 h-72 w-72 rounded-full bg-berry/20 blur-3xl" />
          <div className="absolute bottom-10 left-10 h-60 w-60 rounded-full bg-leaf/20 blur-3xl" />
        </div>

        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/10 shadow-soft backdrop-blur">
          <span className="text-2xl font-semibold tracking-[0.3em]">OA</span>
        </div>
        <h1 className="mt-6 display-font text-4xl text-white md:text-5xl">
          Cafeteria Menu Advisor
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-white/70 md:text-base">
          Loading your personalized dining experience powered by Prolog inference.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {MEAL_IMAGE_POOL.slice(0, 3).map((_, index) => (
            <div
              key={`launch-${index}`}
              className="flex flex-col items-center gap-4 rounded-3xl border border-white/10 bg-white/5 px-6 py-6"
            >
              <RotatingMealImage images={MEAL_IMAGE_POOL} interval={4200} sizeClass="h-24 w-24" />
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                Curated meals
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 h-1 w-24 rounded-full bg-white/20" />
      </div>
    </div>
  )
}
