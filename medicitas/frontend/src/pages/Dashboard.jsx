import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { appointmentService } from '../api/services'
import { useAuth } from '../context/AuthContext'
import Badge from '../components/Badge'
import { Icons } from '../components/Icons'

/* ─── Patient Dashboard ─── */
function PatientDashboard() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const load = useCallback(() => {
    setLoading(true)
    appointmentService.getAll()
      .then(({ data }) => setAppointments(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
    // Reload whenever window regains focus (user comes back from booking)
    window.addEventListener('focus', load)
    return () => window.removeEventListener('focus', load)
  }, [load])

  const upcoming = appointments.filter(a => !['cancelled','completed','rescheduled'].includes(a.status))

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Panel principal</h1>
        <button className="btn btn-primary" onClick={() => navigate('/appointments')}>
          {Icons.plus} Nueva cita
        </button>
      </div>
      <div className="page-content">
        <div className="stats-grid" style={{ marginBottom:24 }}>
          <div className="stat-card">
            <div className="stat-label">Citas activas</div>
            <div className="stat-value" style={{ color:'var(--color-primary)' }}>{upcoming.length}</div>
            <div className="stat-sub">proximas confirmadas</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Proxima cita</div>
            <div className="stat-value" style={{ fontSize:16 }}>{upcoming[0]?.date?.slice(5).replace('-','/') ?? '—'}</div>
            <div className="stat-sub">{upcoming[0]?.doctorName ?? 'Sin citas pendientes'}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Completadas</div>
            <div className="stat-value" style={{ color:'var(--color-success)' }}>{appointments.filter(a => a.status === 'completed').length}</div>
            <div className="stat-sub">consultas realizadas</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Canceladas</div>
            <div className="stat-value" style={{ color:'var(--color-danger)' }}>{appointments.filter(a => a.status === 'cancelled').length}</div>
            <div className="stat-sub">en total</div>
          </div>
        </div>

        <div className="section-label">Proximas citas</div>

        {loading ? (
          <div className="loading-center"><div className="spinner"/></div>
        ) : upcoming.length === 0 ? (
          <div className="card" style={{ textAlign:'center', color:'var(--color-text-secondary)', padding:32 }}>
            No tiene citas programadas.{' '}
            <button onClick={() => navigate('/appointments')} style={{ color:'var(--color-primary)', background:'none', border:'none', cursor:'pointer', fontSize:13 }}>
              Agendar ahora
            </button>
          </div>
        ) : (
          <div className="appointment-list">
            {upcoming.slice(0, 5).map(a => (
              <div key={a.id} className="appointment-card">
                <div className="appt-time">
                  <div className="time">{a.time}</div>
                  <div className="date">{a.date?.slice(5).replace('-','/')}</div>
                </div>
                <div className="appt-divider"/>
                <div className="appt-info">
                  <div className="appt-doctor">{a.doctorName}</div>
                  <div className="appt-specialty">{a.specialty}</div>
                  {a.reason && <div style={{ fontSize:11, color:'var(--color-text-muted)', marginTop:2 }}>{a.reason}</div>}
                </div>
                <div className="appt-actions"><Badge status={a.status}/></div>
              </div>
            ))}
            {upcoming.length > 5 && (
              <button className="btn" style={{ width:'100%', justifyContent:'center' }}
                onClick={() => navigate('/appointments')}>
                Ver todas ({upcoming.length})
              </button>
            )}
          </div>
        )}
      </div>
    </>
  )
}

/* ─── Doctor Dashboard ─── */
function DoctorDashboard() {
  const [today, setToday]     = useState([])
  const [pending, setPending] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const load = useCallback(() => {
    setLoading(true)
    Promise.all([
      appointmentService.getDoctorToday(),
      appointmentService.getDoctorPending()
    ])
      .then(([t, p]) => { setToday(t.data); setPending(p.data) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
    window.addEventListener('focus', load)
    return () => window.removeEventListener('focus', load)
  }, [load])

  const confirmed = today.filter(a => a.status === 'confirmed')
  const completed = today.filter(a => a.status === 'completed')

  const STATUS_COLOR = { pending:'#d97706', confirmed:'#059669', cancelled:'#dc2626', completed:'#1a56db', rescheduled:'#7c3aed' }
  const STATUS_BG    = { pending:'#fffbeb', confirmed:'#ecfdf5', cancelled:'#fef2f2', completed:'#ebf0ff', rescheduled:'#f5f3ff' }
  const STATUS_LABEL = { pending:'Pendiente', confirmed:'Confirmada', cancelled:'Cancelada', completed:'Atendida', rescheduled:'Reprogramada' }

  function ApptRow({ a }) {
    return (
      <div className="appointment-card" style={{ cursor:'pointer' }} onClick={() => navigate('/calendar')}>
        <div className="appt-time">
          <div className="time">{a.time}</div>
          <div className="date">{a.date?.slice(5).replace('-','/')}</div>
        </div>
        <div className="appt-divider"/>
        <div className="appt-info">
          <div className="appt-doctor">{a.patientName}</div>
          <div className="appt-specialty">{a.specialty}{a.reason ? ' — ' + a.reason : ''}</div>
        </div>
        <div className="appt-actions">
          <span style={{ padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:500,
            background: STATUS_BG[a.status]||'#f3f4f6',
            color: STATUS_COLOR[a.status]||'#374151' }}>
            {STATUS_LABEL[a.status]||a.status}
          </span>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Panel principal</h1>
        <div style={{ display:'flex', gap:8 }}>
          <button className="btn" onClick={load}>Actualizar</button>
          <button className="btn btn-primary" onClick={() => navigate('/calendar')}>Ver agenda</button>
        </div>
      </div>
      <div className="page-content">
        <div className="stats-grid" style={{ marginBottom:24 }}>
          <div className="stat-card">
            <div className="stat-label">Citas hoy</div>
            <div className="stat-value" style={{ color:'var(--color-primary)' }}>{today.length}</div>
            <div className="stat-sub">programadas para hoy</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Pendientes de confirmar</div>
            <div className="stat-value" style={{ color:'#d97706' }}>{pending.length}</div>
            <div className="stat-sub">requieren confirmacion</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Confirmadas hoy</div>
            <div className="stat-value" style={{ color:'#059669' }}>{confirmed.length}</div>
            <div className="stat-sub">listas para atender</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Atendidas hoy</div>
            <div className="stat-value" style={{ color:'var(--color-success)' }}>{completed.length}</div>
            <div className="stat-sub">consultas completadas</div>
          </div>
        </div>

        {loading ? (
          <div className="loading-center"><div className="spinner"/></div>
        ) : (
          <>
            <div className="section-label" style={{ marginBottom:12 }}>
              Citas de hoy — {new Date().toLocaleDateString('es-CO', { weekday:'long', day:'numeric', month:'long' })}
            </div>
            {today.length === 0 ? (
              <div className="card" style={{ textAlign:'center', color:'var(--color-text-secondary)', padding:24, marginBottom:20 }}>
                No hay citas para hoy. Las citas agendadas por pacientes apareceran aqui.
              </div>
            ) : (
              <div className="appointment-list" style={{ marginBottom:24 }}>
                {today.map(a => <ApptRow key={a.id} a={a}/>)}
              </div>
            )}

            {pending.length > 0 && (
              <>
                <div className="section-label" style={{ marginBottom:12 }}>
                  Pendientes de confirmacion ({pending.length})
                </div>
                <div className="appointment-list">
                  {pending.slice(0, 5).map(a => <ApptRow key={a.id} a={a}/>)}
                  {pending.length > 5 && (
                    <button className="btn" style={{ width:'100%', justifyContent:'center', marginTop:4 }}
                      onClick={() => navigate('/calendar')}>
                      Ver todas las pendientes
                    </button>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </>
  )
}

export default function Dashboard() {
  const { isDoctor } = useAuth()
  return isDoctor() ? <DoctorDashboard /> : <PatientDashboard />
}
