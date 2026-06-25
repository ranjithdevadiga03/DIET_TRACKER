import { useState } from "react"
import HistoryCalendar from "./HistoryCalendar"

function Profile({ user, onUpdate, onLogout, onClose, refreshTrigger }) {
  const [tab, setTab] = useState("profile")
  const [editing, setEditing] = useState(false)
  const [weight, setWeight] = useState(user?.weight_kg ? String(Math.round(user.weight_kg)) : "")
  const [msg, setMsg] = useState("")
  const [error, setError] = useState("")
  const initial = user?.username ? user.username.charAt(0).toUpperCase() : "?"

  const handleSave = async (e) => {
    e.preventDefault(); setMsg(""); setError("")
    try {
      await onUpdate(weight ? parseFloat(weight) : null, null)
      setMsg("Saved!")
      setEditing(false)
      setTimeout(() => setMsg(""), 2000)
    } catch (err) { setError(err.message) }
  }

  const goals = user?.weight_kg ? {
    calories: Math.round(user.weight_kg * 35),
    protein: Math.round(user.weight_kg * 1),
    carbs: Math.round(user.weight_kg * 4.5),
    fat: Math.round(user.weight_kg * 1),
  } : null

  return (
    <div className="animate-fade-in-up" style={{ maxWidth: '520px', width: '100%' }}>
      <div className="overflow-hidden" style={{ borderRadius: '24px', background: '#ffffff', border: 'none', boxShadow: '0 30px 80px rgba(0,0,0,0.25), 0 10px 30px rgba(0,0,0,0.15)' }}>

        {/* Header with gradient */}
        <div className="relative" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #334155 100%)', padding: '40px 32px 32px' }}>
          {/* Decorative blobs */}
          <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full" style={{ background: 'rgba(99,102,241,0.12)' }} />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full" style={{ background: 'rgba(6,182,212,0.08)' }} />
          <div className="absolute top-6 right-20 w-20 h-20 rounded-full" style={{ background: 'rgba(139,92,246,0.08)' }} />

          <div className="relative z-10">
            <div className="flex items-center gap-5">
              {/* Avatar */}
              <div className="flex-shrink-0 flex items-center justify-center font-bold text-4xl" style={{ width: '88px', height: '88px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 12px 32px rgba(99,102,241,0.45)', borderRadius: '28px', color: '#fff', border: '3px solid rgba(255,255,255,0.15)' }}>
                {initial}
              </div>

              <div className="flex-1">
                {/* Username */}
                <h3 className="text-2xl font-extrabold tracking-tight text-white mb-1">{user?.username}</h3>

                {/* Weight badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mt-1" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <span className="text-sm font-medium" style={{ color: '#94a3b8' }}>{user?.weight_kg ? `${user.weight_kg} kg` : "No weight set"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-5">
          <div className="flex rounded-xl p-1" style={{ background: '#f1f5f9' }}>
            <button onClick={() => setTab("profile")} className="flex-1 py-3 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2" style={tab === "profile" ? { background: '#ffffff', color: '#6366f1', boxShadow: '0 1px 6px rgba(0,0,0,0.08)' } : { color: '#94a3b8' }}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
              Profile
            </button>
            <button onClick={() => setTab("history")} className="flex-1 py-3 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2" style={tab === "history" ? { background: '#ffffff', color: '#6366f1', boxShadow: '0 1px 6px rgba(0,0,0,0.08)' } : { color: '#94a3b8' }}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
              History
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          {tab === "profile" ? (
            <div className="space-y-4">
              {!editing ? (
                <>
                  {/* Daily Goals */}
                  {goals && (
                    <div className="rounded-2xl p-5" style={{ background: 'linear-gradient(135deg, #f8fafc, #eff6ff)', border: '1px solid #e2e8f0', boxShadow: '0 2px 12px rgba(99,102,241,0.06)' }}>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </div>
                        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#64748b' }}>Daily Goals</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { label: 'Calories', value: goals.calories, unit: 'kcal', color: '#6366f1', gradient: 'linear-gradient(135deg, #6366f1, #818cf8)', shadow: 'rgba(99,102,241,0.3)', icon: '🔥' },
                          { label: 'Protein', value: goals.protein, unit: 'g', color: '#8b5cf6', gradient: 'linear-gradient(135deg, #8b5cf6, #a78bfa)', shadow: 'rgba(139,92,246,0.3)', icon: '💪' },
                          { label: 'Carbs', value: goals.carbs, unit: 'g', color: '#06b6d4', gradient: 'linear-gradient(135deg, #06b6d4, #22d3ee)', shadow: 'rgba(6,182,212,0.3)', icon: '⚡' },
                          { label: 'Fat', value: goals.fat, unit: 'g', color: '#10b981', gradient: 'linear-gradient(135deg, #10b981, #34d399)', shadow: 'rgba(16,185,129,0.3)', icon: '🥑' },
                        ].map(g => (
                          <div key={g.label} className="rounded-2xl p-4 transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1 cursor-default" style={{ background: g.gradient, boxShadow: `0 4px 16px ${g.shadow}, 0 8px 24px ${g.shadow}` }}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xl">{g.icon}</span>
                            </div>
                            <p className="text-3xl font-extrabold text-white">{g.value}<span className="text-sm font-semibold ml-1 opacity-70">{g.unit}</span></p>
                            <p className="text-sm font-semibold mt-1 text-white opacity-75">{g.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="space-y-3">
                    <button onClick={() => setEditing(true)} className="w-full py-4 rounded-xl text-base font-semibold text-white btn-press flex items-center justify-center gap-2.5 transition-all hover:scale-[1.01]" style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', boxShadow: '0 6px 20px rgba(15,23,42,0.35)' }}>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
                      Update Weight
                    </button>
                    <button onClick={onLogout} className="w-full py-4 rounded-xl text-base font-semibold btn-press flex items-center justify-center gap-2.5 transition-all hover:scale-[1.01]" style={{ background: 'linear-gradient(135deg, #fef2f2, #fee2e2)', color: '#ef4444', border: '1px solid #fecaca' }}>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <form onSubmit={handleSave} className="space-y-4">
                  <div>
                    <label className="text-sm font-bold mb-3 block uppercase tracking-wider" style={{ color: '#94a3b8' }}>Body Weight (kg)</label>
                    <input type="number" placeholder="Enter your weight" value={weight} onChange={(e) => setWeight(e.target.value)} min="1" max="500" autoFocus
                      className="w-full rounded-xl px-5 py-4 text-xl font-medium transition-all" style={{ background: '#f8fafc', border: '2px solid #e2e8f0', color: '#1e293b' }} />
                  </div>
                  <div className="flex gap-3">
                    <button type="submit" className="flex-1 py-4 rounded-xl text-base font-semibold text-white btn-press flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', boxShadow: '0 6px 20px rgba(15,23,42,0.35)' }}>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                      Save
                    </button>
                    <button type="button" onClick={() => { setEditing(false); setError("") }} className="py-4 px-8 rounded-xl text-base font-semibold transition-all" style={{ background: '#f1f5f9', color: '#64748b' }}>Cancel</button>
                  </div>
                  {msg && <p className="text-sm text-center font-semibold animate-bounce-in" style={{ color: '#10b981' }}>{msg}</p>}
                  {error && <p className="text-sm text-center font-semibold animate-shake" style={{ color: '#ef4444' }}>{error}</p>}
                </form>
              )}
            </div>
          ) : (
            <HistoryCalendar weightKg={user?.weight_kg} refreshTrigger={refreshTrigger} />
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile
