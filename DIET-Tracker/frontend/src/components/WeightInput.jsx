import { useState } from "react"

function WeightInput({ onWeightSet }) {
  const [weight, setWeight] = useState(() => localStorage.getItem("bodyWeight") || "")
  const [unit, setUnit] = useState(() => localStorage.getItem("weightUnit") || "kg")

  const handleSubmit = (e) => {
    e.preventDefault()
    const val = parseFloat(weight); if (val <= 0) return
    localStorage.setItem("bodyWeight", weight); localStorage.setItem("weightUnit", unit)
    onWeightSet(unit === "lbs" ? val * 0.453592 : val)
  }

  const handleUnitChange = (newUnit) => {
    if (newUnit === unit) return
    const val = parseFloat(weight)
    if (isNaN(val) || val <= 0) { setUnit(newUnit); return }
    setWeight(String(newUnit === "lbs" ? Math.round(val * 2.20462) : Math.round(val * 0.453592)))
    setUnit(newUnit)
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-3">
      <div className="relative flex-1">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.97zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.97z" />
          </svg>
        </div>
        <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)}
          placeholder={`Weight (${unit})`} min="1" max="500"
          className="w-full rounded-xl px-4 py-3.5 pl-12 text-base transition-all"
          style={{ background: 'rgba(191,219,254,0.25)', border: '2px solid rgba(147,197,253,0.4)', color: '#1e293b' }} />
      </div>
      <select value={unit} onChange={(e) => handleUnitChange(e.target.value)}
        className="rounded-xl px-4 py-3.5 text-base transition-all cursor-pointer"
        style={{ background: 'rgba(191,219,254,0.25)', border: '2px solid rgba(147,197,253,0.4)', color: '#64748b' }}>
        <option value="kg">kg</option>
        <option value="lbs">lbs</option>
      </select>
      <button type="submit"
        className="px-8 py-3.5 rounded-xl font-semibold text-white transition-all btn-press text-base"
        style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)', boxShadow: '0 4px 16px rgba(99,102,241,0.2)' }}>
        Set
      </button>
    </form>
  )
}

export default WeightInput
