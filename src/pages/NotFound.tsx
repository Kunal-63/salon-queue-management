import { Link } from 'react-router-dom'
import { Scissors, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-[#F0F7FF] via-[#FFFFFF] to-[#E2EFFF] text-slate-800"
    >
      <div
        className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6 bg-gradient-to-tr from-blue-700 via-blue-600 to-sky-400 text-white shadow-xl shadow-blue-500/25 animate-float"
      >
        <Scissors size={40} />
      </div>

      <h1 className="font-display text-7xl font-black text-slate-950 mb-2">404</h1>
      <h2 className="font-display text-2xl font-bold mb-3 text-blue-700">
        Looks like this page got a bad haircut.
      </h2>
      <p className="text-sm text-slate-500 max-w-sm mb-8">
        The link you followed has moved or does not exist on our lounge floor.
      </p>

      <Link
        to="/join"
        className="btn-primary inline-flex items-center gap-2 py-3 px-6 text-sm font-bold"
      >
        <ArrowLeft size={16} />
        <span>Return to Lounge Entry</span>
      </Link>
    </div>
  )
}
