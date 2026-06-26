import { useEffect, useState } from 'react'
import { appointmentService, userService } from '../api/services'

const STATUS_LABEL = { pending:'Pendiente', confirmed:'Confirmada', cancelled:'Cancelada', completed:'Completada', rescheduled:'Reprogramada' }
const STATUS_COLOR = { pending:'#d97706', confirmed:'#059669', cancelled:'#dc2626', completed:'#1a56db', rescheduled:'#7c3aed' }
const STATUS_BG    = { pending:'#fffbeb', confirmed:'#ecfdf5', cancelled:'#fef2f2', completed:'#ebf0ff', rescheduled:'#f5f3ff' }
const SPECIALTIES  = ['Medicina general','Cardiologia','Dermatologia','Pediatria','Ginecologia','Traumatologia','Neurologia','Psiquiatria']

function Badge({ status }) {
  return (
    <span style={{ padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:500,
      background: STATUS_BG[status]||'#f3f4f6', color: STATUS_COLOR[status]||'#374151' }}>
      {STATUS_LABEL[status]||status}
    </span>
  )
}

/* ─── BOOK MODAL ─── */
function BookModal({ onClose, onBooked }) {
  const [step, setStep]           = useState(1)
  const [specialty, setSpecialty] = useState('')
  const [allDoctors, setAllDoctors] = useState([])
  const [doctor, setDoctor]       = useState(null)
  const [date, setDate]           = useState('')
  const [slots, setSlots]         = useState([])
  const [time, setTime]           = useState('')
  const [reason, setReason]       = useState('')
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')

  const today = new Date().toISOString().split('T')[0]

  /* Load all doctors once */
  useEffect(() => {
    userService.getDoctors().then(({ data }) => setAllDoctors(data)).catch(() => {})
  }, [])

  const filteredDoctors = specialty
    ? allDoctors.filter(d => d.specialty && d.specialty.toLowerCase() === specialty.toLowerCase())
    : allDoctors

  const doctorsToShow = filteredDoctors.length > 0 ? filteredDoctors : allDoctors

  /* Auto-select when only one doctor matches, reset when specialty changes */
  useEffect(() => {
    if (doctorsToShow.length === 1) {
      setDoctor(doctorsToShow[0])
    } else {
      setDoctor(null)
    }
  }, [specialty, allDoctors.length])

  const loadSlots = async () => {
    if (!doctor || !date) return
    setLoading(true)
    setSlots([])
    setTime('')
    try {
      const { data } = await appointmentService.getSlots(doctor.id, date)
      setSlots(data)
    } catch {
      setError('No se pudieron cargar los horarios. Intente de nuevo.')
    } finally { setLoading(false) }
  }

  /* Auto-load slots when doctor and date are both set */
  useEffect(() => {
    if (doctor && date) loadSlots()
  }, [doctor, date])

  const handleBook = async () => {
    if (!time) { setError('Selecciona un horario'); return }
    setLoading(true); setError('')
    try {
      const { data } = await appointmentService.create({
        doctorId: doctor.id,
        specialty,
        date,
        time: time + ':00',
        reason
      })
      onBooked(data)
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Error al agendar la cita')
    } finally { setLoading(false) }
  }

  const canNext1 = specialty
  const canNext2 = doctor && date

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ width: 500 }}>
        <p className="modal-title">Agendar nueva cita</p>

        {/* Progress steps */}
        <div style={{ display:'flex', gap:4, marginBottom:20 }}>
          {['Especialidad y medico','Fecha','Horario'].map((s, i) => (
            <div key={s} style={{
              flex:1, textAlign:'center', fontSize:11, fontWeight:500, paddingBottom:6,
              color: step > i ? 'var(--color-primary)' : 'var(--color-text-muted)',
              borderBottom: `2px solid ${step > i ? 'var(--color-primary)' : 'var(--color-border)'}`
            }}>
              {i+1}. {s}
            </div>
          ))}
        </div>

        {/* Step 1: specialty + doctor */}
        {step === 1 && (
          <>
            <div className="form-group">
              <label className="form-label">Especialidad</label>
              <select className="form-control" value={specialty}
                onChange={e => { setSpecialty(e.target.value); setDoctor(null) }}>
                <option value="">Seleccionar especialidad</option>
                {SPECIALTIES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>

            {specialty && (
              <div className="form-group">
                <label className="form-label">Medico</label>
                {filteredDoctors.length === 0 && allDoctors.length > 0 && (
                  <p style={{ fontSize:12, color:'var(--color-warning)', marginBottom:8,
                    background:'var(--color-warning-bg)', padding:'6px 10px', borderRadius:'var(--radius-sm)' }}>
                    Sin medicos con esta especialidad registrada. Mostrando todos los disponibles.
                  </p>
                )}
                {doctorsToShow.length === 0
                  ? <p style={{ fontSize:13, color:'var(--color-text-secondary)', padding:'8px 0' }}>
                      No hay medicos registrados en el sistema aun.
                    </p>
                  : <div style={{ display:'flex', flexDirection:'column', gap:6, maxHeight:200, overflowY:'auto' }}>
                      {doctorsToShow.map(d => (
                        <button key={d.id} type="button" onClick={() => setDoctor(d)} style={{
                          padding:'10px 12px', textAlign:'left', cursor:'pointer',
                          border: `1px solid ${doctor?.id===d.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
                          borderRadius:'var(--radius-md)',
                          background: doctor?.id===d.id ? 'var(--color-primary-light)' : 'var(--color-surface)'
                        }}>
                          <p style={{ fontSize:13, fontWeight:500,
                            color: doctor?.id===d.id ? 'var(--color-primary)' : 'var(--color-text)' }}>
                            {d.name}
                          </p>
                          <p style={{ fontSize:11, color:'var(--color-text-secondary)' }}>{d.specialty || 'Especialidad no registrada'}</p>
                        </button>
                      ))}
                    </div>
                }
              </div>
            )}

            <div className="modal-footer">
              <button className="btn" onClick={onClose}>Cancelar</button>
              <button className="btn btn-primary" disabled={!specialty || !doctor}
                onClick={() => setStep(2)}>
                Siguiente
              </button>
            </div>
          </>
        )}

        {/* Step 2: date */}
        {step === 2 && (
          <>
            <div style={{ background:'var(--color-bg)', borderRadius:'var(--radius-md)', padding:'10px 12px', marginBottom:14, fontSize:13 }}>
              Medico: <strong>{doctor?.name}</strong> — {specialty}
            </div>
            <div className="form-group">
              <label className="form-label">Fecha de la cita</label>
              <input className="form-control" type="date" value={date} min={today}
                onChange={e => { setDate(e.target.value); setTime(''); setSlots([]) }} />
            </div>
            {loading && <div className="loading-center" style={{ padding:12 }}><div className="spinner"/></div>}
            {error && <p style={{ fontSize:12, color:'var(--color-danger)', marginBottom:8 }}>{error}</p>}
            <div className="modal-footer">
              <button className="btn" onClick={() => setStep(1)}>Atras</button>
              <button className="btn btn-primary" disabled={!date || loading}
                onClick={() => { if (slots.length > 0) setStep(3); else loadSlots().then(() => setStep(3)) }}>
                Ver horarios
              </button>
            </div>
          </>
        )}

        {/* Step 3: time slot */}
        {step === 3 && (
          <>
            <div style={{ background:'var(--color-bg)', borderRadius:'var(--radius-md)', padding:'10px 12px', marginBottom:14, fontSize:13 }}>
              {doctor?.name} — <strong>{date}</strong>
            </div>

            <label className="form-label">Horario disponible (7:00 am — 6:00 pm)</label>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:5, marginBottom:14, maxHeight:220, overflowY:'auto' }}>
              {slots.map(s => (
                <button key={s.time} type="button" disabled={!s.available}
                  onClick={() => s.available && setTime(s.time)} style={{
                    padding:'7px 2px', fontSize:12, fontWeight:500, borderRadius:'var(--radius-sm)',
                    cursor: s.available ? 'pointer' : 'not-allowed',
                    border: `1px solid ${time===s.time ? 'var(--color-primary)' : s.available ? 'var(--color-border)' : '#e5e7eb'}`,
                    background: !s.available ? 'var(--color-bg)' : time===s.time ? 'var(--color-primary)' : 'var(--color-surface)',
                    color: !s.available ? '#d1d5db' : time===s.time ? '#fff' : 'var(--color-text)',
                    textDecoration: !s.available ? 'line-through' : 'none'
                  }}>
                  {s.time}
                </button>
              ))}
            </div>

            <div className="form-group">
              <label className="form-label">Motivo de la consulta</label>
              <input className="form-control" value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Describe brevemente el motivo" />
            </div>

            {error && <p style={{ fontSize:12, color:'var(--color-danger)', marginBottom:8 }}>{error}</p>}

            <div style={{ display:'flex', gap:6, alignItems:'center', marginBottom:14 }}>
              <span style={{ width:12, height:12, borderRadius:2, background:'var(--color-primary)', display:'inline-block' }}/>
              <span style={{ fontSize:11, color:'var(--color-text-secondary)' }}>Seleccionado</span>
              <span style={{ width:12, height:12, borderRadius:2, background:'var(--color-bg)', border:'1px solid var(--color-border)', display:'inline-block', marginLeft:8 }}/>
              <span style={{ fontSize:11, color:'var(--color-text-secondary)' }}>Ocupado</span>
            </div>

            <div className="modal-footer">
              <button className="btn" onClick={() => { setStep(2); setTime('') }}>Atras</button>
              <button className="btn btn-primary" disabled={!time || loading} onClick={handleBook}>
                {loading ? <div className="spinner"/> : 'Confirmar cita'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

/* ─── CANCEL MODAL ─── */
function CancelModal({ appointment, onClose, onDone }) {
  const [reason, setReason]   = useState('')
  const [loading, setLoading] = useState(false)
  const handle = async () => {
    setLoading(true)
    try {
      const { data } = await appointmentService.cancel(appointment.id, { reason })
      onDone(data); onClose()
    } catch (err) { alert(err.response?.data?.message || 'Error al cancelar') }
    finally { setLoading(false) }
  }
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <p className="modal-title">Cancelar cita</p>
        <div style={{ background:'var(--color-danger-bg)', border:'1px solid #fca5a5',
          borderRadius:'var(--radius-sm)', padding:'10px 12px', fontSize:13, color:'#b91c1c', marginBottom:14 }}>
          Se cancelara la cita con <strong>{appointment.doctorName}</strong> el {appointment.date} a las {appointment.time}.
        </div>
        <div className="form-group">
          <label className="form-label">Motivo (opcional)</label>
          <input className="form-control" value={reason} onChange={e => setReason(e.target.value)}
            placeholder="Razon de la cancelacion" />
        </div>
        <div className="modal-footer">
          <button className="btn" onClick={onClose}>Mantener</button>
          <button className="btn btn-danger" onClick={handle} disabled={loading}>
            {loading ? <div className="spinner"/> : 'Cancelar cita'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── RESCHEDULE MODAL ─── */
function RescheduleModal({ appointment, onClose, onDone }) {
  const [date, setDate]       = useState('')
  const [slots, setSlots]     = useState([])
  const [time, setTime]       = useState('')
  const [reason, setReason]   = useState('')
  const [loading, setLoading] = useState(false)
  const today = new Date().toISOString().split('T')[0]

  const loadSlots = async (d) => {
    if (!appointment.doctorId || !d) return
    try {
      const { data } = await appointmentService.getSlots(appointment.doctorId, d)
      setSlots(data); setTime('')
    } catch { setSlots([]) }
  }

  const handle = async () => {
    if (!date || !time) return
    setLoading(true)
    try {
      const { data } = await appointmentService.reschedule(appointment.id, { date, time: time+':00', reason })
      onDone(data); onClose()
    } catch (err) { alert(err.response?.data?.message || 'Error al reprogramar') }
    finally { setLoading(false) }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ width:460 }}>
        <p className="modal-title">Reprogramar cita</p>
        <p style={{ fontSize:12, color:'var(--color-text-secondary)', marginBottom:14 }}>
          Cita actual: <strong>{appointment.date}</strong> a las <strong>{appointment.time}</strong> con {appointment.doctorName}
        </p>
        <div className="form-group">
          <label className="form-label">Nueva fecha</label>
          <input className="form-control" type="date" value={date} min={today}
            onChange={e => { setDate(e.target.value); loadSlots(e.target.value) }} />
        </div>
        {slots.length > 0 && (
          <div className="form-group">
            <label className="form-label">Nuevo horario</label>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:5 }}>
              {slots.map(s => (
                <button key={s.time} type="button" disabled={!s.available}
                  onClick={() => s.available && setTime(s.time)} style={{
                    padding:'7px 2px', fontSize:12, borderRadius:'var(--radius-sm)',
                    cursor: s.available ? 'pointer' : 'not-allowed',
                    border:`1px solid ${time===s.time ? 'var(--color-primary)' : s.available ? 'var(--color-border)' : '#e5e7eb'}`,
                    background: !s.available ? 'var(--color-bg)' : time===s.time ? 'var(--color-primary)' : 'var(--color-surface)',
                    color: !s.available ? '#d1d5db' : time===s.time ? '#fff' : 'var(--color-text)',
                    textDecoration: !s.available ? 'line-through' : 'none'
                  }}>
                  {s.time}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="form-group">
          <label className="form-label">Motivo (opcional)</label>
          <input className="form-control" value={reason} onChange={e => setReason(e.target.value)} />
        </div>
        <div className="modal-footer">
          <button className="btn" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" disabled={!date || !time || loading} onClick={handle}>
            {loading ? <div className="spinner"/> : 'Reprogramar'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── MAIN PAGE ─── */
export default function Appointments() {
  const [appointments, setAppointments]     = useState([])
  const [loading, setLoading]               = useState(true)
  const [filter, setFilter]                 = useState('all')
  const [showBook, setShowBook]             = useState(false)
  const [cancelTarget, setCancelTarget]     = useState(null)
  const [rescheduleTarget, setRescheduleTarget] = useState(null)

  const reload = () => {
    setLoading(true)
    appointmentService.getAll()
      .then(({ data }) => setAppointments(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { reload() }, [])

  const update = (updated) =>
    setAppointments(prev => prev.map(a => a.id === updated.id ? updated : a))

  const add = () => reload()

  const filtered = filter === 'all'
    ? appointments
    : appointments.filter(a => a.status === filter)

  const counts = {
    upcoming:  appointments.filter(a => ['pending','confirmed'].includes(a.status)).length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
    completed: appointments.filter(a => a.status === 'completed').length,
  }

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Mis citas</h1>
        <button className="btn btn-primary" onClick={() => setShowBook(true)}>+ Nueva cita</button>
      </div>

      <div className="page-content">
        <div className="stats-grid" style={{ marginBottom:20 }}>
          {[
            ['Proximas',   counts.upcoming,  'var(--color-primary)'],
            ['Canceladas', counts.cancelled, 'var(--color-danger)'],
            ['Completadas',counts.completed, 'var(--color-success)'],
            ['Total',      appointments.length, 'var(--color-text-secondary)']
          ].map(([l,v,c]) => (
            <div key={l} className="stat-card">
              <div className="stat-label">{l}</div>
              <div className="stat-value" style={{ color:c }}>{v}</div>
            </div>
          ))}
        </div>

        <div style={{ display:'flex', gap:6, marginBottom:16, flexWrap:'wrap' }}>
          {[['all','Todas'],['pending','Pendientes'],['confirmed','Confirmadas'],
            ['cancelled','Canceladas'],['completed','Completadas']].map(([k,l]) => (
            <button key={k} onClick={() => setFilter(k)} style={{
              padding:'5px 12px', borderRadius:20, fontSize:12, fontWeight:500, cursor:'pointer',
              border:`1px solid ${filter===k ? 'var(--color-primary)' : 'var(--color-border)'}`,
              background: filter===k ? 'var(--color-primary-light)' : 'var(--color-surface)',
              color: filter===k ? 'var(--color-primary)' : 'var(--color-text-secondary)'
            }}>{l}</button>
          ))}
        </div>

        {loading ? (
          <div className="loading-center"><div className="spinner"/></div>
        ) : filtered.length === 0 ? (
          <div className="card" style={{ textAlign:'center', color:'var(--color-text-secondary)', padding:32 }}>
            No hay citas en esta categoria.
          </div>
        ) : (
          <div className="appointment-list">
            {filtered.map(a => (
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
                  {a.cancelReason && <div style={{ fontSize:11, color:'var(--color-danger)', marginTop:2 }}>Motivo cancelacion: {a.cancelReason}</div>}
                </div>
                <div className="appt-actions">
                  <Badge status={a.status}/>
                  {['pending','confirmed'].includes(a.status) && <>
                    <button className="icon-btn" title="Reprogramar" onClick={() => setRescheduleTarget(a)}>
                      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" stroke="currentColor" style={{width:13,height:13}}>
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    <button className="icon-btn danger" title="Cancelar" onClick={() => setCancelTarget(a)}>
                      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" stroke="currentColor" style={{width:13,height:13}}>
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showBook && <BookModal onClose={() => setShowBook(false)} onBooked={add} />}
      {cancelTarget && <CancelModal appointment={cancelTarget} onClose={() => setCancelTarget(null)} onDone={update} />}
      {rescheduleTarget && <RescheduleModal appointment={rescheduleTarget}
        onClose={() => setRescheduleTarget(null)}
        onDone={() => { reload() }} />}
    </>
  )
}
