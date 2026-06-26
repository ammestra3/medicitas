import { useEffect, useState } from 'react'
import { appointmentService } from '../../api/services'

export default function Analytics() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    appointmentService.getAll().then(({ data }) => setAppointments(data)).finally(() => setLoading(false))
  }, [])

  const count = (status) => appointments.filter(a => a.status === status).length
  const total = appointments.length

  const stats = [
    { label: 'Total citas', value: total, color: 'var(--color-primary)' },
    { label: 'Asistidas', value: count('completed'), color: 'var(--color-success)' },
    { label: 'Canceladas', value: count('cancelled'), color: 'var(--color-danger)' },
    { label: 'Pendientes', value: count('pending'), color: 'var(--color-warning)' }
  ]

  const byMonth = appointments.reduce((acc, a) => {
    const month = a.date?.slice(0, 7) ?? 'N/A'
    acc[month] = (acc[month] || 0) + 1
    return acc
  }, {})

  const months = Object.entries(byMonth).sort(([a],[b]) => a.localeCompare(b)).slice(-6)
  const maxVal = Math.max(...months.map(([,v]) => v), 1)

  if (loading) return <div className="loading-center"><div className="spinner" /></div>

  return (
    <>
      <div className="page-header"><h1 className="page-title">Analitica de citas</h1></div>
      <div className="page-content">
        <div className="stats-grid" style={{ marginBottom: 24 }}>
          {stats.map(s => (
            <div key={s.label} className="stat-card">
              <div className="stat-label">{s.label}</div>
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-sub">{total > 0 ? `${Math.round((s.value/total)*100)}%` : '0%'}</div>
            </div>
          ))}
        </div>

        <div className="card" style={{ marginBottom: 20 }}>
          <p style={{ fontSize:13,fontWeight:600,marginBottom:20 }}>Citas por mes (ultimos 6 meses)</p>
          {months.length === 0
            ? <p style={{ fontSize:13,color:'var(--color-text-secondary)',textAlign:'center',padding:24 }}>Sin datos suficientes.</p>
            : (
              <div style={{ display:'flex',alignItems:'flex-end',gap:12,height:160 }}>
                {months.map(([month, val]) => (
                  <div key={month} style={{ flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:6 }}>
                    <span style={{ fontSize:11,color:'var(--color-text-secondary)' }}>{val}</span>
                    <div style={{ width:'100%',background:'var(--color-primary)',borderRadius:'4px 4px 0 0',height:`${(val/maxVal)*120}px`,minHeight:4,transition:'height .3s' }} />
                    <span style={{ fontSize:10,color:'var(--color-text-secondary)',textAlign:'center' }}>{month.slice(5)}/{month.slice(0,4)}</span>
                  </div>
                ))}
              </div>
            )}
        </div>

        <div className="card">
          <p style={{ fontSize:13,fontWeight:600,marginBottom:16 }}>Distribucion por estado</p>
          {[['Confirmadas','confirmed','var(--color-success)'],['Pendientes','pending','var(--color-warning)'],['Canceladas','cancelled','var(--color-danger)'],['Completadas','completed','var(--color-primary)']].map(([label,status,color]) => {
            const val = count(status)
            const pct = total > 0 ? Math.round((val/total)*100) : 0
            return (
              <div key={status} style={{ marginBottom:12 }}>
                <div style={{ display:'flex',justifyContent:'space-between',fontSize:12,marginBottom:4 }}>
                  <span style={{ color:'var(--color-text-secondary)' }}>{label}</span>
                  <span style={{ fontWeight:500 }}>{val} ({pct}%)</span>
                </div>
                <div style={{ height:8,background:'var(--color-border)',borderRadius:4 }}>
                  <div style={{ height:'100%',width:`${pct}%`,background:color,borderRadius:4,transition:'width .4s' }} />
                </div>
              </div>
            )
          })}
          <p style={{ fontSize:11,color:'var(--color-text-muted)',marginTop:16 }}>
            Estos datos se calculan en tiempo real desde el API. Para analitica avanzada con Python, exporta los datos con GET /api/appointments y procesalos con pandas + matplotlib.
          </p>
        </div>
      </div>
    </>
  )
}
