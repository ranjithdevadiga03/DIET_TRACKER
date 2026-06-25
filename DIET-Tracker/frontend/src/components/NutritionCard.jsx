import { useEffect, useState } from "react"

function AnimatedNumber({ value, duration = 600 }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    let start = 0; const end = Math.round(value)
    if (start === end) return
    const step = end / (duration / 16)
    const t = setInterval(() => { start += step; if (start >= end) { setDisplay(end); clearInterval(t) } else setDisplay(Math.round(start)) }, 16)
    return () => clearInterval(t)
  }, [value, duration])
  return <span>{display}</span>
}

function NutritionCard({ result }) {
  if (!result?.nutrition) return (
    <div className="card p-8 text-center"><p className="text-slate-400 text-lg">No nutrition data found</p></div>
  )
  const hasNutrition = result.nutrition.calories > 0 || result.nutrition.protein > 0
  const stats = [
    { label: "Calories", value: result.nutrition.calories, unit: "kcal", icon: "🔥", bg: 'rgba(239,68,68,0.06)', border: 'rgba(239,68,68,0.12)', text: "#ef4444" },
    { label: "Protein", value: result.nutrition.protein, unit: "g", icon: "💪", bg: 'rgba(59,130,246,0.06)', border: 'rgba(59,130,246,0.12)', text: "#3b82f6" },
    { label: "Carbs", value: result.nutrition.carbs, unit: "g", icon: "⚡", bg: 'rgba(245,158,11,0.06)', border: 'rgba(245,158,11,0.12)', text: "#f59e0b" },
    { label: "Fat", value: result.nutrition.fat, unit: "g", icon: "🫒", bg: 'rgba(16,185,129,0.06)', border: 'rgba(16,185,129,0.12)', text: "#10b981" },
  ]

  return (
    <div className="card p-6 animate-bounce-in">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg" style={{ background: 'linear-gradient(135deg, #06b6d4, #10b981)', boxShadow: '0 4px 16px rgba(6,182,212,0.2)' }}>🍽️</div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-slate-700 capitalize">{result.food?.replace(/_/g, ' ')}</h2>
          {result.confidence && <p className="text-base text-slate-500 mt-0.5">{result.confidence}% confidence</p>}
        </div>
        {!hasNutrition && (
          <span className="text-sm px-3 py-1.5 rounded-full font-semibold" style={{ background: 'rgba(245,158,11,0.08)', color: '#d97706', border: '1px solid rgba(245,158,11,0.15)' }}>Not in DB</span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4 stagger-children">
        {stats.map((s) => (
          <div key={s.label} className="p-5 rounded-2xl hover-lift" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{s.icon}</span>
              <p className="text-sm uppercase tracking-wider font-semibold" style={{ color: s.text, opacity: 0.7 }}>{s.label}</p>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-bold" style={{ color: s.text }}><AnimatedNumber value={s.value} /></span>
              <span className="text-base text-slate-400 font-medium">{s.unit}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default NutritionCard
