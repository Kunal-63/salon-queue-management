import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useQueueStore } from '../stores/queueStore'
import { playChime } from '../lib/audio'
import { LoungeQRCode } from '../components/ui/QRCode'
import { Scissors, Volume2, VolumeX, Maximize2, Sparkles, Clock, ArrowRight, Database, QrCode } from 'lucide-react'

export default function LiveDisplay() {
  const { queue, barbers, isLiveDbConnected } = useQueueStore()
  const [time, setTime] = useState(new Date())
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [lastAnnouncedToken, setLastAnnouncedToken] = useState<string | null>(null)
  const [showTVQRCode, setShowTVQRCode] = useState(false)
  const [audioPulsing, setAudioPulsing] = useState(false)

  // Clock ticker
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Detect when someone enters 'serving' state and trigger chime + visual waveform
  useEffect(() => {
    const currentlyServing = queue.filter(q => q.status === 'serving')
    if (currentlyServing.length > 0) {
      const latest = currentlyServing[currentlyServing.length - 1]
      if (latest && latest.token !== lastAnnouncedToken) {
        setLastAnnouncedToken(latest.token)
        if (soundEnabled) {
          playChime()
          setAudioPulsing(true)
          setTimeout(() => setAudioPulsing(false), 3000)
        }
      }
    }
  }, [queue, soundEnabled, lastAnnouncedToken])

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {})
    } else {
      document.exitFullscreen().catch(() => {})
    }
  }

  const waitingEntries = queue.filter(e => e.status === 'waiting')

  return (
    <div
      className="h-screen w-screen overflow-hidden flex flex-col justify-between p-6 select-none bg-gradient-to-b from-[#0A192F] via-[#0E2A52] to-[#07162C] text-white relative"
    >
      {/* Background Animated Atmosphere Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none animate-pulse-blue" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none animate-float-slow" />

      {/* Top Header Bar */}
      <header className="flex items-center justify-between border-b border-blue-400/20 pb-4 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-tr from-blue-600 via-blue-500 to-sky-300 shadow-lg shadow-blue-500/30 text-white">
            <Scissors size={26} />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-3xl font-black tracking-tight text-white">
                LUXE<span className="text-sky-400">CUTS</span>
              </h1>
              <span className="text-xs px-3 py-0.5 rounded-full font-bold uppercase tracking-wider bg-blue-500/20 text-sky-300 border border-blue-400/30">
                Live Lounge Calling Floor
              </span>
            </div>
            <p className="text-xs tracking-widest uppercase font-medium text-blue-200 mt-0.5">
              Priority Styling Terminal · Mayfair Suites
            </p>
          </div>
        </div>

        {/* Live Audio Visualizer / Clock / Controls */}
        <div className="flex items-center gap-4">
          {/* Animated Audio Visualizer Bars when chime plays */}
          {audioPulsing && (
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold animate-pulse">
              <span className="w-1 h-4 bg-emerald-400 rounded-full animate-bounce" />
              <span className="w-1 h-6 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.15s]" />
              <span className="w-1 h-3 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.3s]" />
              <span className="ml-1">Calling Floor…</span>
            </div>
          )}

          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-900/40 border border-blue-400/20 text-xs font-semibold text-blue-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <Database size={13} className="text-sky-300" />
            <span>{isLiveDbConnected ? 'Supabase Postgres Live' : 'Dynamic Realtime Active'}</span>
          </div>

          <div className="text-right">
            <div className="font-display text-3xl font-bold tracking-tight text-white">
              {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <div className="text-xs uppercase font-semibold tracking-wider text-sky-300">
              {time.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>
          </div>

          <div className="h-9 w-px bg-blue-400/20" />

          {/* QR Code trigger on TV display */}
          <button
            onClick={() => setShowTVQRCode(true)}
            title="Scan QR to Join on Phone"
            className="p-3 rounded-xl transition-all bg-blue-900/40 hover:bg-blue-800/60 border border-blue-400/30 text-sky-300 flex items-center gap-1.5 text-xs font-bold"
          >
            <QrCode size={18} />
            <span className="hidden sm:inline">Join QR</span>
          </button>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'Mute announcement chime' : 'Enable announcement chime'}
            className="p-3 rounded-xl transition-all bg-blue-900/40 hover:bg-blue-800/60 border border-blue-400/30 text-sky-300"
          >
            {soundEnabled ? <Volume2 size={18} className="text-emerald-400" /> : <VolumeX size={18} className="text-rose-400" />}
          </button>

          <button
            onClick={toggleFullScreen}
            title="Toggle Fullscreen"
            className="p-3 rounded-xl transition-all bg-blue-900/40 hover:bg-blue-800/60 border border-blue-400/30 text-sky-300"
          >
            <Maximize2 size={18} />
          </button>
        </div>
      </header>

      {/* Main Barbers 3-Column Layout */}
      <main className="grid grid-cols-3 gap-6 flex-1 py-6 min-h-0 relative z-10">
        {barbers.map(barber => {
          const currentlyServing = queue.find(e => e.barber_id === barber.id && e.status === 'serving')
          const barberQueue = queue.filter(e => e.barber_id === barber.id && e.status === 'waiting')

          return (
            <div
              key={barber.id}
              className={`rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden backdrop-blur-md transition-all duration-500 border ${
                currentlyServing
                  ? 'bg-gradient-to-b from-[#0F2A52]/90 to-[#0A192F]/95 border-sky-400/60 shadow-2xl shadow-blue-500/25'
                  : 'bg-[#0E2445]/60 border-blue-400/20'
              }`}
            >
              {/* Header Accent Line */}
              <div
                className={`absolute top-0 left-0 right-0 h-1.5 ${
                  barber.status === 'available'
                    ? 'bg-gradient-to-r from-blue-500 via-sky-400 to-emerald-400'
                    : 'bg-gradient-to-r from-amber-500 to-amber-600'
                }`}
              />

              {/* Station Info */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-display text-xl font-black text-white shadow-md bg-gradient-to-tr from-blue-700 via-blue-600 to-sky-400">
                      {barber.avatar}
                    </div>
                    <div>
                      <h2 className="font-display text-2xl font-bold text-white leading-tight">{barber.name}</h2>
                      <p className="text-xs font-semibold text-sky-300">{barber.specialty}</p>
                    </div>
                  </div>

                  <span
                    className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider border ${
                      barber.status === 'available'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                        : 'bg-amber-500/20 text-amber-300 border-amber-400/30'
                    }`}
                  >
                    {barber.status === 'available' ? '● Station Active' : '⏸ On Break'}
                  </span>
                </div>

                {/* Now Serving Big Display Card */}
                <div className="mt-4">
                  <div className="text-xs uppercase tracking-widest font-bold mb-2 text-blue-200">
                    Now in Stylist Chair
                  </div>

                  {currentlyServing ? (
                    <div className="rounded-2xl p-5 text-center bg-gradient-to-b from-white via-blue-50 to-white text-slate-900 border-2 border-sky-300 shadow-2xl animate-pulse-blue relative overflow-hidden">
                      {/* Sub-header */}
                      <div className="text-xs font-bold uppercase tracking-widest mb-1 text-blue-700 flex items-center justify-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping inline-block" />
                        In Service Now
                      </div>

                      <div className="token-number text-6xl my-1 leading-none font-black">
                        {currentlyServing.token}
                      </div>

                      <div className="font-display text-2xl font-black text-slate-950 tracking-wide mt-1">
                        {currentlyServing.customer_name}
                      </div>
                      <div className="text-xs font-bold text-blue-700 uppercase tracking-wide mt-0.5">
                        {currentlyServing.service}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl p-8 text-center bg-blue-950/40 border border-dashed border-blue-400/30">
                      <Sparkles size={24} className="mx-auto mb-2 text-sky-400" />
                      <div className="font-display text-lg text-white font-semibold">Station Prepared</div>
                      <p className="text-xs text-blue-200 mt-1">Awaiting next patron</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Up Next List */}
              <div className="mt-6 pt-4 border-t border-blue-400/20">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider mb-3 text-sky-200">
                  <span>Up Next</span>
                  <span>{barberQueue.length} In Line</span>
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {barberQueue.length > 0 ? (
                    barberQueue.slice(0, 3).map((entry, idx) => (
                      <div
                        key={entry.id}
                        className={`flex items-center justify-between p-3 rounded-xl transition-all border ${
                          idx === 0
                            ? 'bg-blue-600/30 border-sky-400/40 text-white'
                            : 'bg-blue-950/40 border-blue-400/10 text-blue-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`font-mono text-sm font-black px-2 py-0.5 rounded-md ${
                            idx === 0
                              ? 'bg-sky-400 text-blue-950 shadow-sm'
                              : 'bg-white/10 text-white'
                          }`}>
                            {entry.token}
                          </span>
                          <div>
                            <div className="text-sm font-semibold text-white">{entry.customer_name}</div>
                            <div className="text-xs text-blue-300">{entry.service}</div>
                          </div>
                        </div>

                        <div className="text-xs font-bold text-sky-300">
                          {idx === 0 ? 'NEXT' : `+${idx * 25}m`}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-center py-4 text-blue-300">
                      No line ahead · Walk-ins invited
                    </div>
                  )}
                </div>
              </div>

            </div>
          )
        })}
      </main>

      {/* Bottom Ticker & Status Bar */}
      <footer className="rounded-2xl px-6 py-3.5 flex items-center justify-between backdrop-blur-md bg-blue-950/70 border border-blue-400/25 relative z-10">
        <div className="flex items-center gap-3 flex-1 overflow-hidden">
          <span className="text-xs px-2.5 py-1 rounded-md font-bold uppercase tracking-wider bg-blue-600 text-white">
            FLOOR UPDATE
          </span>
          <div className="text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis text-blue-100">
            ✨ Complimentary Italian espresso & infused waters served at our lounge refreshment bar. Please present your digital token when summoned.
          </div>
        </div>

        <div className="flex items-center gap-6 pl-6 text-xs font-semibold text-blue-200">
          <div className="flex items-center gap-1.5">
            <Clock size={14} className="text-sky-300" />
            <span>Avg Service: <strong className="text-white">25 mins</strong></span>
          </div>
          <div>
            <span>Waiting Floor: <strong className="text-white">{waitingEntries.length} Guests</strong></span>
          </div>
          <Link
            to="/join"
            className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg font-bold bg-blue-600 hover:bg-blue-500 text-white transition-colors"
          >
            <span>Patron Check-in</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </footer>

      {/* QR Code TV Modal */}
      {showTVQRCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md">
          <div className="rounded-3xl p-8 max-w-sm w-full bg-[#0E2445] border border-sky-400/40 text-center shadow-2xl animate-slide-up">
            <h3 className="font-display text-2xl font-bold text-white mb-1">Scan To Join Floor Queue</h3>
            <p className="text-xs text-blue-200 mb-5">Aim your phone camera at the screen</p>

            <div className="flex justify-center mb-5 bg-white p-3 rounded-2xl shadow-inner">
              <LoungeQRCode value={`${window.location.origin}/join`} size={200} />
            </div>

            <div className="text-xs font-mono font-bold text-sky-300 mb-6 bg-blue-900/60 py-2 px-3 rounded-xl border border-blue-400/30">
              {window.location.origin}/join
            </div>

            <button
              onClick={() => setShowTVQRCode(false)}
              className="w-full btn-primary py-3 text-sm font-bold"
            >
              Close Overlay
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
