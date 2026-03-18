import { useState, useRef } from 'react';

export default function ProfileForm({ onComplete }) {
  const [form, setForm]     = useState({ name: '', age: '', weight: '', allergies: [] });
  const [errors, setErrors] = useState({});
  const nameRef             = useRef(null);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const validate = () => {
    const e = {};
    if (!form.name.trim())
      e.name = 'Please enter your name';
    if (!form.age || isNaN(form.age) || +form.age < 5 || +form.age > 120)
      e.age = 'Enter a valid age (5–120)';
    if (!form.weight || isNaN(form.weight) || +form.weight < 20 || +form.weight > 300)
      e.weight = 'Enter a valid weight (20–300 kg)';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) onComplete(form);
  };

  return (
    <div className="bg-white/80 backdrop-blur rounded-3xl shadow-lg shadow-orange-100 border border-white p-6 fade-up">
      {/* Greeting */}
      <div className="text-center mb-6">
        
        <h2 className="display-font text-2xl text-gray-800">Let's get to know you</h2>
        <p className="text-sm text-gray-400 mt-1">A few quick details before your personalised meal plan</p>
      </div>

      <div className="flex flex-col gap-4">
        {/* Name */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
            Your Name
          </label>
          <input
            ref={nameRef}
            type="text"
            placeholder="e.g. Barbara"
            value={form.name}
            onChange={e => set('name', e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            className={`w-full px-4 py-3 rounded-xl border-2 text-sm text-gray-800 outline-none transition-all bg-white
              ${errors.name
                ? 'border-rose-300 focus:border-rose-400'
                : 'border-gray-100 focus:border-orange-300'}`}
          />
          {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name}</p>}
        </div>

        {/* Age + Weight side by side */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Age</label>
            <div className="relative">
              <input
                type="number"
                placeholder="e.g. 21"
                value={form.age}
                onChange={e => set('age', e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border-2 text-sm text-gray-800 outline-none transition-all bg-white pr-12
                  ${errors.age
                    ? 'border-rose-300 focus:border-rose-400'
                    : 'border-gray-100 focus:border-orange-300'}`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-300 font-medium">yrs</span>
            </div>
            {errors.age && <p className="text-xs text-rose-500 mt-1">{errors.age}</p>}
          </div>

          <div className="flex-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Weight</label>
            <div className="relative">
              <input
                type="number"
                placeholder="e.g. 65"
                value={form.weight}
                onChange={e => set('weight', e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border-2 text-sm text-gray-800 outline-none transition-all bg-white pr-10
                  ${errors.weight
                    ? 'border-rose-300 focus:border-rose-400'
                    : 'border-gray-100 focus:border-orange-300'}`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-300 font-medium">kg</span>
            </div>
            {errors.weight && <p className="text-xs text-rose-500 mt-1">{errors.weight}</p>}
          </div>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        className="w-full mt-6 py-3.5 rounded-xl bg-orange-400 hover:bg-orange-500 text-white font-semibold text-sm shadow-md shadow-orange-200 active:scale-95 transition-all duration-200"
      >
        Continue →
      </button>
    </div>
  );
}
