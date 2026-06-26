import { useEffect, useState } from 'react'
import { userService, medicalRecordService, disabilityService } from '../../api/services'
import { generateMedicalRecordPDF, generateDisabilityPDF } from '../../api/pdfGenerator'
import SignatureManager, { useSignature } from '../../components/SignatureManager'
import { useAuth } from '../../context/AuthContext'

function NewRecordModal({ patient, onClose, onCreated }) {
  const [form, setForm] = useState({ diagnosis:'', notes:'', patientId: patient.id, prescriptions:[] })
  const [loading, setLoading] = useState(false)
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  const addP = () => setForm(f => ({ ...f, prescriptions:[...f.prescriptions, { medication:'',dose:'',frequency:'',duration:'',instructions:'' }] }))
  const setP = (i,k) => e => setForm(f => { const p=[...f.prescriptions]; p[i]={...p[i],[k]:e.target.value}; return {...f,prescriptions:p} })
  const removeP = i => setForm(f => ({ ...f, prescriptions: f.prescriptions.filter((_,idx)=>idx!==i) }))

  const submit = async (e) => {
    e.preventDefault(); setLoading(true)
    try { const { data } = await medicalRecordService.create(form); onCreated(data); onClose() }
    catch { alert('Error al guardar el registro.') }
    finally { setLoading(false) }
  }

  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal" style={{ width:500, maxHeight:'90vh', overflowY:'auto' }}>
        <p className="modal-title">Nuevo registro medico — {patient.name}</p>
        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Diagnostico <span style={{ color:'var(--color-danger)' }}>*</span></label>
            <input className="form-control" value={form.diagnosis} onChange={set('diagnosis')} required />
          </div>
          <div className="form-group">
            <label className="form-label">Notas clinicas</label>
            <textarea className="form-control" rows={3} value={form.notes} onChange={set('notes')} style={{ resize:'vertical' }} />
          </div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
            <p style={{ fontSize:12, fontWeight:500, color:'var(--color-text-secondary)' }}>Formula medica</p>
            <button type="button" className="btn btn-sm" onClick={addP}>+ Agregar medicamento</button>
          </div>
          {form.prescriptions.map((p,i) => (
            <div key={i} style={{ background:'var(--color-bg)', borderRadius:'var(--radius-md)', padding:'10px 12px', marginBottom:8 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                {[['medication','Medicamento'],['dose','Dosis'],['frequency','Frecuencia'],['duration','Duracion']].map(([k,label]) => (
                  <div key={k} className="form-group" style={{ margin:0 }}>
                    <label className="form-label">{label}</label>
                    <input className="form-control" value={p[k]} onChange={setP(i,k)} style={{ fontSize:12,padding:'6px 8px' }} />
                  </div>
                ))}
              </div>
              <div className="form-group" style={{ marginTop:8, marginBottom:0 }}>
                <label className="form-label">Indicaciones</label>
                <input className="form-control" value={p.instructions} onChange={setP(i,'instructions')} style={{ fontSize:12,padding:'6px 8px' }} />
              </div>
              <button type="button" onClick={() => removeP(i)} style={{ marginTop:6,fontSize:11,color:'var(--color-danger)',background:'none',border:'none',cursor:'pointer' }}>Eliminar</button>
            </div>
          ))}
          <div className="modal-footer">
            <button type="button" className="btn" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? <div className="spinner"/> : 'Guardar registro'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function NewDisabilityModal({ patient, onClose, onCreated }) {
  const [form, setForm] = useState({ reason:'', startDate:'', endDate:'', notes:'', patientId: patient.id })
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
        <p className="modal-title">Nueva incapacidad — {patient.name}</p>
        <form onSubmit={submit}>
          <div className="form-group"><label className="form-label">Motivo <span style={{ color:'var(--color-danger)' }}>*</span></label><input className="form-control" value={form.reason} onChange={set('reason')} required /></div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            <div className="form-group"><label className="form-label">Fecha inicio</label><input className="form-control" type="date" value={form.startDate} onChange={set('startDate')} required /></div>
            <div className="form-group"><label className="form-label">Fecha fin</label><input className="form-control" type="date" value={form.endDate} onChange={set('endDate')} required /></div>
          </div>
          <div className="form-group"><label className="form-label">Observaciones</label><input className="form-control" value={form.notes} onChange={set('notes')} /></div>
          <div className="modal-footer">
            <button type="button" className="btn" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? <div className="spinner"/> : 'Guardar'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function PatientRecords() {
  const { user } = useAuth()
  const [patients, setPatients] = useState([])
  const [selected, setSelected] = useState(null)
  const [records, setRecords] = useState([])
  const [disabilities, setDisabilities] = useState([])
  const [modal, setModal] = useState(null)
  const [tab, setTab] = useState('records')
  const [showSignature, setShowSignature] = useState(false)
  const { signature } = useSignature()

  const doctorProfile = {
    name:       user?.name,
    lastName:   user?.lastName,
    medicalReg: user?.medicalReg,
    specialty:  user?.specialty
  }

  useEffect(() => { userService.getPatients().then(({ data }) => setPatients(data)) }, [])

  const loadPatient = async (p) => {
    setSelected(p)
    const [r, d] = await Promise.all([medicalRecordService.getByPatient(p.id), disabilityService.getByPatient(p.id)])
    setRecords(r.data); setDisabilities(d.data)
  }

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Registros de pacientes</h1>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <button className="btn" onClick={() => setShowSignature(true)} style={{
            fontSize:12,
            color: signature ? 'var(--color-success)' : 'var(--color-text-secondary)',
            borderColor: signature ? '#6ee7b7' : undefined
          }}>
            {signature ? '✓ Firma configurada' : 'Configurar firma'}
          </button>
          {selected && <>
            <button className="btn btn-primary" onClick={() => setModal('record')}>+ Registro medico</button>
            <button className="btn" onClick={() => setModal('disability')}>+ Incapacidad</button>
          </>}
        </div>
      </div>

      <div className="page-content" style={{ display:'flex', gap:20, alignItems:'flex-start' }}>
        <div style={{ width:220, flexShrink:0 }}>
          <p style={{ fontSize:12, fontWeight:500, color:'var(--color-text-secondary)', marginBottom:8 }}>Pacientes</p>
          <div style={{ background:'var(--color-surface)', border:'1px solid var(--color-border)', borderRadius:'var(--radius-lg)', overflow:'hidden' }}>
            {patients.length === 0
              ? <p style={{ padding:16, fontSize:13, color:'var(--color-text-secondary)', textAlign:'center' }}>Sin pacientes registrados</p>
              : patients.map(p => (
                <button key={p.id} onClick={() => loadPatient(p)} style={{
                  display:'block', width:'100%', padding:'10px 14px', border:'none', textAlign:'left', cursor:'pointer', fontSize:13,
                  borderBottom:'1px solid var(--color-border)',
                  background: selected?.id===p.id ? 'var(--color-primary-light)' : 'transparent',
                  color: selected?.id===p.id ? 'var(--color-primary)' : 'var(--color-text)',
                  fontWeight: selected?.id===p.id ? 500 : 400
                }}>
                  {p.name}
                  <span style={{ display:'block', fontSize:11, color:'var(--color-text-secondary)' }}>CC: {p.documentId || '—'}</span>
                </button>
              ))}
          </div>
        </div>

        <div style={{ flex:1 }}>
          {!selected
            ? <div className="card" style={{ textAlign:'center', color:'var(--color-text-secondary)', padding:40 }}>Selecciona un paciente para ver su historial.</div>
            : (
              <>
                <div style={{ display:'flex', gap:2, marginBottom:16, background:'var(--color-bg)', borderRadius:'var(--radius-md)', padding:4 }}>
                  {[['records','Registros medicos'],['disabilities','Incapacidades']].map(([k,label]) => (
                    <button key={k} onClick={() => setTab(k)} style={{
                      flex:1, padding:'7px 12px', border:'none', cursor:'pointer', borderRadius:'var(--radius-sm)', fontSize:13, fontWeight:500,
                      background: tab===k ? 'var(--color-surface)' : 'transparent',
                      color: tab===k ? 'var(--color-primary)' : 'var(--color-text-secondary)'
                    }}>{label}</button>
                  ))}
                </div>

                {tab==='records' && (records.length===0
                  ? <div className="card" style={{ textAlign:'center', color:'var(--color-text-secondary)', padding:32 }}>Sin registros para este paciente.</div>
                  : records.map(r => (
                    <div key={r.id} className="card" style={{ marginBottom:10 }}>
                      <div style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
                        <div style={{ flex:1 }}>
                          <p style={{ fontSize:13, fontWeight:500 }}>{r.diagnosis}</p>
                          <p style={{ fontSize:12, color:'var(--color-text-secondary)', marginTop:2 }}>{new Date(r.createdAt).toLocaleDateString('es-CO')}</p>
                          {r.notes && <p style={{ fontSize:12, marginTop:6, color:'var(--color-text-secondary)' }}>{r.notes}</p>}
                          {r.prescriptions?.length > 0 && (
                            <div style={{ marginTop:10 }}>
                              <p style={{ fontSize:11, fontWeight:500, color:'var(--color-text-secondary)', marginBottom:6 }}>Formula medica</p>
                              {r.prescriptions.map(p => (
                                <div key={p.id} style={{ background:'var(--color-bg)', borderRadius:'var(--radius-sm)', padding:'8px 10px', fontSize:12, marginBottom:4 }}>
                                  <strong>{p.medication}</strong> — {p.dose} — {p.frequency}
                                  {p.instructions && <span style={{ color:'var(--color-text-secondary)' }}> — {p.instructions}</span>}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <button className="btn btn-sm" onClick={() => generateMedicalRecordPDF(r, signature, doctorProfile)}>
                          Descargar PDF
                        </button>
                      </div>
                    </div>
                  )))}

                {tab==='disabilities' && (disabilities.length===0
                  ? <div className="card" style={{ textAlign:'center', color:'var(--color-text-secondary)', padding:32 }}>Sin incapacidades.</div>
                  : <div className="table-wrapper">
                      <table>
                        <thead><tr><th>Motivo</th><th>Inicio</th><th>Fin</th><th>Notas</th><th></th></tr></thead>
                        <tbody>{disabilities.map(d => (
                          <tr key={d.id}>
                            <td>{d.reason}</td>
                            <td>{new Date(d.startDate + 'T00:00:00').toLocaleDateString('es-CO')}</td>
                            <td>{new Date(d.endDate + 'T00:00:00').toLocaleDateString('es-CO')}</td>
                            <td>{d.notes||'—'}</td>
                            <td><button className="btn btn-sm" onClick={() => generateDisabilityPDF(d, signature, doctorProfile)}>PDF</button></td>
                          </tr>
                        ))}</tbody>
                      </table>
                    </div>)}
              </>
            )}
        </div>
      </div>

      {modal==='record'     && selected && <NewRecordModal    patient={selected} onClose={() => setModal(null)} onCreated={r => setRecords(prev=>[r,...prev])} />}
      {modal==='disability' && selected && <NewDisabilityModal patient={selected} onClose={() => setModal(null)} onCreated={d => setDisabilities(prev=>[d,...prev])} />}
      {showSignature && <SignatureManager onClose={() => setShowSignature(false)} />}
    </>
  )
}
