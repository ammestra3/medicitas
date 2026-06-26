import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Icons } from './Icons'

const patientNav = [
  { path:'/',              label:'Inicio',           icon:'dashboard' },
  { path:'/appointments',  label:'Mis citas',         icon:'calendar' },
  { path:'/history',       label:'Historia clinica',  icon:'file' },
  { path:'/chat',          label:'Mensajes',          icon:'bell' },
  { path:'/profile',       label:'Mi perfil',         icon:'check' },
  { path:'/notifications', label:'Notificaciones',    icon:'bell', badge:true }
]

const doctorNav = [
  { path:'/',           label:'Inicio',     icon:'dashboard' },
  { path:'/calendar',   label:'Agenda',     icon:'calendar' },
  { path:'/patients',   label:'Pacientes',  icon:'file' },
  { path:'/chat',       label:'Mensajes',   icon:'bell' },
  { path:'/analytics',  label:'Analitica',  icon:'calendar' },
  { path:'/profile',    label:'Mi perfil',  icon:'check' }
]

export default function Sidebar({ notifCount = 0 }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout, isDoctor } = useAuth()

  const nav = isDoctor() ? doctorNav : patientNav
  const initials = user?.name?.charAt(0).toUpperCase() ?? 'U'

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">{Icons.stethoscope}</div>
        <span className="brand-name">MediCitas</span>
      </div>
      <div className="sidebar-user">
        <div className="user-card">
          <div className="user-avatar">{initials}</div>
          <div>
            <div className="user-name">{user?.name} {user?.lastName}</div>
            <div className="user-role">{isDoctor() ? 'Medico' : 'Paciente'}</div>
          </div>
        </div>
      </div>
      <nav className="sidebar-nav">
        {nav.map(({ path, label, icon, badge }) => (
          <button key={path}
            className={`nav-item ${location.pathname === path ? 'active' : ''}`}
            onClick={() => navigate(path)}>
            {Icons[icon]}
            {label}
            {badge && notifCount > 0 && <span className="nav-badge">{notifCount}</span>}
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <button className="logout-btn" onClick={logout}>
          {Icons.logout} Cerrar sesion
        </button>
      </div>
    </aside>
  )
}
