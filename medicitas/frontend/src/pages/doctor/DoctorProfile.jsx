import { useEffect, useState } from 'react'
import { userService, authService } from '../../api/services'
import FormField from '../../components/FormField'
import { validate, toUpperName, onlyNumbers } from '../../api/validators'
import SignatureManager, { useSignature } from '../../components/SignatureManager'

const SPECIALTIES = [
  'Medicina general','Cardiologia','Dermatologia',
  'Pediatria','Ginecologia','Traumatologia','Neurologia','Psiquiatria'
]

export default function DoctorProfile() {
  const [profile, setProfile]       = useState(null)
  const [editing, setEditing]       = useState(false)
  const [form, setForm]             = useState({})
  const [errors, setErrors]         = useState({})
  const [msg, setMsg]               = useState('')
  const [msgType, setMsgType]       = useState('success')
  const [pwForm, setPwForm]         = useState({ currentPassword:'', newPassword:'', confirm:'' })
  const [pwMsg, setPwMsg]           = useState('')
  const [showSig, setShowSig]       = useState(false)
  const { signature }               = useSignature()

  useEffect(() => {
    userService.getProfile().then(({ data }) => { setProfile(data); setForm(data) })
  }, [])

  const set  = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const setE = (k, v) => setErrors(e => ({ ...e, [k]: v || undefined }))
  const setPw = k => e => setPwForm(f => ({ ...f, [k]: e.target.value }))

  const handleName  = (k, raw) => { const v=toUpperName(raw); set(k,v); setE(k, validate('name',v)) }
  const handlePhone = (raw) => {
    const v = onlyNumbers(raw).slice(0,10)
    set('phone', v)
    setE('phone', v && v.length !== 10 ? 'Exactamente 10 digitos' : undefined)
  }

  const saveProfile = async (e) => {
    e.preventDefault()
    const errs = {}
    if (form.name     && validate('name', form.name))     errs.name     = validate('name', form.name)
    if (form.lastName && validate('name', form.lastName)) errs.lastName = validate('name', form.lastName)
    if (form.phone    && validate('phone', form.phone))   errs.phone    = validate('phone', form.phone)
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    try {
      const { data } = await userService.updateDoctorProfile({
        name:      form.name,
        lastName:  form.lastName,
        phone:     form.phone,
        specialty: form.specialty
      })
      setProfile(data); setEditing(false); setErrors({})
      setMsg('Perfil actualizado correctamente.'); setMsgType('success')
      setTimeout(() => setMsg(''), 4000)
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Error al guardar.'
      setMsg(errMsg); setMsgType('error')
      setTimeout(() => setMsg(''), 6000)
    }
  }

  const changePassword = async (e) => {
    e.preventDefault()
    if (pwForm.newPassword !== pwForm.confirm) { setPwMsg('Las contrasenas no coinciden.'); return }
    if (pwForm.newPassword.length < 6) { setPwMsg('Minimo 6 caracteres.'); return }
    try {
      await authService.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword })
      setPwMsg('Contrasena actualizada correctamente.')
      setPwForm({ currentPassword:'', newPassword:'', confirm:'' })
    } catch { setPwMsg('Contrasena actual incorrecta.') }
    setTimeout(() => setPwMsg(''), 4000)
  }

  const nextSpecialtyDate = () => {
    if (!profile?.lastSpecialtyUpdate) return null
    const d = new Date(profile.lastSpecialtyUpdate)
    d.setDate(d.getDate() + 7)
    return d.toLocaleDateString('es-CO', { day:'2-digit', month:'long', year:'numeric' })
  }

  if (!profile) return <div className="loading-center"><div className="spinner"/></div>

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Mi perfil</h1>
        <div style={{ display:'flex', gap:8 }}>
          <button className="btn" onClick={() => setShowSig(true)} style={{
            fontSize:12, color: signature ? 'var(--color-success)' : 'var(--color-text-secondary)',
            borderColor: signature ? '#6ee7b7' : undefined
          }}>
            {signature ? '✓ Firma configurada' : 'Configurar firma'}
          </button>
          {!editing && <button className="btn btn-primary" onClick={() => setEditing(true)}>Editar perfil</button>}
        </div>
      </div>

      <div className="page-content">
        {msg && (
          <div style={{
            background: msgType==='success' ? 'var(--color-success-bg)' : 'var(--color-danger-bg)',
            border: `1px solid ${msgType==='success' ? '#6ee7b7' : '#fca5a5'}`,
            color: msgType==='success' ? 'var(--color-success)' : 'var(--color-danger)',
            padding:'10px 14px', borderRadius:'var(--radius-sm)', marginBottom:16, fontSize:13
          }}>{msg}</div>
        )}

        {/* Professional data card */}
        <div className="card" style={{ marginBottom:16 }}>
          <p style={{ fontSize:13, fontWeight:600, marginBottom:16 }}>Datos profesionales</p>

          {editing ? (
            <form onSubmit={saveProfile}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <FormField label="Nombre" error={errors.name} required>
                  <input className="form-control" value={form.name ?? ''}
                    onChange={e => handleName('name', e.target.value)}
                    style={{ textTransform:'uppercase' }} />
                </FormField>
                <FormField label="Apellido" error={errors.lastName} required>
                  <input className="form-control" value={form.lastName ?? ''}
                    onChange={e => handleName('lastName', e.target.value)}
                    style={{ textTransform:'uppercase' }} />
                </FormField>
                <FormField label="Telefono" error={errors.phone}>
                  <input className="form-control" value={form.phone ?? ''}
                    onChange={e => handlePhone(e.target.value)}
                    inputMode="numeric" maxLength={10} placeholder="10 digitos" />
                </FormField>
                <div/>
              </div>

              {/* Specialty with lock */}
              <div className="form-group" style={{ marginTop:8 }}>
                <label className="form-label">
                  Especialidad
                  {!profile.canUpdateSpecialty && (
                    <span style={{ marginLeft:8, fontSize:11, color:'var(--color-warning)',
                      background:'var(--color-warning-bg)', padding:'2px 8px', borderRadius:20 }}>
                      Bloqueada hasta {nextSpecialtyDate()}
                    </span>
                  )}
                </label>
                {profile.canUpdateSpecialty ? (
                  <select className="form-control" value={form.specialty ?? ''}
                    onChange={e => set('specialty', e.target.value)}>
                    <option value="">Seleccionar especialidad</option>
                    {SPECIALTIES.map(s => <option key={s}>{s}</option>)}
                  </select>
                ) : (
                  <input className="form-control" value={profile.specialty} disabled
                    style={{ background:'var(--color-bg)', color:'var(--color-text-secondary)' }} />
                )}
                {profile.canUpdateSpecialty && (
                  <p style={{ fontSize:11, color:'var(--color-text-muted)', marginTop:4 }}>
                    Una vez guardada, la especialidad no podra modificarse por 7 dias.
                  </p>
                )}
              </div>

              <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:12 }}>
                <button type="button" className="btn" onClick={() => { setEditing(false); setErrors({}) }}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Guardar cambios</button>
              </div>
            </form>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              {[
                ['Nombre completo', `${profile.name} ${profile.lastName}`],
                ['Correo institucional', profile.email],
                ['Cedula',         profile.documentId || '—'],
                ['Registro medico',profile.medicalReg || '—'],
                ['Telefono',       profile.phone || '—'],
              ].map(([label, val]) => (
                <div key={label}>
                  <p className="stat-label">{label}</p>
                  <p style={{ fontSize:13, marginTop:2 }}>{val}</p>
                </div>
              ))}
              <div style={{ gridColumn:'span 2', paddingTop:12, borderTop:'1px solid var(--color-border)' }}>
                <p className="stat-label">Especialidad</p>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginTop:4 }}>
                  <p style={{ fontSize:13, fontWeight:500, color:'var(--color-primary)' }}>
                    {profile.specialty || '—'}
                  </p>
                  {!profile.canUpdateSpecialty && (
                    <span style={{ fontSize:11, color:'var(--color-warning)',
                      background:'var(--color-warning-bg)', padding:'2px 10px', borderRadius:20 }}>
                      Modificable desde {nextSpecialtyDate()}
                    </span>
                  )}
                  {profile.canUpdateSpecialty && (
                    <span style={{ fontSize:11, color:'var(--color-success)',
                      background:'var(--color-success-bg)', padding:'2px 10px', borderRadius:20 }}>
                      Disponible para editar
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Change password */}
        <div className="card">
          <p style={{ fontSize:13, fontWeight:600, marginBottom:16 }}>Cambiar contrasena</p>
          {pwMsg && (
            <div style={{ fontSize:12, marginBottom:12,
              color: pwMsg.includes('correcta') ? 'var(--color-success)' : 'var(--color-danger)' }}>
              {pwMsg}
            </div>
          )}
          <form onSubmit={changePassword}>
            {[['currentPassword','Contrasena actual'],['newPassword','Nueva contrasena'],['confirm','Confirmar contrasena']].map(([k,label]) => (
              <div key={k} className="form-group">
                <label className="form-label">{label}</label>
                <input className="form-control" type="password" value={pwForm[k]} onChange={setPw(k)} required />
              </div>
            ))}
            <button type="submit" className="btn btn-primary">Actualizar contrasena</button>
          </form>
        </div>
      </div>

      {showSig && <SignatureManager onClose={() => setShowSig(false)} />}
    </>
  )
}
