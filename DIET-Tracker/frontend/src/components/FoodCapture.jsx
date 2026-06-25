import { useRef, useState, useCallback } from "react"

function FoodCapture({ onCapture, onCancel }) {
  const fileInputRef = useRef(null)
  const [preview, setPreview] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleFile = useCallback((file) => {
    if (!file) return
    setPreview(URL.createObjectURL(file))
    setIsAnalyzing(true)
    onCapture(file)
    setTimeout(() => setIsAnalyzing(false), 2000)
  }, [onCapture])

  return (
    <div className="animate-fade-in-up">
      <div onClick={() => fileInputRef.current.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFile(e.dataTransfer.files[0]) }}
        className={`cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300 box-glow ${isDragging ? 'scale-[1.02]' : 'hover:scale-[1.01]'} ${preview ? 'p-0' : 'p-12'}`}
        style={{ borderColor: isDragging ? '#06b6d4' : 'rgba(147,197,253,0.4)', background: isDragging ? 'rgba(6,182,212,0.05)' : 'rgba(255,255,255,0.9)', boxShadow: '0 4px 16px rgba(59,130,246,0.1), 0 12px 40px rgba(59,130,246,0.08)', border: '2px solid rgba(147,197,253,0.4)', backdropFilter: 'blur(12px)' }}>

        {preview ? (
          <div className="relative">
            <img src={preview} alt="Uploaded food" className="w-full rounded-2xl object-cover max-h-80 animate-scale-in" />
            {isAnalyzing && (
              <div className="absolute inset-0 flex items-center justify-center rounded-2xl backdrop-blur-sm animate-fade-in" style={{ background: 'rgba(0,0,0,0.4)' }}>
                <div className="text-center">
                  <div className="w-14 h-14 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                  <p className="text-white mt-4 font-semibold text-xl">Analyzing...</p>
                </div>
              </div>
            )}
            <button onClick={(e) => { e.stopPropagation(); setPreview(null); onCancel && onCancel() }}
              className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg"
              style={{ background: 'rgba(255,255,255,0.9)', color: '#94a3b8' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8' }}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        ) : (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-5 transition-all duration-300" style={{ background: 'rgba(6,182,212,0.08)' }}>
              <svg className="w-10 h-10 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
              </svg>
            </div>
            <p className="text-slate-700 font-bold text-xl mb-1.5">{isDragging ? "Drop your food photo here" : "Upload Food Photo"}</p>
            <p className="text-slate-400 text-base">Drag & drop or click to browse</p>
            <div className="mt-5 flex items-center justify-center gap-2">
              {['JPG','PNG','WEBP'].map(f => (
                <span key={f} className="px-3 py-1 rounded-lg text-sm font-medium" style={{ background: 'rgba(191,219,254,0.2)', color: '#64748b', border: '1px solid rgba(147,197,253,0.25)' }}>{f}</span>
              ))}
            </div>
          </div>
        )}
        <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => handleFile(e.target.files[0])} className="hidden" />
      </div>
    </div>
  )
}

export default FoodCapture
