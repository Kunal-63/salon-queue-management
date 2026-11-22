import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { Scissors, Lock, ArrowLeft, KeyRound, Mail, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/admin'
  const { login, isLoading, error } = useAuthStore()

  const [mode, setMode] = useState<'pin' | 'credentials'>('pin')
  const [pin, setPin] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [formError, setFormError] = useState('')

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pin.trim()) return setFormError('Please enter your 4-digit staff PIN')
    setFormError('')
    const ok = await login({ pin: pin.trim() })
    if (ok) {
      navigate(redirectTo)
    }
  }

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) return setFormError('Please fill in both email and password')
    setFormError('')
    const ok = await login({ identifier: email.trim(), password })
    if (ok) {
      navigate(redirectTo)
    }
  }

  // Quick 1-click Demo Fill
  const fillDemoAdmin = () => {
    setMode('pin')
    setPin('7788')
    setFormError('')
  }

  const fillDemoEmail = () => {
    setMode('credentials')
    setEmail('admin@luxecuts.com')
    setPassword('luxe2026')
    setFormError('')
  }

  return (
    <div className="min-h-screen flex flex-col justify-between p-6 select-none text-slate-800">
      
      {/* Top Header */}
      <nav className="flex items-center justify-between max-w-md mx-auto w-full pt-4">
        <Link
          to="/join"
          className="flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 transition-all px-3 py-1.5 rounded-full border border-blue-100 shadow-sm"
        >
          <ArrowLeft size={14} />
          <span>Lounge Floor</span>
        </Link>

        <div className="flex items-center gap-2">
          <Scissors size={18} className="text-blue-600" />
          <span className="font-display font-black tracking-tight text-lg">LUXE CUTS</span>
        </div>

        <span className="text-xs px-3 py-1 rounded-full font-bold bg-blue-100 text-blue-700">
          Staff Portal
        </span>
      </nav>

      {/* Main Login Card */}
      <main className="max-w-md mx-auto w-full py-8">
        <div className="dynamic-card p-8 bg-white/95 backdrop-blur-xl border border-blue-100 shadow-2xl shadow-blue-500/10">
          
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center bg-gradient-to-tr from-blue-700 via-blue-600 to-sky-400 text-white shadow-lg shadow-blue-500/25">
              <Lock size={26} />
            </div>
            <h1 className="font-display text-2xl font-black text-slate-950">Concierge Authentication</h1>
            <p className="text-xs text-slate-500 mt-1">Authorized salon staff and management access</p>
          </div>

          {/* Mode Switcher */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-slate-100 border border-slate-200 mb-6">
            <button
              type="button"
              onClick={() => { setMode('pin'); setFormError('') }}
              className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                mode === 'pin' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <KeyRound size={14} />
              <span>Quick PIN</span>
            </button>
            <button
              type="button"
              onClick={() => { setMode('credentials'); setFormError('') }}
              className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                mode === 'credentials' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Mail size={14} />
              <span>Email & Pass</span>
            </button>
          </div>

          {/* Errors */}
          {(formError || error) && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold animate-slide-up">
              {formError || error}
            </div>
          )}

          {/* PIN Form */}
          {mode === 'pin' ? (
            <form onSubmit={handlePinSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-slate-500 block mb-1.5">
                  4-Digit Concierge PIN
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="••••"
                  value={pin}
                  onChange={e => setPin(e.target.value)}
                  className="input-clean text-center text-3xl font-black tracking-widest text-blue-900"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary py-3.5 text-sm font-bold flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <ShieldCheck size={16} />
                    <span>Authorize Concierge</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Email & Password Form */
            <form onSubmit={handleCredentialsSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-slate-500 block mb-1">
                  Staff Email
                </label>
                <input
                  type="email"
                  placeholder="admin@luxecuts.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="input-clean"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-slate-500 block mb-1">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input-clean"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary py-3.5 text-sm font-bold flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <ShieldCheck size={16} />
                    <span>Sign In to Dashboard</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Quick 1-Click Demo Fill for Evaluators/TAs */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <span className="text-[11px] font-bold uppercase text-slate-400 block mb-2 text-center">
              Evaluation & Demo Shortcuts:
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={fillDemoAdmin}
                className="p-2.5 rounded-xl font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100 transition-colors flex items-center justify-center gap-1"
              >
                <Sparkles size={13} />
                <span>Fill PIN (7788)</span>
              </button>
              <button
                type="button"
                onClick={fillDemoEmail}
                className="p-2.5 rounded-xl font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100 transition-colors flex items-center justify-center gap-1"
              >
                <CheckCircle2 size={13} />
                <span>Fill admin@...</span>
              </button>
            </div>
          </div>

        </div>
      </main>

      <footer className="text-center text-xs pb-3 text-slate-400">
        LUXE CUTS · Concierge Access Control Security
      </footer>
    </div>
  )
}
