import { useState, useEffect } from "react"
import { getHistory, getDayIntake } from "../services/api"

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"]
const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]

function calculateGoals(weightKg) {
  if (!weightKg) return null
  return {
    calories: Math.round(weightKg * 35),
    protein: Math.round(weightKg * 1.0),
    carbs: Math.round(weightKg * 4.5),
    fat: Math.round(weightKg * 1.0),
  }
}

function getCompletionPct(calories, goals) {
  if (!goals || !calories) return 0
  return Math.min(calories / goals.calories, 1)
}

function getCircleStyle(pct) {
  if (pct === 0) return null
  if (pct >= 0.85) return { background: 'rgba(16,185,129,0.18)', border: '2px solid #10b981', color: '#059669' }
  if (pct >= 0.6)  return { background: 'rgba(234,179,8,0.18)', border: '2px solid #eab308', color: '#b45309' }
  if (pct >= 0.3)  return { background: 'rgba(249,115,22,0.18)', border: '2px solid #f97316', color: '#c2410c' }
  return { background: 'rgba(239,68,68,0.18)', border: '2px solid #ef4444', color: '#dc2626' }
}

function HistoryCalendar({ weightKg, refreshTrigger }) {
  const [history, setHistory] = useState([])
  const [apiWeightKg, setApiWeightKg] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [selectedDay, setSelectedDay] = useState(null)
  const [dayDetail, setDayDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    getHistory().then((d) => {
      setHistory(d.days || [])
      if (d.weight_kg) setApiWeightKg(d.weight_kg)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [refreshTrigger])

  const effectiveWeightKg = weightKg || apiWeightKg
  const goals = calculateGoals(effectiveWeightKg)

  const historyMap = {}
  history.forEach((d) => { historyMap[d.date] = d })

  const today = new Date()
  const firstDay = new Date(currentYear, currentMonth, 1).getDay()
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()

  const calendarDays = []
  for (let i = 0; i < firstDay; i++) calendarDays.push(null)
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d)

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear((y) => y - 1) }
    else setCurrentMonth((m) => m - 1)
    setSelectedDay(null); setDayDetail(null)
  }

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear((y) => y + 1) }
    else setCurrentMonth((m) => m + 1)
    setSelectedDay(null); setDayDetail(null)
  }

  const handleDayClick = async (day) => {
    if (!day) return
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    setSelectedDay(day)
    setDetailLoading(true)
    try {
      const d = await getDayIntake(dateStr)
      setDayDetail(d)
    } catch { setDayDetail(null) }
    setDetailLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-5">
        <button onClick={prevMonth} className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:bg-blue-100" style={{ background: 'rgba(191,219,254,0.3)', border: '1px solid rgba(147,197,253,0.3)' }}>
          <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="text-center">
          <p className="text-lg font-bold text-gray-800">{MONTHS[currentMonth]}</p>
          <p className="text-sm text-gray-500">{currentYear}</p>
        </div>
        <button onClick={nextMonth} className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:bg-blue-100" style={{ background: 'rgba(191,219,254,0.3)', border: '1px solid rgba(147,197,253,0.3)' }}>
          <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1.5 mb-2">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-xs font-semibold text-gray-500 py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {calendarDays.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} />
          const isToday = today.getDate() === day && today.getMonth() === currentMonth && today.getFullYear() === currentYear
          const isSelected = selectedDay === day
          const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
          const data = historyMap[dateStr]
          const pct = data ? getCompletionPct(data.calories, goals) : 0
          const circleStyle = getCircleStyle(pct)

          let style = { color: '#94a3b8', background: 'transparent', border: '2px solid transparent' }
          if (isSelected) {
            style = { background: 'linear-gradient(135deg, #6366f1, #06b6d4)', color: '#fff', boxShadow: '0 4px 12px rgba(99,102,241,0.3)', transform: 'scale(1.15)' }
          } else if (isToday) {
            style = { background: '#eef2ff', color: '#6366f1', fontWeight: 700, border: '2.5px solid #6366f1', boxShadow: '0 0 0 3px rgba(99,102,241,0.15)' }
          } else if (circleStyle) {
            style = { ...circleStyle, fontWeight: 700 }
          }

          return (
            <button
              key={i}
              onClick={() => handleDayClick(day)}
              className="relative aspect-square rounded-full flex items-center justify-center text-sm transition-all duration-200 font-medium"
              style={style}
            >
              {day}
            </button>
          )
        })}
      </div>

      {selectedDay && (
        <div className="mt-4 pt-4 animate-fade-in" style={{ borderTop: '1px solid #e2e8f0' }}>
          {detailLoading ? (
            <div className="flex justify-center py-4">
              <div className="w-5 h-5 border-2 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
            </div>
          ) : dayDetail && dayDetail.history.length > 0 ? (
            <div className="rounded-2xl p-4 animate-fade-in-up" style={{ background: 'rgba(255,255,255,0.95)', border: '1px solid rgba(147,197,253,0.3)', boxShadow: '0 4px 16px rgba(59,130,246,0.08)' }}>
              <div className="flex items-center justify-between mb-4">
                <p className="text-lg font-bold text-gray-800">
                  {MONTHS_SHORT[currentMonth]} {selectedDay} Intake
                </p>
                <div className="flex items-center gap-1 px-3 py-1 rounded-full" style={{ background: 'rgba(99,102,241,0.08)' }}>
                  <span className="text-sm font-bold text-indigo-500">{Math.round(dayDetail.totals.calories)}</span>
                  <span className="text-xs text-gray-500">kcal</span>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 mb-4">
                {[
                  { label: 'Cal', value: dayDetail.totals.calories, unit: 'kcal', color: '#ef4444', bg: 'rgba(239,68,68,0.06)' },
                  { label: 'Protein', value: dayDetail.totals.protein, unit: 'g', color: '#3b82f6', bg: 'rgba(59,130,246,0.06)' },
                  { label: 'Carbs', value: dayDetail.totals.carbs, unit: 'g', color: '#f59e0b', bg: 'rgba(245,158,11,0.06)' },
                  { label: 'Fat', value: dayDetail.totals.fat, unit: 'g', color: '#10b981', bg: 'rgba(16,185,129,0.06)' },
                ].map((s) => (
                  <div key={s.label} className="text-center rounded-xl p-2.5" style={{ background: s.bg }}>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: s.color, opacity: 0.7 }}>{s.label}</p>
                    <p className="text-lg font-bold" style={{ color: s.color }}>{Math.round(s.value)}</p>
                    <p className="text-[10px] text-gray-400">{s.unit}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                {dayDetail.history.map((item, j) => (
                  <div key={j} className="rounded-xl px-4 py-3" style={{ background: 'rgba(191,219,254,0.15)', border: '1px solid rgba(147,197,253,0.15)' }}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-semibold text-gray-700 capitalize">{item.food?.replace(/_/g, ' ')}</span>
                      <span className="text-xs text-gray-400">{item.time ? new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-md" style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444' }}>{Math.round(item.calories)} kcal</span>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-md" style={{ background: 'rgba(59,130,246,0.08)', color: '#3b82f6' }}>{Math.round(item.protein)}g protein</span>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-md" style={{ background: 'rgba(245,158,11,0.08)', color: '#f59e0b' }}>{Math.round(item.carbs)}g carbs</span>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-md" style={{ background: 'rgba(16,185,129,0.08)', color: '#10b981' }}>{Math.round(item.fat)}g fat</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-3">No intake logged this day</p>
          )}
        </div>
      )}

      {!goals && (
        <p className="text-sm text-gray-500 text-center mt-3">Set your weight to see color-coded calendar</p>
      )}
    </div>
  )
}

export default HistoryCalendar
