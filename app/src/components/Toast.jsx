import { useEffect } from 'react'

const styles = {
  error:   { bg: 'bg-red-500',   icon: 'M6 18L18 6M6 6l12 12' },
  success: { bg: 'bg-forest',    icon: 'M4.5 12.75l6 6 9-13.5' },
  warning: { bg: 'bg-amber-500', icon: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z' },
}

export default function Toast({ message, type = 'error', onClose, duration = 3500 }) {
  useEffect(() => {
    const t = setTimeout(onClose, duration)
    return () => clearTimeout(t)
  }, [onClose, duration])

  const { bg, icon } = styles[type] ?? styles.error

  return (
    <div className={`fixed bottom-6 right-6 z-[60] ${bg} text-white text-sm px-5 py-3 rounded-xl shadow-lg flex items-center gap-3 max-w-xs`}>
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d={icon}/>
      </svg>
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="ml-1 opacity-70 hover:opacity-100 transition-opacity">✕</button>
    </div>
  )
}
