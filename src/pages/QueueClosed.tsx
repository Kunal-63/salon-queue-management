import { Link } from 'react-router-dom'
import { Clock, ArrowRight, Moon } from 'lucide-react'

export default function QueueClosed() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 text-center select-none bg-gradient-to-b from-[#F0F7FF] via-[#FFFFFF] to-[#E2EFFF] text-slate-800"
    >
      <div
        className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6 bg-gradient-to-tr from-blue-700 via-blue-600 to-sky-400 text-white shadow-xl shadow-blue-500/25 animate-float"
      >
        <Moon size={36} />
      </div>

      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold mb-4 bg-blue-100 text-blue-800 border border-blue-200">
        <span>Queue Closed For The Evening</span>
      </div>

      <h1 className="font-display text-4xl sm:text-5xl font-black text-slate-950 mb-3">
        Lounge Shears at Rest 🌙
      </h1>

      <p className="text-sm text-slate-600 max-w-md mx-auto mb-6 leading-relaxed">
        Our digital check-in closes 30 minutes before salon closing to ensure every guest in the styling chair receives complete, unhurried attention.
      </p>

      {/* Operating Hours Card in Blue & White */}
      <div className="card-clean max-w-sm w-full p-5 text-left mb-8 shadow-md">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-3 text-blue-700">
          <Clock size={15} />
          <span>Lounge Operating Hours</span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-500">Monday – Friday:</span>
            <strong className="text-slate-900 font-bold">9:00 AM – 9:00 PM</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Saturday – Sunday:</span>
            <strong className="text-slate-900 font-bold">8:30 AM – 9:30 PM</strong>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <Link to="/display" className="btn-ghost py-2.5 px-5 text-xs font-bold">
          View Live Board
        </Link>
        <Link to="/join" className="btn-primary py-2.5 px-5 text-xs font-bold flex items-center gap-1.5">
          <span>Check In Tomorrow</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  )
}
