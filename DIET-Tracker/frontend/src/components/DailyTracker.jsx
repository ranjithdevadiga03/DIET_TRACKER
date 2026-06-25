const NUTRIENTS = [
  { label: "Calories", key: "calories", unit: " kcal", color: '#10b981' },
  { label: "Protein", key: "protein", unit: "g", color: '#3b82f6' },
  { label: "Carbs", key: "carbs", unit: "g", color: '#f59e0b' },
  { label: "Fat", key: "fat", unit: "g", color: '#f97316' },
]

function ProgressBar({ label, consumed, goal, unit, color }) {
  const pct = goal > 0 ? Math.min((consumed / goal) * 100, 100) : 0
  const remaining = Math.max(goal - consumed, 0)
  const over = consumed > goal
  const complete = pct >= 100
  const barPct = over ? 100 : pct

  return (
    <div className="mb-5 last:mb-0">
      <div className="flex justify-between items-center mb-2">
        <span className="text-lg font-semibold text-slate-600">{label}</span>
        <div className="flex items-baseline gap-1.5">
          <span className="text-lg font-bold" style={{ color: complete ? '#16a34a' : '#2d3748' }}>
            {Math.round(consumed)}
          </span>
          <span className="text-base text-slate-400">/ {goal}{unit}</span>
        </div>
      </div>
      <div className="relative w-full rounded-full h-4 overflow-hidden" style={{ background: '#ffffff' }}>
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${barPct}%`,
            background: complete
              ? 'linear-gradient(to right, #16a34a, #22c55e)'
              : `linear-gradient(to right, ${color}, ${color}bb)`,
          }}
        />
        {pct > 0 && !complete && (
          <div className="absolute inset-y-0 left-0 rounded-full overflow-hidden" style={{ width: `${barPct}%` }}>
            <div className="absolute inset-0 shimmer" />
          </div>
        )}
        {complete && (
          <div className="absolute inset-y-0 left-0 rounded-full overflow-hidden" style={{ width: `${barPct}%` }}>
            <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, transparent 25%, rgba(255,255,255,0.3) 50%, transparent 75%)', backgroundSize: '200% 100%', animation: 'shimmer 2s linear infinite' }} />
          </div>
        )}
      </div>
      <div className="flex justify-between mt-1.5">
        <p className="text-sm" style={{ color: over ? '#ef4444' : complete ? '#16a34a' : '#94a3b8' }}>
          {over ? `${Math.round(consumed - goal)}${unit} over` : `${Math.round(remaining)}${unit} left`}
        </p>
        {complete ? (
          <span className="text-sm font-bold" style={{ color: '#16a34a' }}>✓</span>
        ) : (
          <p className="text-sm text-slate-400">{Math.round(pct)}%</p>
        )}
      </div>
    </div>
  )
}

function DailyTracker({ goals, consumed }) {
  if (!goals) return null
  const allComplete = NUTRIENTS.every((n) => goals[n.key] > 0 && consumed[n.key] >= goals[n.key])
  const pct = NUTRIENTS.map((n) => goals[n.key] > 0 ? Math.min((consumed[n.key] / goals[n.key]) * 100, 100) : 0)
  const overallPct = Math.round(pct.reduce((a, b) => a + b, 0) / pct.length)

  return (
    <div className="p-6 animate-fade-in-up hover:scale-[1.01] transition-all duration-300 box-glow"
      style={{
        background: allComplete ? 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(34,197,94,0.08))' : 'rgba(255,255,255,0.9)',
        border: allComplete ? '1.5px solid rgba(34,197,94,0.4)' : '1px solid rgba(147,197,253,0.4)',
        borderRadius: '16px',
        boxShadow: allComplete ? '0 4px 16px rgba(16,185,129,0.12), 0 12px 40px rgba(16,185,129,0.08)' : '0 4px 16px rgba(59,130,246,0.1), 0 12px 40px rgba(59,130,246,0.08)',
        backdropFilter: 'blur(12px)', animationDelay: '0.3s',
      }}>
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg" style={{
          background: allComplete ? 'linear-gradient(135deg, #10b981, #22c55e)' : 'linear-gradient(135deg, #06b6d4, #10b981)',
          boxShadow: allComplete ? '0 4px 12px rgba(16,185,129,0.3)' : '0 4px 12px rgba(6,182,212,0.2)',
        }}>
          {allComplete ? (
            <svg className="w-6 h-6 text-white animate-check-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          )}
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-slate-700">Daily Progress</h2>
          <p className="text-base text-slate-400">Track your nutritional intake</p>
        </div>
        {allComplete && (
          <div className="completion-badge animate-bounce-in">
            <span className="text-3xl">🎉</span>
          </div>
        )}
      </div>
      {allComplete && (
        <div className="mb-5 p-4 rounded-xl animate-fade-in" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(34,197,94,0.1))', border: '1px solid rgba(34,197,94,0.2)' }}>
          <div className="flex items-center gap-3">
            <div className="animated-check">
              <svg className="w-8 h-8" viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="20" r="18" stroke="#22c55e" strokeWidth="2.5" fill="rgba(34,197,94,0.1)" className="check-circle" />
                <path d="M12 20 L18 26 L28 14" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="check-mark" fill="none" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-green-700 text-lg">Daily Goals Complete!</p>
              <p className="text-sm text-green-600">{overallPct}% overall intake reached</p>
            </div>
          </div>
        </div>
      )}
      {NUTRIENTS.map((n) => (
        <ProgressBar key={n.key} label={n.label} consumed={consumed[n.key]} goal={goals[n.key]} unit={n.unit} color={n.color} />
      ))}
    </div>
  )
}

export default DailyTracker
