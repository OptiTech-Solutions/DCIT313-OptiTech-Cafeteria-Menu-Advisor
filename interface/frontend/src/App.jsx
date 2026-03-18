import { useState } from 'react';
import ProfileForm from './components/ProfileForm';
import StepWizard  from './components/StepWizard';
import Results     from './components/Results';
import { STEPS }   from './data/meals';
import { runInference } from './utils/inference';

export default function App() {
  const [profile,      setProfile]      = useState(null);
  const [stepIndex,    setStepIndex]    = useState(0);
  const [prefs,        setPrefs]        = useState({});
  const [results,      setResults]      = useState(null);
  const [selected,     setSelected]     = useState(null);
  const [transitioning,setTransitioning]= useState(false);

  const isLast = stepIndex === STEPS.length - 1;

  const handleProfileComplete = (data) => setProfile(data);

  const handleNext = () => {
    if (!selected) return;
    const newPrefs = { ...prefs, [STEPS[stepIndex]]: selected };
    setPrefs(newPrefs);
    setTransitioning(true);
        setTimeout(async () => {
          if (isLast) {
            setTransitioning(true); // Keep loading during async
            const apiResults = await runInference(newPrefs);
            setResults(apiResults);
          } else {
            setStepIndex(i => i + 1);
            setSelected(null);
          }
          setTransitioning(false);
        }, 200);
  };

  const handleBack = () => {
    if (stepIndex === 0) {
      setProfile(null);
      return;
    }
    setStepIndex(i => i - 1);
    setSelected(prefs[STEPS[stepIndex - 1]] || null);
  };

  const handleReset = () => {
    setProfile(null);
    setStepIndex(0);
    setPrefs({});
    setSelected(null);
    setResults(null);
  };

  return (
    <div className=" md:grid md:grid-cols-2 justify-center items-center min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex flex-col">

      {/* ── Header ── */}
      <header className="pt-8 pb-2 px-4 text-center fade-up">
        <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur rounded-full px-4 py-1.5 text-xs font-medium text-orange-600 border border-orange-100 mb-4">
          Optitech Solutions Expert System  
        </div>
        <h1 className="display-font text-3xl md:text-4xl text-gray-800 leading-tight">
          Cafeteria Menu<br />Advisor
        </h1>
        <p className="text-gray-400 text-sm mt-2">
          Smart meal recommendations powered by Prolog inference
        </p>
      </header>

      {/* ── Main ── */}
      <main className=" items-center justify-center px-4 py-2">
        <div className="w-full max-w-md">

          {/* Phase 1 — Profile */}
          {!profile && (
            <ProfileForm onComplete={handleProfileComplete} />
          )}

          {/* Phase 2 — Steps */}
          {profile && !results && (
            <StepWizard
              profile={profile}
              stepIndex={stepIndex}
              selected={selected}
              transitioning={transitioning}
              onSelect={setSelected}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {/* Phase 3 — Results */}
          {profile && results && (
            <Results
              profile={profile}
              prefs={prefs}
              results={results}
              onReset={handleReset}
            />
          )}

        </div>
      </main>

    </div>
  );
}
