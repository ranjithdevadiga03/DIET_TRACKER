import { useState } from "react"

function AuthPage({ onAuth }) {
  const [isLogin, setIsLogin] = useState(true)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [weight, setWeight] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault(); setError("")
    if (!username.trim() || !password.trim()) { setError("Username and password are required"); return }
    setLoading(true)
    try {
      if (isLogin) await onAuth("login", username.trim(), password)
      else await onAuth("register", username.trim(), password, weight ? parseFloat(weight) : null)
    } catch (err) { setError(err.message) }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-main flex items-center justify-center p-4">
      <div className="food-symbols">
        {['🍌','🍅','🍔','🥦','🥒','🍳','🍉','🍍','🥑','🍕','🌮','🍇','🧁','🧀','🍓','🍰','🥕','🍊'].map((s, i) => (
          <div key={i} className="food-symbol">{s}</div>
        ))}
      </div>
      <div className="particles">
        {[...Array(8)].map((_, i) => <div key={i} className="particle" />)}
      </div>

      <div className="w-full max-w-lg relative z-10">
        <div className="text-center mb-8 animate-fade-in-down">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-lg" style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)', boxShadow: '0 6px 20px rgba(99,102,241,0.25)' }}>
            <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="13" r="8" stroke="currentColor" strokeWidth="1.8" fill="none"/>
              <path d="M6 10c0-4 2.5-7 6-7s6 3 6 7" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
              <path d="M12 3v-1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              <path d="M15 5.5c1.5-1 3.5-1 5 0" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.7"/>
              <path d="M9 13h6" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.4"/>
            </svg>
          </div>
          <h1 className="text-4xl font-extrabold"><span className="text-slate-700">DIET </span><span className="text-cyan-500">TRACKER</span></h1>
          <p className="text-base text-slate-500 mt-1">AI-powered food recognition</p>
        </div>

        <div className="card p-8 animate-fade-in-up">
          <h2 className="text-xl font-bold text-slate-700 text-center mb-6">
            {isLogin ? "Welcome back" : "Create account"}
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl px-5 py-4 pl-12 text-base transition-all"
                style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(180,190,210,0.5)', color: '#2d3748' }}
                autoComplete="username" />
            </div>

            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl px-5 py-4 pl-12 text-base transition-all"
                style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(180,190,210,0.5)', color: '#2d3748' }}
                autoComplete={isLogin ? "current-password" : "new-password"} />
            </div>

            {!isLogin && (
              <div className="relative animate-fade-in">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                  </svg>
                </div>
                <input type="number" placeholder="Body weight (kg) — optional" value={weight} onChange={(e) => setWeight(e.target.value)} min="1" max="500"
                  className="w-full rounded-xl px-5 py-4 pl-12 text-base transition-all"
                  style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(180,190,210,0.5)', color: '#2d3748' }} />
              </div>
            )}

            {error && (
              <div className="rounded-xl px-4 py-2 animate-shake" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
                <p className="text-red-500 text-sm text-center font-medium">{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-white transition-all duration-300 disabled:opacity-50 btn-press text-sm relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #06b6d4, #10b981)', boxShadow: '0 4px 16px rgba(6,182,212,0.25)' }}>
              <span className={`relative z-10 ${loading ? 'opacity-0' : ''}`}>{isLogin ? "Login" : "Register"}</span>
              {loading && <div className="absolute inset-0 flex items-center justify-center"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /></div>}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-slate-400">{isLogin ? "Don't have an account?" : "Already have an account?"}</p>
            <button onClick={() => { setIsLogin(!isLogin); setError("") }}
              className="mt-1 text-sm text-cyan-500 hover:text-cyan-600 font-semibold transition-colors underline underline-offset-4">
              {isLogin ? "Sign up" : "Login"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthPage
