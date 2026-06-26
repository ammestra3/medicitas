import { useEffect, useState, useCallback } from 'react'
import { appointmentService, medicalRecordService, disabilityService, userService } from '../../api/services'
import { useAuth } from '../../context/AuthContext'
import { generateMedicalRecordPDF, generateDisabilityPDF } from '../../api/pdfGenerator'
import { useSignature } from '../../components/SignatureManager'
import SignatureManager from '../../components/SignatureManager'

const STATUS_LABEL = { pending:'Pendiente', confirmed:'Confirmada', cancelled:'Cancelada', completed:'Atendida', rescheduled:'Reprogramada' }
const STATUS_COLOR = { pending:'#d97706', confirmed:'#059669', cancelled:'#dc2626', completed:'#1a56db', rescheduled:'#7c3aed' }
const STATUS_BG    = { pending:'#fffbeb', confirmed:'#ecfdf5', cancelled:'#fef2f2', completed:'#ebf0ff', rescheduled:'#f5f3ff' }

function Badge({ status }) {
  return (
    <span style={{ padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:500,
      background: STATUS_BG[status]||'#f3f4f6', color: STATUS_COLOR[status]||'#374151' }}>
      {STATUS_LABEL[status]||status}
    </span>
  )
}

function getWeekDates(anchor) {
  const d = new Date(anchor)
  const day = d.getDay()
  const monday = new Date(d)
  monday.setDate(d.getDate() - (day === 0 ? 6 : day - 1))
  return Array.from({ length: 6 }, (_, i) => {
    const dd = new Date(monday)
    dd.setDate(monday.getDate() + i)
    return dd.toISOString().split('T')[0]
  })
}

function fmt(dateStr) {
  const [,m,d] = dateStr.split('-')
  return `${d}/${m}`
}

function RecordModal({ patientId, patientName, appointmentId, onClose, onCreated }) {
  const { user } = useAuth()
  const { signature } = useSignature()
  const [patients, setPatients] = useState([])
  const [form, setForm]   = useState({ diagnosis:'', notes:'', patientId, prescriptions:[] })
  const [loading, setLoading] = useState(false)
  const set  = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  const addP = () => setForm(f => ({ ...f, prescriptions:[...f.prescriptions,{medication:'',dose:'',frequency:'',duration:'',instructions:''}] }))
  const setP = (i,k) => e => setForm(f => { const p=[...f.prescriptions]; p[i]={...p[i],[k]:e.target.value}; return {...f,prescriptions:p} })
  const removeP = i => setForm(f => ({ ...f, prescriptions:f.prescriptions.filter((_,idx)=>idx!==i) }))

  const submit = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      const { data } = await medicalRecordService.create(form)
      onCreated(data)
      onClose()
    } catch { alert('Error al guardar el registro.') }
    finally { setLoading(false) }
  }

  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal" style={{ width:500, maxHeight:'90vh', overflowY:'auto' }}>
        <p className="modal-title">Historia clinica — {patientName}</p>
        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Diagnostico *</label>
            <input className="form-control" value={form.diagnosis} onChange={set('diagnosis')} required/>
          </div>
          <div className="form-group">
            <label className="form-label">Notas clinicas</label>
            <textarea className="form-control" rows={3} value={form.notes} onChange={set('notes')} style={{resize:'vertical'}}/>
          </div>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
            <p style={{fontSize:12,fontWeight:500,color:'var(--color-text-secondary)'}}>Formula medica</p>
            <button type="button" className="btn btn-sm" onClick={addP}>+ Medicamento</button>
          </div>
          {form.prescriptions.map((p,i) => (
            <div key={i} style={{background:'var(--color-bg)',borderRadius:'var(--radius-md)',padding:'10px 12px',marginBottom:8}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                {[['medication','Medicamento'],['dose','Dosis'],['frequency','Frecuencia'],['duration','Duracion']].map(([k,l])=>(
                  <div key={k} className="form-group" style={{margin:0}}>
                    <label className="form-label">{l}</label>
                    <input className="form-control" value={p[k]} onChange={setP(i,k)} style={{fontSize:12,padding:'6px 8px'}}/>
                  </div>
                ))}
              </div>
              <div className="form-group" style={{marginTop:8,marginBottom:0}}>
                <label className="form-label">Indicaciones</label>
                <input className="form-control" value={p.instructions} onChange={setP(i,'instructions')} style={{fontSize:12,padding:'6px 8px'}}/>
              </div>
              <button type="button" onClick={()=>removeP(i)} style={{marginTop:6,fontSize:11,color:'var(--color-danger)',background:'none',border:'none',cursor:'pointer'}}>Eliminar</button>
            </div>
          ))}
          <div className="modal-footer">
            <button type="button" className="btn" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading?<div className="spinner"/>:'Guardar historia'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function DisabilityModal({ patientId, patientName, onClose, onCreated }) {
  const [form, setForm] = useState({ reason:'', startDate:'', endDate:'', notes:'', patientId })
  const [loading, setLoading] = useState(false)
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  const submit = async (e) => {
    e.preventDefault(); setLoading(true)
    try { const { data } = await disabilityService.create(form); onCreated(data); onClose() }
    catch { alert('Error al guardar la incapacidad.') }
    finally { setLoading(false) }
  }
  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <p className="modal-title">Nueva incapacidad — {patientName}</p>
        <form onSubmit={submit}>
          <div className="form-group"><label className="form-label">Motivo *</label><input className="form-control" value={form.reason} onChange={set('reason')} required/></div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
            <div className="form-group"><label className="form-label">Inicio</label><input className="form-control" type="date" value={form.startDate} onChange={set('startDate')} required/></div>
            <div className="form-group"><label className="form-label">Fin</label><input className="form-control" type="date" value={form.endDate} onChange={set('endDate')} required/></div>
          </div>
          <div className="form-group"><label className="form-label">Observaciones</label><input className="form-control" value={form.notes} onChange={set('notes')}/></div>
          <div className="modal-footer">
            <button type="button" className="btn" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading?<div className="spinner"/>:'Guardar'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function AppointmentDetail({ appt, onClose, onUpdated }) {
  const { user } = useAuth()
  const { signature } = useSignature()
  const [records, setRecords]       = useState([])
  const [disabilities, setDisabilities] = useState([])
  const [modal, setModal]           = useState(null)
  const [loading, setLoading]       = useState(false)

  const doctorProfile = { name: user?.name, lastName: user?.lastName, medicalReg: user?.medicalReg, specialty: user?.specialty }

  useEffect(() => {
    if (appt) {
      medicalRecordService.getByPatient(appt.patientId || appt.id).catch(() => {})
      Promise.all([
        medicalRecordService.getByPatient(appt.patientId).catch(() => ({ data: [] })),
        disabilityService.getByPatient(appt.patientId).catch(() => ({ data: [] }))
      ]).then(([r, d]) => { setRecords(r.data); setDisabilities(d.data) })
    }
  }, [appt?.patientId])

  const handleAction = async (action) => {
    setLoading(true)
    try {
      let data
      if (action === 'confirm') ({ data } = await appointmentService.confirm(appt.id))
      if (action === 'complete') ({ data } = await appointmentService.complete(appt.id))
      if (action === 'cancel') ({ data } = await appointmentService.cancelByDoctor(appt.id, { reason: 'Cancelada por el medico' }))
      onUpdated(data)
    } finally { setLoading(false) }
  }

  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal" style={{ width:520, maxHeight:'90vh', overflowY:'auto' }}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16}}>
          <p className="modal-title" style={{margin:0}}>Detalle de cita</p>
          <Badge status={appt.status}/>
        </div>

        <div style={{background:'var(--color-bg)',borderRadius:'var(--radius-md)',padding:'12px 14px',marginBottom:14}}>
          <p style={{fontSize:13,fontWeight:500}}>{appt.patientName}</p>
          <p style={{fontSize:12,color:'var(--color-text-secondary)',marginTop:2}}>CC: {appt.patientDocumentId || '—'}</p>
          <p style={{fontSize:12,color:'var(--color-text-secondary)',marginTop:2}}>{appt.date} — {appt.time} — {appt.specialty}</p>
          {appt.reason && <p style={{fontSize:12,marginTop:4}}><strong>Motivo:</strong> {appt.reason}</p>}
        </div>

        <div style={{display:'flex',gap:8,marginBottom:16,flexWrap:'wrap'}}>
          {appt.status === 'pending'   && <button className="btn btn-primary btn-sm" onClick={() => handleAction('confirm')} disabled={loading}>Confirmar</button>}
          {['pending','confirmed'].includes(appt.status) && <>
            <button className="btn btn-sm" style={{background:'var(--color-success-bg)',color:'var(--color-success)',borderColor:'#6ee7b7'}}
              onClick={() => handleAction('complete')} disabled={loading}>Marcar atendida</button>
            <button className="btn btn-sm btn-danger" onClick={() => handleAction('cancel')} disabled={loading}>Cancelar cita</button>
          </>}
          {['pending','confirmed','completed'].includes(appt.status) && <>
            <button className="btn btn-sm btn-primary" onClick={() => setModal('record')}>+ Historia clinica</button>
            <button className="btn btn-sm" onClick={() => setModal('disability')}>+ Incapacidad</button>
          </>}
        </div>

        {records.length > 0 && (
          <div style={{marginBottom:14}}>
            <p style={{fontSize:12,fontWeight:500,color:'var(--color-text-secondary)',marginBottom:8}}>Historias clinicas</p>
            {records.map(r => (
              <div key={r.id} style={{background:'var(--color-surface)',border:'1px solid var(--color-border)',borderRadius:'var(--radius-md)',padding:'10px 12px',marginBottom:6,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div>
                  <p style={{fontSize:13,fontWeight:500}}>{r.diagnosis}</p>
                  <p style={{fontSize:11,color:'var(--color-text-secondary)'}}>{new Date(r.createdAt).toLocaleDateString('es-CO')}</p>
                </div>
                <button className="btn btn-sm" onClick={() => generateMedicalRecordPDF(r, signature, doctorProfile)}>PDF</button>
              </div>
            ))}
          </div>
        )}

        {disabilities.length > 0 && (
          <div style={{marginBottom:14}}>
            <p style={{fontSize:12,fontWeight:500,color:'var(--color-text-secondary)',marginBottom:8}}>Incapacidades</p>
            {disabilities.map(d => (
              <div key={d.id} style={{background:'var(--color-surface)',border:'1px solid var(--color-border)',borderRadius:'var(--radius-md)',padding:'10px 12px',marginBottom:6,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div>
                  <p style={{fontSize:13,fontWeight:500}}>{d.reason}</p>
                  <p style={{fontSize:11,color:'var(--color-text-secondary)'}}>{d.startDate} al {d.endDate}</p>
                </div>
                <button className="btn btn-sm" onClick={() => generateDisabilityPDF(d, signature, doctorProfile)}>PDF</button>
              </div>
            ))}
          </div>
        )}

        <div className="modal-footer">
          <button className="btn" onClick={onClose}>Cerrar</button>
        </div>
      </div>

      {modal === 'record' && (
        <RecordModal patientId={appt.patientId} patientName={appt.patientName}
          onClose={() => setModal(null)}
          onCreated={r => { setRecords(prev => [r, ...prev]); setModal(null) }}/>
      )}
      {modal === 'disability' && (
        <DisabilityModal patientId={appt.patientId} patientName={appt.patientName}
          onClose={() => setModal(null)}
          onCreated={d => { setDisabilities(prev => [d, ...prev]); setModal(null) }}/>
      )}
    </div>
  )
}

export default function DoctorCalendar() {
  const { user } = useAuth()
  const [tab, setTab]               = useState('today')
  const [today, setToday]           = useState([])
  const [pending, setPending]       = useState([])
  const [weekAppts, setWeekAppts]   = useState([])
  const [weekDates, setWeekDates]   = useState(getWeekDates(new Date()))
  const [selected, setSelected]     = useState(null)
  const [showSig, setShowSig]       = useState(false)
  const { signature }               = useSignature()
  const [loading, setLoading]       = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [t, p, w] = await Promise.all([
        appointmentService.getDoctorToday(),
        appointmentService.getDoctorPending(),
        appointmentService.getDoctorWeek(weekDates[0], weekDates[weekDates.length-1])
      ])
      setToday(t.data); setPending(p.data); setWeekAppts(w.data)
    } finally { setLoading(false) }
  }, [weekDates[0]])

  useEffect(() => { load() }, [load])

  const updateAppt = (updated) => {
    const upd = arr => arr.map(a => a.id === updated.id ? updated : a)
    setToday(upd); setPending(upd); setWeekAppts(upd)
    setSelected(updated)
  }

  const prevWeek = () => {
    const d = new Date(weekDates[0]); d.setDate(d.getDate() - 7)
    setWeekDates(getWeekDates(d))
  }
  const nextWeek = () => {
    const d = new Date(weekDates[0]); d.setDate(d.getDate() + 7)
    setWeekDates(getWeekDates(d))
  }

  const HOURS = Array.from({ length: 22 }, (_, i) => {
    const h = 7 + Math.floor(i/2)
    const m = i % 2 === 0 ? '00' : '30'
    return `${String(h).padStart(2,'0')}:${m}`
  })

  const apptByDateAndTime = (date, time) =>
    weekAppts.find(a => a.date === date && a.time === time)

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Agenda</h1>
        <div style={{display:'flex',gap:8}}>
          <button className="btn" onClick={() => setShowSig(true)} style={{fontSize:12,color:signature?'var(--color-success)':'var(--color-text-secondary)'}}>
            {signature ? '✓ Firma' : 'Configurar firma'}
          </button>
        </div>
      </div>

      <div className="page-content">
        <div className="stats-grid" style={{marginBottom:20}}>
          {[
            ['Hoy', today.length, 'var(--color-primary)'],
            ['Pendientes', pending.length, 'var(--color-warning)'],
            ['Confirmadas hoy', today.filter(a=>a.status==='confirmed').length, 'var(--color-success)'],
            ['Atendidas hoy', today.filter(a=>a.status==='completed').length, '#059669']
          ].map(([l,v,c]) => (
            <div key={l} className="stat-card">
              <div className="stat-label">{l}</div>
              <div className="stat-value" style={{color:c}}>{v}</div>
            </div>
          ))}
        </div>

        <div style={{display:'flex',gap:2,marginBottom:20,background:'var(--color-bg)',borderRadius:'var(--radius-md)',padding:4}}>
          {[['today','Hoy'],['pending','Pendientes'],['week','Semana']].map(([k,l]) => (
            <button key={k} onClick={() => setTab(k)} style={{
              flex:1,padding:'7px 12px',border:'none',cursor:'pointer',borderRadius:'var(--radius-sm)',fontSize:13,fontWeight:500,
              background:tab===k?'var(--color-surface)':'transparent',
              color:tab===k?'var(--color-primary)':'var(--color-text-secondary)',
              boxShadow:tab===k?'var(--shadow-sm)':'none'
            }}>{l}</button>
          ))}
        </div>

        {loading ? <div className="loading-center"><div className="spinner"/></div> : (
          <>
            {tab === 'today' && (
              today.length === 0
                ? <div className="card" style={{textAlign:'center',color:'var(--color-text-secondary)',padding:32}}>Sin citas para hoy.</div>
                : <div className="appointment-list">
                    {today.map(a => (
                      <div key={a.id} className="appointment-card" style={{cursor:'pointer'}} onClick={() => setSelected(a)}>
                        <div className="appt-time"><div className="time">{a.time}</div></div>
                        <div className="appt-divider"/>
                        <div className="appt-info">
                          <div className="appt-doctor">{a.patientName}</div>
                          <div className="appt-specialty">{a.specialty} {a.reason ? '— '+a.reason : ''}</div>
                        </div>
                        <div className="appt-actions"><Badge status={a.status}/></div>
                      </div>
                    ))}
                  </div>
            )}

            {tab === 'pending' && (
              pending.length === 0
                ? <div className="card" style={{textAlign:'center',color:'var(--color-text-secondary)',padding:32}}>No hay citas pendientes.</div>
                : <div className="appointment-list">
                    {pending.map(a => (
                      <div key={a.id} className="appointment-card" style={{cursor:'pointer'}} onClick={() => setSelected(a)}>
                        <div className="appt-time">
                          <div className="time">{a.time}</div>
                          <div className="date">{fmt(a.date)}</div>
                        </div>
                        <div className="appt-divider"/>
                        <div className="appt-info">
                          <div className="appt-doctor">{a.patientName}</div>
                          <div className="appt-specialty">{a.specialty}</div>
                        </div>
                        <div className="appt-actions"><Badge status={a.status}/></div>
                      </div>
                    ))}
                  </div>
            )}

            {tab === 'week' && (
              <div>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
                  <button className="btn btn-sm" onClick={prevWeek}>← Semana anterior</button>
                  <span style={{fontSize:13,fontWeight:500}}>{fmt(weekDates[0])} — {fmt(weekDates[weekDates.length-1])}</span>
                  <button className="btn btn-sm" onClick={nextWeek}>Semana siguiente →</button>
                </div>
                <div style={{overflowX:'auto'}}>
                  <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
                    <thead>
                      <tr>
                        <th style={{width:52,padding:'6px 8px',background:'var(--color-bg)',borderBottom:'1px solid var(--color-border)',textAlign:'left',color:'var(--color-text-secondary)'}}>Hora</th>
                        {weekDates.map(d => (
                          <th key={d} style={{padding:'6px 8px',background: d===new Date().toISOString().split('T')[0]?'var(--color-primary-light)':'var(--color-bg)',
                            borderBottom:'1px solid var(--color-border)',textAlign:'center',color:'var(--color-text-secondary)',minWidth:110}}>
                            {['Lun','Mar','Mie','Jue','Vie','Sab'][weekDates.indexOf(d)]}<br/>
                            <span style={{fontSize:11}}>{fmt(d)}</span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {HOURS.map(h => (
                        <tr key={h}>
                          <td style={{padding:'4px 8px',color:'var(--color-text-muted)',borderBottom:'1px solid var(--color-border)',verticalAlign:'top',paddingTop:6}}>{h}</td>
                          {weekDates.map(d => {
                            const appt = apptByDateAndTime(d, h)
                            return (
                              <td key={d} style={{padding:3,borderBottom:'1px solid var(--color-border)',borderLeft:'1px solid var(--color-border)',verticalAlign:'top',minHeight:32}}>
                                {appt && (
                                  <div onClick={() => setSelected(appt)} style={{
                                    background: STATUS_BG[appt.status]||'#f3f4f6',
                                    border:`1px solid ${STATUS_COLOR[appt.status]||'#d1d5db'}`,
                                    borderRadius:4, padding:'3px 6px', cursor:'pointer',
                                    borderLeft:`3px solid ${STATUS_COLOR[appt.status]||'#9ca3af'}`
                                  }}>
                                    <p style={{fontSize:11,fontWeight:500,color:STATUS_COLOR[appt.status]||'#374151',lineHeight:1.3}}>{appt.patientName?.split(' ')[0]}</p>
                                    <p style={{fontSize:10,color:'var(--color-text-muted)'}}>{appt.specialty?.slice(0,10)}</p>
                                  </div>
                                )}
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {selected && <AppointmentDetail appt={selected} onClose={() => setSelected(null)} onUpdated={updateAppt}/>}
      {showSig  && <SignatureManager onClose={() => setShowSig(false)}/>}
    </>
  )
}
