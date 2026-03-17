import { MEAL_EMOJI, CAL_COLOR, BADGE_COLOR } from '../data/meals';

function MealCard({ meal, index }) {
  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex gap-4 items-start"
      style={{ animation: 'fadeUp 0.4s ease both', animationDelay: `${index * 80}ms` }}
    >
      <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-2xl flex-shrink-0">
        {MEAL_EMOJI[meal.type] || '🍽️'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-gray-800 text-sm leading-snug">{meal.name}</div>
        <div className="flex flex-wrap gap-1.5 mt-2">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${BADGE_COLOR[meal.badge] || 'bg-gray-100 text-gray-600'}`}>
            {meal.badge}
          </span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${CAL_COLOR[meal.cal]}`}>
            {meal.cal} cal
          </span>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 capitalize">
            {meal.type}
          </span>
        </div>
        <div className="text-xs text-gray-400 mt-1.5 italic">{meal.reason}</div>
      </div>
    </div>
  );
}

export default function Results({ profile, prefs, results, onReset }) {
  const firstName = profile.name.trim().split(' ')[0];

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="text-center mb-5">
        <div className="text-4xl mb-2">🎉</div>
        <h2 className="display-font text-2xl text-gray-800">Here you go, {firstName}!</h2>
        <p className="text-sm text-gray-400 mt-1">
          {results.length} meal{results.length !== 1 ? 's' : ''} matched your profile
        </p>
      </div>

      {/* Summary pills */}
      <div className="flex flex-wrap gap-1.5 justify-center mb-5">
        <span className="text-xs px-3 py-1 bg-orange-100 text-orange-600 rounded-full font-medium">
          {profile.name}
        </span>
        <span className="text-xs px-3 py-1 bg-white border border-gray-200 rounded-full text-gray-500">
          {profile.age} yrs
        </span>
        <span className="text-xs px-3 py-1 bg-white border border-gray-200 rounded-full text-gray-500">
          {profile.weight} kg
        </span>
        {Object.entries(prefs).map(([k, v]) => (
          <span key={k} className="text-xs px-3 py-1 bg-white border border-gray-200 rounded-full text-gray-500 capitalize">
            {v.replace(/_/g, ' ')}
          </span>
        ))}
        {profile.allergies.map(a => (
          <span key={a} className="text-xs px-3 py-1 bg-rose-50 border border-rose-100 rounded-full text-rose-500 capitalize">
            ⚠️ {a}
          </span>
        ))}
      </div>

      {/* Meal cards */}
      <div className="flex flex-col gap-3 mb-5">
        {results.map((meal, i) => (
          <MealCard key={meal.id} meal={meal} index={i} />
        ))}
      </div>

      <button
        onClick={onReset}
        className="w-full py-3 rounded-xl border-2 border-orange-200 text-orange-500 font-semibold text-sm hover:bg-orange-50 transition-all"
      >
        ↺ Start Over
      </button>
    </div>
  );
}
