export function FormField({ label, hint, error, children }) {
  return (
    <label className="flex flex-col gap-2 text-sm text-ink/70">
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/40">
        {label}
      </span>
      {children}
      {hint && !error && <span className="text-xs text-ink/40">{hint}</span>}
      {error && <span className="text-xs text-berry">{error}</span>}
    </label>
  )
}

export function TextInput({ value, onChange, placeholder, type = 'text', name }) {
  return (
    <input
      type={type}
      name={name}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink shadow-inner outline-none transition focus:border-ink/40"
    />
  )
}

export function SelectInput({ value, onChange, options, name }) {
  return (
    <select
      name={name}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink shadow-inner outline-none transition focus:border-ink/40"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}

export function TextArea({ value, onChange, placeholder, name, rows = 4 }) {
  return (
    <textarea
      name={name}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink shadow-inner outline-none transition focus:border-ink/40"
    />
  )
}
