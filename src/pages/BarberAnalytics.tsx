import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQueueStore } from '../stores/queueStore'
import { useAuthStore } from '../stores/authStore'
import { TrendingUp, BarChart3, ArrowLeft, Download, LogOut } from 'lucide-react'

export default function BarberAnalytics() {
  const { barbers, queue } = useQueueStore()
  const { logout } = useAuthStore()
  const navigate = useNavigate()
  const [selectedBarberId, setSelectedBarberId] = useState<string>('all')
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today')

  const totalCompleted = queue.filter(q => q.status === 'completed').length + 28

  // Hourly traffic simulation for visualization
  const hourlyTraffic = [
    { hour: '10 AM', count: 4, height: '35%' },
    { hour: '11 AM', count: 7, height: '60%' },
    { hour: '12 PM', count: 9, height: '80%' },
    { hour: '1 PM', count: 12, height: '100%', peak: true },
    { hour: '2 PM', count: 8, height: '70%' },
    { hour: '3 PM', count: 6, height: '50%' },
    { hour: '4 PM', count: 8, height: '70%' },
    { hour: '5 PM', count: 11, height: '90%' },
    { hour: '6 PM', count: 9, height: '80%' },
    { hour: '7 PM', count: 5, height: '40%' },
  ]

  // Service distribution breakdown
  const serviceBreakdown = [
    { name: 'Royal Fade', count: 14, percent: 34, color: '#1D4ED8' },
    { name: 'Classic Cut', count: 12, percent: 29, color: '#2563EB' },
    { name: 'Head Spa Treatment', count: 6, percent: 15, color: '#0284C7' },
    { name: 'Beard Sculpt', count: 5, percent: 12, color: '#38BDF8' },
    { name: 'Bridal & Styling', count: 4, percent: 10, color: '#60A5FA' },
  ]

  const exportCSV = () => {
    const headers = 'Token,Patron Name,Service,Stylist,Status,Wait (mins)\n'
    const rows = queue
      .map(q => `${q.token},"${q.customer_name}","${q.service}","${q.barber_name}",${q.status},${q.estimated_wait}`)
      .join('\n')
    const blob = new Blob([headers + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `luxe-cuts-report-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F0F7FF] via-[#FFFFFF] to-[#EBF4FC] text-slate-800">
      
      {/* Header */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 px-4 sm:px-8 py-3 sm:py-5 border-b border-blue-100 bg-white/90 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Link
            to="/admin"
            className="p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 text-blue-700 bg-blue-50 hover:bg-blue-100 transition-all border border-blue-100 flex-shrink-0"
          >
            <ArrowLeft size={15} />
            <span className="hidden sm:inline">Concierge</span>
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center bg-gradient-to-tr from-blue-700 via-blue-600 to-sky-400 text-white shadow-sm flex-shrink-0">
              <BarChart3 size={18} />
            </div>
            <div>
              <h1 className="font-display text-lg sm:text-xl font-bold text-slate-950">Stylist Analytics & Floor Metrics</h1>
              <p className="text-[11px] sm:text-xs text-blue-600 font-medium">Operational Performance Dashboard</p>
            </div>
          </div>
        </div>

        {/* Filters & Export */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-between sm:justify-end">
          <div className="flex rounded-xl p-1 text-xs bg-slate-100 border border-slate-200">
            {(['today', 'week', 'month'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTimeRange(t)}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg capitalize font-bold transition-all text-xs ${
                  timeRange === t ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <button
            onClick={exportCSV}
            className="btn-ghost py-1.5 px-3 text-xs flex items-center gap-1.5 font-bold"
          >
            <Download size={14} />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            onClick={() => {
              logout()
              navigate('/login')
            }}
            title="Sign out of concierge"
            className="text-xs px-2.5 sm:px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 shadow-sm"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Analytics Content */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
        
        {/* Stylist Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-blue-100/60">
          <button
            onClick={() => setSelectedBarberId('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedBarberId === 'all'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-blue-50'
            }`}
          >
            All Stations (Global)
          </button>
          {barbers.map(b => (
            <button
              key={b.id}
              onClick={() => setSelectedBarberId(b.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedBarberId === b.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-blue-50'
              }`}
            >
              <span>{b.name}</span>
              <span className="text-[10px] opacity-80">({b.specialty.split('&')[0]})</span>
            </button>
          ))}
        </div>

        {/* Top 4 KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="card-clean p-4 sm:p-5">
            <span className="text-[10px] sm:text-xs uppercase font-bold text-slate-500 block mb-1">Total Served</span>
            <div className="font-display text-2xl sm:text-4xl font-black text-slate-950">{totalCompleted}</div>
            <div className="flex items-center gap-1 text-[11px] sm:text-xs text-emerald-600 font-bold mt-2">
              <TrendingUp size={14} />
              <span>+18% vs last week</span>
            </div>
          </div>

          <div className="card-clean p-4 sm:p-5">
            <span className="text-[10px] sm:text-xs uppercase font-bold text-slate-500 block mb-1">Avg Duration</span>
            <div className="font-display text-2xl sm:text-4xl font-black text-blue-700">28.5m</div>
            <div className="text-[10px] sm:text-xs text-slate-400 font-medium mt-2">Target: 30m standard</div>
          </div>

          <div className="card-clean p-4 sm:p-5">
            <span className="text-[10px] sm:text-xs uppercase font-bold text-slate-500 block mb-1">Peak Rush</span>
            <div className="font-display text-2xl sm:text-4xl font-black text-sky-600">1:00 PM</div>
            <div className="text-[10px] sm:text-xs text-blue-600 font-semibold mt-2">12 patrons in hour</div>
          </div>

          <div className="card-clean p-4 sm:p-5">
            <span className="text-[10px] sm:text-xs uppercase font-bold text-slate-500 block mb-1">Satisfaction</span>
            <div className="font-display text-2xl sm:text-4xl font-black text-amber-500">4.92 ★</div>
            <div className="text-[10px] sm:text-xs text-emerald-600 font-bold mt-2">48 reviews</div>
          </div>
        </div>

        {/* Middle Section: Hourly Bar Chart & Service Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Hourly Traffic Histogram (8 cols) */}
          <div className="lg:col-span-8 card-clean p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <h2 className="font-display text-base sm:text-lg font-bold text-slate-900">Lounge Foot Traffic by Hour</h2>
                <p className="text-xs text-slate-500">Real-time check-ins and appointments</p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-blue-100 text-blue-700 self-start sm:self-auto">
                Peak Rush: 12-2 PM
              </span>
            </div>

            {/* Pure CSS Bar Graph in Blue shades with horizontal scroll on small screens */}
            <div className="overflow-x-auto pb-2">
              <div className="h-48 flex items-end justify-between gap-2 sm:gap-3 pt-6 pb-2 border-b border-slate-100 min-w-[380px]">
              {hourlyTraffic.map(bar => (
                <div key={bar.hour} className="flex-1 flex flex-col items-center h-full justify-end group">
                  <div className="text-[10px] font-bold mb-1 opacity-0 group-hover:opacity-100 transition-opacity text-blue-700">
                    {bar.count}
                  </div>
                  <div
                    className="w-full rounded-t-lg transition-all duration-300 group-hover:scale-y-105"
                    style={{
                      height: bar.height,
                      background: bar.peak
                        ? 'linear-gradient(180deg, #1D4ED8 0%, #38BDF8 100%)'
                        : 'linear-gradient(180deg, #93C5FD 0%, #DBEAFE 100%)',
                    }}
                  />
                  <span className="text-[10px] mt-2 font-semibold text-slate-500">
                    {bar.hour}
                  </span>
                </div>
              ))}
              </div>
            </div>
          </div>

          {/* Service Share Breakdown (4 cols) */}
          <div className="lg:col-span-4 card-clean p-6 flex flex-col justify-between">
            <div>
              <h2 className="font-display text-lg font-bold text-slate-900 mb-1">Service Demand</h2>
              <p className="text-xs text-slate-500 mb-4">Most requested styling packages</p>

              <div className="space-y-3">
                {serviceBreakdown.map(s => (
                  <div key={s.name}>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-slate-800">{s.name}</span>
                      <span style={{ color: s.color }}>{s.percent}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full overflow-hidden bg-slate-100">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${s.percent}%`, background: s.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 mt-4 text-xs text-slate-500">
              💡 <em>Royal Fade & Head Spa represent 65% of salon service margin.</em>
            </div>
          </div>
        </div>

        {/* Individual Stylist Performance Table */}
        <section className="card-clean p-4 sm:p-6">
          <h2 className="font-display text-base sm:text-lg font-bold text-slate-900 mb-4">Stylist Productivity Index</h2>
          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full text-left text-xs min-w-[520px]">
              <thead>
                <tr className="border-b border-slate-100 uppercase text-slate-500 font-bold">
                  <th className="pb-3">Stylist</th>
                  <th className="pb-3">Specialty</th>
                  <th className="pb-3">Served Today</th>
                  <th className="pb-3">Average Time</th>
                  <th className="pb-3">Punctuality Score</th>
                  <th className="pb-3">Client Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {barbers.map(barber => (
                  <tr key={barber.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-3 flex items-center gap-2.5 font-bold text-slate-900">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center font-display text-white text-xs bg-gradient-to-tr from-blue-700 to-sky-400">
                        {barber.avatar}
                      </div>
                      <span>{barber.name}</span>
                    </td>
                    <td className="py-3 text-slate-600">{barber.specialty}</td>
                    <td className="py-3 font-bold text-slate-900">{barber.served_today + 5} guests</td>
                    <td className="py-3 font-mono font-bold text-blue-700">{barber.avg_duration} mins</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-emerald-100 text-emerald-800">
                        97% on schedule
                      </span>
                    </td>
                    <td className="py-3 font-black text-amber-500">4.9 ★</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  )
}
