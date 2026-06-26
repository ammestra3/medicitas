import { useEffect, useState } from 'react'
import { userService, authService } from '../../api/services'
import FormField from '../../components/FormField'
import { validate, toUpperName, onlyNumbers } from '../../api/validators'

export default function Profile() {
  const [profile, setProfile]   = useState(null)
  const [editing, setEditing]   = useState(false)
  const [form, setForm]         = useState({})
  const [errors, setErrors]     = useState({})
  const [pwForm, setPwForm]     = useState({ currentPassword:'', newPassword:'', confirm:'' })
  const [msg, setMsg]           = useState('')
  const [pwMsg, setPwMsg]       = useState('')

  useEffect(() => {
    userService.getProfile().then(({ data }) => {
      setProfile(data)
      setForm(data)
    })
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
      const { data } = await userService.updateProfile(form)
      setProfile(data); setEditing(false); setErrors({})
      setMsg('Perfil actualizado.'); setTimeout(() => setMsg(''), 3000)
    } catch { setMsg('Error al guardar.') }
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

  if (!profile) return <div className="loading-center"><div className="spinner"/></div>

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Mi perfil</h1>
        {!editing && <button className="btn btn-primary" onClick={() => setEditing(true)}>Editar perfil</button>}
      </div>
      <div className="page-content">
        {msg && (
          <div style={{ background:'var(--color-success-bg)', border:'1px solid #6ee7b7', color:'var(--color-success)',
            padding:'8px 14px', borderRadius:'var(--radius-sm)', marginBottom:16, fontSize:13 }}>{msg}</div>
        )}

        <div className="card" style={{ marginBottom:20 }}>
          <p style={{ fontSize:13, fontWeight:600, marginBottom:16 }}>Datos personales</p>

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
                <FormField label="Telefono celular" error={errors.phone}>
                  <input className="form-control" value={form.phone ?? ''}
                    onChange={e => handlePhone(e.target.value)}
                    inputMode="numeric" maxLength={10} placeholder="10 digitos" />
                </FormField>
                <FormField label="Direccion">
                  <input className="form-control" value={form.address ?? ''}
                    onChange={e => set('address', e.target.value)} />
                </FormField>
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
                ['Cedula',          profile.documentId || '—'],
                ['Correo',          profile.email],
                ['Telefono',        profile.phone || '—'],
                ['Direccion',       profile.address || '—'],
              ].map(([label, val]) => (
                <div key={label} style={{ gridColumn: label === 'Direccion' ? 'span 2' : '' }}>
                  <p className="stat-label">{label}</p>
                  <p style={{ fontSize:13, marginTop:2 }}>{val}</p>
                </div>
              ))}
              <div style={{ gridColumn:'span 2', paddingTop:12, borderTop:'1px solid var(--color-border)' }}>
                <p className="stat-label">Medico de familia asignado</p>
                <p style={{ fontSize:13, marginTop:2, color:'var(--color-primary)', fontWeight:500 }}>
                  {profile.familyDoctor || 'Sin asignar — registro pendiente de medicos en el sistema'}
                </p>
              </div>
            </div>
          )}
        </div>

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
    </>
  )
}
