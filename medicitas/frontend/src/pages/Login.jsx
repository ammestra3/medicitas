import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authService } from '../api/services'
import { Icons } from '../components/Icons'
import FormField from '../components/FormField'
import { validate, toUpperName, onlyNumbers } from '../api/validators'

const SPECIALTIES = [
  'Medicina general','Cardiologia','Dermatologia',
  'Pediatria','Ginecologia','Traumatologia','Neurologia','Psiquiatria'
]

/* ─── Brand header ─── */
function Brand({ subtitle }) {
  return (
    <div className="login-brand">
      <div className="login-brand-icon">{Icons.stethoscope}</div>
      <h1>MediCitas</h1>
      <p>{subtitle || 'Sistema de reservas medicas'}</p>
    </div>
  )
}

/* ─── Back button ─── */
function BackBtn({ onClick }) {
  return (
    <button onClick={onClick} style={{
      display:'inline-flex', alignItems:'center', gap:6,
      background:'none', border:'none', cursor:'pointer',
      fontSize:12, color:'var(--color-text-secondary)', marginBottom:14, padding:0
    }}>
      {Icons.x} Volver al inicio
    </button>
  )
}

/* ════════════════════════════════════
   PANTALLA PRINCIPAL — dos portales
   ════════════════════════════════════ */
function HomeView({ onLogin, onCreate, onForgot }) {
  return (
    <div style={{ width:'100%', maxWidth:560 }}>
      {/* Header */}
      <div style={{ textAlign:'center', marginBottom:28 }}>
        <div style={{
          width:52, height:52, borderRadius:14,
          background:'var(--color-primary-light)',
          display:'flex', alignItems:'center', justifyContent:'center',
          margin:'0 auto 12px', color:'var(--color-primary)'
        }}>
          {Icons.stethoscope}
        </div>
        <h1 style={{ fontSize:22, fontWeight:600, color:'var(--color-text)' }}>MediCitas</h1>
        <p style={{ fontSize:13, color:'var(--color-text-secondary)', marginTop:4 }}>
          Sistema de reservas medicas
        </p>
      </div>

      {/* Two portals */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
        {/* Patient portal */}
        <div style={{
          border:'1px solid var(--color-border)', borderRadius:'var(--radius-lg)',
          padding:'22px 20px', background:'var(--color-surface)', textAlign:'center'
        }}>
          <div style={{
            width:44, height:44, borderRadius:'50%',
            background:'#ebf0ff', display:'flex', alignItems:'center',
            justifyContent:'center', margin:'0 auto 12px', color:'var(--color-primary)'
          }}>
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width:22, height:22, stroke:'currentColor' }}>
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <p style={{ fontSize:14, fontWeight:600, marginBottom:4 }}>Soy paciente</p>
          <p style={{ fontSize:11, color:'var(--color-text-secondary)', marginBottom:14, lineHeight:1.4 }}>
            Accede a tus citas, historia clinica y mensajes
          </p>
          <button className="btn btn-primary btn-sm"
            onClick={() => onLogin('patient')}
            style={{ width:'100%', justifyContent:'center', marginBottom:8 }}>
            Iniciar sesion
          </button>
          <button className="btn btn-sm"
            onClick={() => onCreate('patient')}
            style={{ width:'100%', justifyContent:'center', fontSize:12 }}>
            Crear cuenta
          </button>
        </div>

        {/* Doctor portal */}
        <div style={{
          border:'1px solid var(--color-border)', borderRadius:'var(--radius-lg)',
          padding:'22px 20px', background:'var(--color-surface)', textAlign:'center'
        }}>
          <div style={{
            width:44, height:44, borderRadius:'50%',
            background:'#ecfdf5', display:'flex', alignItems:'center',
            justifyContent:'center', margin:'0 auto 12px', color:'#059669'
          }}>
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width:22, height:22, stroke:'currentColor' }}>
              <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/>
              <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/>
              <circle cx="20" cy="10" r="2"/>
            </svg>
          </div>
          <p style={{ fontSize:14, fontWeight:600, marginBottom:4 }}>Soy medico</p>
          <p style={{ fontSize:11, color:'var(--color-text-secondary)', marginBottom:14, lineHeight:1.4 }}>
            Gestiona pacientes, registros y consultas medicas
          </p>
          <button className="btn btn-primary btn-sm"
            onClick={() => onLogin('doctor')}
            style={{ width:'100%', justifyContent:'center', marginBottom:8, background:'#059669', borderColor:'#059669' }}>
            Iniciar sesion
          </button>
          <button className="btn btn-sm"
            onClick={() => onCreate('doctor')}
            style={{ width:'100%', justifyContent:'center', fontSize:12 }}>
            Crear cuenta
          </button>
        </div>
      </div>

      <button onClick={onForgot} style={{
        display:'block', width:'100%', marginTop:18,
        background:'none', border:'none', cursor:'pointer',
        fontSize:12, color:'var(--color-text-secondary)', textAlign:'center'
      }}>
        Olvidaste tu contrasena?
      </button>
    </div>
  )
}

/* ════════════════════════════════════
   LOGIN FORM — patient or doctor
   ════════════════════════════════════ */
function LoginView({ role, onBack, onSuccess, onForgot }) {
  const isDoc = role === 'doctor'
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await authService.login(email, password)
      if (isDoc && data.role !== 'DOCTOR')    { setError('Esta cuenta no es de un medico.'); return }
      if (!isDoc && data.role === 'DOCTOR')   { setError('Esta cuenta no es de un paciente.'); return }
      onSuccess(data)
    } catch {
      setError('Credenciales incorrectas. Verifique e intente de nuevo.')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ width:340 }}>
      <Brand subtitle={isDoc ? 'Portal medico' : 'Portal paciente'} />
      <BackBtn onClick={onBack} />
      {error && <div className="login-error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <FormField label="Correo electronico" required>
          <input className="form-control" type="email" value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder={isDoc ? 'dr.nombre@hospital.com' : 'correo@ejemplo.com'} required />
        </FormField>
        <FormField label="Contrasena" required>
          <input className="form-control" type="password" value={password}
            onChange={e => setPassword(e.target.value)} placeholder="Ingrese su contrasena" required />
        </FormField>
        <button className="btn btn-primary" type="submit" disabled={loading}
          style={{ width:'100%', justifyContent:'center', marginTop:4,
            ...(isDoc ? { background:'#059669', borderColor:'#059669' } : {}) }}>
          {loading ? <div className="spinner" /> : 'Ingresar'}
        </button>
      </form>
      <button onClick={onForgot} style={{
        display:'block', width:'100%', marginTop:12,
        background:'none', border:'none', cursor:'pointer',
        fontSize:12, color:'var(--color-primary)', textAlign:'center'
      }}>
        Olvidaste tu contrasena?
      </button>
    </div>
  )
}

/* ════════════════════════════════════
   REGISTER PATIENT
   ════════════════════════════════════ */
function RegisterPatientView({ onBack, onSuccess }) {
  const [form, setForm]     = useState({ name:'', lastName:'', documentId:'', email:'', password:'', phone:'', address:'' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const set  = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const setE = (k, v) => setErrors(e => ({ ...e, [k]: v || undefined }))

  const handleName  = (k, raw) => { const v=toUpperName(raw); set(k,v); setE(k, validate('name',v)) }
  const handleId    = (raw)    => { const v=onlyNumbers(raw);  set('documentId',v); setE('documentId', validate('id',v)) }
  const handlePhone = (raw)    => { const v=onlyNumbers(raw).slice(0,10); set('phone',v); setE('phone', v&&v.length!==10?'Exactamente 10 digitos':undefined) }
  const handleEmail = (v)      => { set('email',v); setE('email', validate('email',v)) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!form.name)           errs.name       = 'Campo requerido'
    if (!form.lastName)       errs.lastName   = 'Campo requerido'
    if (validate('id', form.documentId))   errs.documentId = validate('id', form.documentId) || 'Campo requerido'
    if (validate('email', form.email))     errs.email      = validate('email', form.email)
    if (form.phone && validate('phone', form.phone)) errs.phone = validate('phone', form.phone)
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setLoading(true)
    try {
      const { data } = await authService.registerPatient(form)
      onSuccess(data)
    } catch (err) {
      setErrors({ general: err.response?.data?.message ?? 'Error al crear la cuenta. Intente de nuevo.' })
    } finally { setLoading(false) }
  }

  return (
    <div style={{ width:460 }}>
      <Brand subtitle="Registro de paciente" />
      <BackBtn onClick={onBack} />
      <div style={{ background:'var(--color-info-bg)', border:'1px solid #c7d2fe', borderRadius:'var(--radius-sm)', padding:'8px 12px', fontSize:12, color:'var(--color-primary)', marginBottom:14 }}>
        Tu medico de familia sera asignado automaticamente al registrarte.
      </div>
      {errors.general && <div className="login-error">{errors.general}</div>}
      <form onSubmit={handleSubmit}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          <FormField label="Nombre" error={errors.name} required>
            <input className="form-control" value={form.name}
              onChange={e => handleName('name', e.target.value)}
              placeholder="NOMBRE" style={{ textTransform:'uppercase' }} />
          </FormField>
          <FormField label="Apellido" error={errors.lastName} required>
            <input className="form-control" value={form.lastName}
              onChange={e => handleName('lastName', e.target.value)}
              placeholder="APELLIDO" style={{ textTransform:'uppercase' }} />
          </FormField>
        </div>
        <FormField label="Cedula de ciudadania" error={errors.documentId} required>
          <input className="form-control" value={form.documentId}
            onChange={e => handleId(e.target.value)}
            placeholder="Solo numeros, maximo 20 digitos" inputMode="numeric" />
        </FormField>
        <FormField label="Correo electronico" error={errors.email} required>
          <input className="form-control" type="email" value={form.email}
            onChange={e => handleEmail(e.target.value)} placeholder="correo@ejemplo.com" />
        </FormField>
        <FormField label="Contrasena" required>
          <input className="form-control" type="password" value={form.password}
            onChange={e => set('password', e.target.value)} placeholder="Minimo 6 caracteres" required />
        </FormField>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          <FormField label="Telefono celular" error={errors.phone}>
            <input className="form-control" value={form.phone}
              onChange={e => handlePhone(e.target.value)}
              placeholder="10 digitos" inputMode="numeric" maxLength={10} />
          </FormField>
          <FormField label="Direccion">
            <input className="form-control" value={form.address}
              onChange={e => set('address', e.target.value)} placeholder="Calle 123 # 45-67" />
          </FormField>
        </div>
        <button className="btn btn-primary" type="submit" disabled={loading}
          style={{ width:'100%', justifyContent:'center', marginTop:4 }}>
          {loading ? <div className="spinner" /> : 'Crear cuenta de paciente'}
        </button>
      </form>
    </div>
  )
}

/* ════════════════════════════════════
   REGISTER DOCTOR
   ════════════════════════════════════ */
function RegisterDoctorView({ onBack, onSuccess }) {
  const [form, setForm]     = useState({ name:'', lastName:'', documentId:'', medicalReg:'', email:'', password:'', specialty:'' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const set  = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const setE = (k, v) => setErrors(e => ({ ...e, [k]: v || undefined }))

  const handleName  = (k, raw) => { const v=toUpperName(raw); set(k,v); setE(k, validate('name',v)) }
  const handleNum   = (k, raw, vk) => { const v=onlyNumbers(raw); set(k,v); setE(k, validate(vk,v)) }
  const handleEmail = (v) => { set('email',v); setE('email', validate('email',v)) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!form.name)                              errs.name       = 'Campo requerido'
    if (!form.lastName)                          errs.lastName   = 'Campo requerido'
    if (validate('id', form.documentId))         errs.documentId = validate('id', form.documentId) || 'Requerido'
    if (validate('medicalReg', form.medicalReg)) errs.medicalReg = validate('medicalReg', form.medicalReg) || 'Requerido'
    if (validate('email', form.email))           errs.email      = validate('email', form.email)
    if (!form.specialty)                         errs.specialty  = 'Selecciona una especialidad'
    if (!form.password)                          errs.password   = 'Campo requerido'
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setLoading(true)
    try {
      const { data } = await authService.registerDoctor(form)
      onSuccess(data)
    } catch (err) {
      setErrors({ general: err.response?.data?.message ?? 'Error al crear la cuenta. Intente de nuevo.' })
    } finally { setLoading(false) }
  }

  return (
    <div style={{ width:460 }}>
      <Brand subtitle="Registro de medico" />
      <BackBtn onClick={onBack} />
      {errors.general && <div className="login-error">{errors.general}</div>}
      <form onSubmit={handleSubmit}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          <FormField label="Nombre" error={errors.name} required>
            <input className="form-control" value={form.name}
              onChange={e => handleName('name', e.target.value)}
              placeholder="NOMBRE" style={{ textTransform:'uppercase' }} />
          </FormField>
          <FormField label="Apellido" error={errors.lastName} required>
            <input className="form-control" value={form.lastName}
              onChange={e => handleName('lastName', e.target.value)}
              placeholder="APELLIDO" style={{ textTransform:'uppercase' }} />
          </FormField>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          <FormField label="Cedula" error={errors.documentId} required>
            <input className="form-control" value={form.documentId}
              onChange={e => handleNum('documentId', e.target.value, 'id')}
              placeholder="Solo numeros" inputMode="numeric" />
          </FormField>
          <FormField label="Registro medico (RM)" error={errors.medicalReg} required>
            <input className="form-control" value={form.medicalReg}
              onChange={e => handleNum('medicalReg', e.target.value, 'medicalReg')}
              placeholder="Solo numeros" inputMode="numeric" />
          </FormField>
        </div>
        <FormField label="Correo institucional" error={errors.email} required>
          <input className="form-control" type="email" value={form.email}
            onChange={e => handleEmail(e.target.value)} placeholder="dr.nombre@hospital.com" />
        </FormField>
        <FormField label="Contrasena" error={errors.password} required>
          <input className="form-control" type="password" value={form.password}
            onChange={e => set('password', e.target.value)} placeholder="Minimo 6 caracteres" />
        </FormField>
        <FormField label="Especialidad" error={errors.specialty} required>
          <select className="form-control" value={form.specialty}
            onChange={e => set('specialty', e.target.value)}>
            <option value="">Seleccionar especialidad</option>
            {SPECIALTIES.map(s => <option key={s}>{s}</option>)}
          </select>
        </FormField>
        <button className="btn btn-primary" type="submit" disabled={loading}
          style={{ width:'100%', justifyContent:'center', marginTop:4, background:'#059669', borderColor:'#059669' }}>
          {loading ? <div className="spinner" /> : 'Crear cuenta de medico'}
        </button>
      </form>
    </div>
  )
}

/* ════════════════════════════════════
   FORGOT PASSWORD
   ════════════════════════════════════ */
function ForgotView({ onBack }) {
  const [step, setStep]       = useState(1)
  const [email, setEmail]     = useState('')
  const [newPw, setNewPw]     = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const handleVerify = (e) => {
    e.preventDefault()
    const err = validate('email', email)
    if (err) { setError(err); return }
    setError(''); setStep(2)
  }

  const handleReset = async (e) => {
    e.preventDefault()
    if (newPw.length < 6)  { setError('La contrasena debe tener minimo 6 caracteres.'); return }
    if (newPw !== confirm)  { setError('Las contrasenas no coinciden.'); return }
    setLoading(true)
    try {
      await authService.resetPassword({ email, newPassword: newPw })
      setStep(3)
    } catch (err) {
      setError(err.response?.data?.message ?? 'No existe una cuenta con ese correo.')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ width:340 }}>
      <Brand subtitle="Recuperar contrasena" />
      <BackBtn onClick={onBack} />
      {step === 1 && (
        <>
          <p style={{ fontSize:13, color:'var(--color-text-secondary)', marginBottom:14 }}>
            Ingresa el correo con el que te registraste.
          </p>
          {error && <div className="login-error">{error}</div>}
          <form onSubmit={handleVerify}>
            <FormField label="Correo electronico" required>
              <input className="form-control" type="email" value={email}
                onChange={e => setEmail(e.target.value)} placeholder="correo@ejemplo.com" required />
            </FormField>
            <button className="btn btn-primary" type="submit" style={{ width:'100%', justifyContent:'center' }}>
              Continuar
            </button>
          </form>
        </>
      )}
      {step === 2 && (
        <>
          <p style={{ fontSize:13, color:'var(--color-text-secondary)', marginBottom:14 }}>
            Crea una nueva contrasena para <strong>{email}</strong>.
          </p>
          {error && <div className="login-error">{error}</div>}
          <form onSubmit={handleReset}>
            <FormField label="Nueva contrasena" required>
              <input className="form-control" type="password" value={newPw}
                onChange={e => setNewPw(e.target.value)} placeholder="Minimo 6 caracteres" required />
            </FormField>
            <FormField label="Confirmar contrasena" required>
              <input className="form-control" type="password" value={confirm}
                onChange={e => setConfirm(e.target.value)} required />
            </FormField>
            <button className="btn btn-primary" type="submit" disabled={loading}
              style={{ width:'100%', justifyContent:'center' }}>
              {loading ? <div className="spinner" /> : 'Cambiar contrasena'}
            </button>
          </form>
        </>
      )}
      {step === 3 && (
        <div style={{ textAlign:'center', padding:'16px 0' }}>
          <div style={{ width:48, height:48, borderRadius:'50%', background:'var(--color-success-bg)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px', color:'var(--color-success)' }}>
            {Icons.check}
          </div>
          <p style={{ fontSize:14, fontWeight:500, marginBottom:6 }}>Contrasena actualizada</p>
          <p style={{ fontSize:13, color:'var(--color-text-secondary)', marginBottom:16 }}>
            Ya puedes iniciar sesion con tu nueva contrasena.
          </p>
          <button className="btn btn-primary" onClick={onBack} style={{ width:'100%', justifyContent:'center' }}>
            Ir al inicio
          </button>
        </div>
      )}
    </div>
  )
}

/* ════════════════════════════════════
   ROOT COMPONENT
   ════════════════════════════════════ */
export default function Login() {
  const [view, setView] = useState('home')
  const [role, setRole] = useState(null)
  const { login }       = useAuth()
  const navigate        = useNavigate()

  const onSuccess = (data) => { login(data); navigate('/') }

  const handleLogin  = (r) => { setRole(r); setView('login') }
  const handleCreate = (r) => { setRole(r); setView('register') }

  return (
    <div className="login-page">
      <div style={{ background:'var(--color-surface)', borderRadius:'var(--radius-lg)', padding:'32px 28px', border:'1px solid var(--color-border)', boxShadow:'var(--shadow-md)', maxWidth:'95vw' }}>
        {view === 'home'     && <HomeView     onLogin={handleLogin} onCreate={handleCreate} onForgot={() => setView('forgot')} />}
        {view === 'login'    && <LoginView    role={role} onBack={() => setView('home')} onSuccess={onSuccess} onForgot={() => setView('forgot')} />}
        {view === 'register' && role === 'patient' && <RegisterPatientView onBack={() => setView('home')} onSuccess={onSuccess} />}
        {view === 'register' && role === 'doctor'  && <RegisterDoctorView  onBack={() => setView('home')} onSuccess={onSuccess} />}
        {view === 'forgot'   && <ForgotView   onBack={() => setView('home')} />}
      </div>
    </div>
  )
}
