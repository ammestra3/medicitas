import { useEffect, useState } from 'react'
import { medicalRecordService, disabilityService } from '../../api/services'
import { generateMedicalRecordPDF, generateDisabilityPDF } from '../../api/pdfGenerator'

function RecordCard({ record }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="card" style={{ marginBottom:10 }}>
      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ flex:1 }}>
          <p style={{ fontSize:13, fontWeight:500 }}>{record.diagnosis}</p>
          <p style={{ fontSize:12, color:'var(--color-text-secondary)', marginTop:2 }}>
            {record.doctorName} — {new Date(record.createdAt).toLocaleDateString('es-CO')}
          </p>
        </div>
        <button className="btn btn-sm" onClick={() => generateMedicalRecordPDF(record, null, null)}>Descargar PDF</button>
        <button className="btn btn-sm" onClick={() => setOpen(o=>!o)}>{open ? 'Ocultar' : 'Ver detalle'}</button>
      </div>
      {open && (
        <div style={{ marginTop:14, paddingTop:14, borderTop:'1px solid var(--color-border)' }}>
          {record.notes && <p style={{ fontSize:13, marginBottom:10 }}><strong>Notas: </strong>{record.notes}</p>}
          {record.prescriptions?.length > 0 && (
            <div>
              <p style={{ fontSize:12, fontWeight:500, color:'var(--color-text-secondary)', marginBottom:8 }}>Formula medica (solo lectura)</p>
              {record.prescriptions.map(p => (
                <div key={p.id} style={{ background:'var(--color-bg)', borderRadius:'var(--radius-sm)', padding:'10px 12px', fontSize:13, marginBottom:6 }}>
                  <p style={{ fontWeight:500 }}>{p.medication} — {p.dose}</p>
                  <p style={{ color:'var(--color-text-secondary)', marginTop:2 }}>{p.frequency} · Duracion: {p.duration??'Indefinida'}</p>
                  {p.instructions && <p style={{ color:'var(--color-text-secondary)' }}>Indicaciones: {p.instructions}</p>}
                </div>
              ))}
            </div>
          )}
          <p style={{ fontSize:11, color:'var(--color-text-muted)', marginTop:10 }}>
            Documento de solo lectura. Solo el medico tratante puede modificarlo.
          </p>
        </div>
      )}
    </div>
  )
}

export default function MedicalHistory() {
  const [records, setRecords] = useState([])
  const [disabilities, setDisabilities] = useState([])
  const [tab, setTab] = useState('records')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([medicalRecordService.myRecords(), disabilityService.myDisabilities()])
      .then(([r,d]) => { setRecords(r.data); setDisabilities(d.data) })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading-center"><div className="spinner" /></div>

  return (
    <>
      <div className="page-header"><h1 className="page-title">Historia clinica</h1></div>
      <div className="page-content">
        <div style={{ display:'flex', gap:2, marginBottom:20, background:'var(--color-bg)', borderRadius:'var(--radius-md)', padding:4 }}>
          {[['records','Registros medicos'],['prescriptions','Formula medica'],['disabilities','Incapacidades']].map(([k,label]) => (
            <button key={k} onClick={() => setTab(k)} style={{
              flex:1, padding:'7px 12px', border:'none', cursor:'pointer', borderRadius:'var(--radius-sm)', fontSize:13, fontWeight:500,
              background: tab===k ? 'var(--color-surface)' : 'transparent',
              color: tab===k ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              boxShadow: tab===k ? 'var(--shadow-sm)' : 'none'
            }}>{label}</button>
          ))}
        </div>

        {tab==='records' && (records.length===0
          ? <div className="card" style={{ textAlign:'center', color:'var(--color-text-secondary)', padding:32 }}>Sin registros medicos.</div>
          : records.map(r => <RecordCard key={r.id} record={r} />))}

        {tab==='prescriptions' && (records.filter(r=>r.prescriptions?.length>0).length===0
          ? <div className="card" style={{ textAlign:'center', color:'var(--color-text-secondary)', padding:32 }}>Sin formulas medicas.</div>
          : records.filter(r=>r.prescriptions?.length>0).map(r => (
            <div key={r.id} className="card" style={{ marginBottom:10 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                <p style={{ fontSize:12, color:'var(--color-text-secondary)' }}>{r.doctorName} — {new Date(r.createdAt).toLocaleDateString('es-CO')}</p>
                <button className="btn btn-sm" onClick={() => generateMedicalRecordPDF(r, null, null)}>Descargar PDF</button>
              </div>
              {r.prescriptions.map(p => (
                <div key={p.id} style={{ background:'var(--color-bg)', borderRadius:'var(--radius-sm)', padding:'10px 12px', fontSize:13, marginBottom:6 }}>
                  <p style={{ fontWeight:500 }}>{p.medication} — {p.dose}</p>
                  <p style={{ color:'var(--color-text-secondary)', marginTop:2 }}>{p.frequency} · {p.duration??'Indefinida'}</p>
                </div>
              ))}
            </div>
          )))}

        {tab==='disabilities' && (disabilities.length===0
          ? <div className="card" style={{ textAlign:'center', color:'var(--color-text-secondary)', padding:32 }}>Sin incapacidades.</div>
          : <div className="table-wrapper">
              <table>
                <thead><tr><th>Motivo</th><th>Inicio</th><th>Fin</th><th>Medico</th><th></th></tr></thead>
                <tbody>{disabilities.map(d => (
                  <tr key={d.id}>
                    <td>{d.reason}</td>
                    <td>{new Date(d.startDate + 'T00:00:00').toLocaleDateString('es-CO')}</td>
                    <td>{new Date(d.endDate + 'T00:00:00').toLocaleDateString('es-CO')}</td>
                    <td>{d.doctorName}</td>
                    <td><button className="btn btn-sm" onClick={() => generateDisabilityPDF(d, null, null)}>PDF</button></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>)}
      </div>
    </>
  )
}
