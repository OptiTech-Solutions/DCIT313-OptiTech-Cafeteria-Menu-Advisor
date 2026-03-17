import { STEPS, STEP_CONFIG } from '../data/meals';

function StepIndicator({ current, total }) {
  return (
    <div className="flex items-center gap-1 justify-center mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 rounded-full transition-all duration-500 ${
            i < current
              ? 'bg-green-500 w-8'
              : i === current
              ? 'bg-orange-400 w-8'
              : 'bg-gray-200 w-4'
          }`}
        />
      ))}
    </div>
  );
}

function OptionCard({ option, selected, onClick }) {
  return (
    <button
      onClick={() => onClick(option.value)}
      className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl border-2 transition-all duration-200 text-left
        ${selected
          ? 'border-orange-400 bg-orange-50 shadow-md scale-[1.01]'
          : 'border-gray-100 bg-white hover:border-orange-200 hover:bg-orange-50/40 hover:shadow-sm'}`}
    >
      <span className="text-3xl flex-shrink-0">{option.icon}</span>
      <div className="flex-1 min-w-0">
        <div className={`font-semibold text-sm tracking-wide ${selected ? 'text-orange-700' : 'text-gray-800'}`}>
          {option.label}
        </div>
        <div className="text-xs text-gray-400 mt-0.5 truncate">{option.desc}</div>
      </div>
      <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all
        ${selected ? 'border-orange-400 bg-orange-400' : 'border-gray-300'}`}>
        {selected && <div className="w-2 h-2 rounded-full bg-white" />}
      </div>
    </button>
  );
}

export default function StepWizard({
  profile, stepIndex, selected, transitioning,
  onSelect, onNext, onBack,
}) {
  const firstName   = profile.name.trim().split(' ')[0];
  const currentStep = STEPS[stepIndex];
  const config      = STEP_CONFIG[currentStep];
  const isLast      = stepIndex === STEPS.length - 1;

  return (
    <div
      key={currentStep}
      className={`bg-white/80 backdrop-blur rounded-3xl shadow-lg shadow-orange-100 border border-white p-6 ${
        transitioning ? 'opacity-0' : 'fade-up'
      }`}
    >
      {/* Personalised greeting strip */}
      <div className="flex items-center gap-3 bg-orange-50 rounded-2xl px-4 py-3 mb-5">
        <div className="w-9 h-9 rounded-full bg-orange-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          {firstName[0]?.toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-semibold text-orange-700">Hi, {firstName}! 👋</p>
          <p className="text-xs text-orange-400">
            {profile.age} yrs · {profile.weight} kg
            {profile.allergies.length > 0
              ? ` · allergic to ${profile.allergies.join(', ')}`
              : ''}
          </p>
        </div>
      </div>

      <StepIndicator current={stepIndex} total={STEPS.length} />

      <div className="mb-6">
        <p className="text-xs font-semibold text-orange-400 uppercase tracking-widest mb-1">
          Step {stepIndex + 1} of {STEPS.length}
        </p>
        <h2 className="display-font text-2xl text-gray-800">{config.label}</h2>
        <p className="text-sm text-gray-400 mt-1">{config.sub}</p>
      </div>

      <div className="flex flex-col gap-2.5 mb-6">
        {config.options.map(opt => (
          <OptionCard
            key={opt.value}
            option={opt}
            selected={selected === opt.value}
            onClick={onSelect}
          />
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-500 font-medium text-sm hover:border-gray-300 hover:bg-gray-50 transition-all"
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          disabled={!selected}
          className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all duration-200
            ${selected
              ? 'bg-orange-400 hover:bg-orange-500 text-white shadow-md shadow-orange-200 active:scale-95'
              : 'bg-gray-100 text-gray-300 cursor-not-allowed'}`}
        >
          {isLast ? 'Get My Meals →' : 'Continue →'}
        </button>
      </div>
    </div>
  );
}
