import { useEffect, useState } from 'react'
import { notificationService } from '../api/services'
import { Icons } from '../components/Icons'

const iconMap = {
  info: { icon: Icons.info, type: 'info' },
  success: { icon: Icons.check, type: 'success' },
  warning: { icon: Icons.alertTriangle, type: 'warning' }
}

export default function Notifications({ onRead }) {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    notificationService.getAll()
      .then(({ data }) => setNotifications(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead()
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      onRead?.()
    } catch {
      console.error('Error al marcar notificaciones')
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Notificaciones</h1>
        {unreadCount > 0 && (
          <button className="btn" onClick={handleMarkAllRead}>
            {Icons.checkAll} Marcar todas como leidas
          </button>
        )}
      </div>

      <div className="page-content">
        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : notifications.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', color: 'var(--color-text-secondary)', padding: 32 }}>
            No tiene notificaciones pendientes.
          </div>
        ) : (
          <div className="notification-list">
            {notifications.map(notif => {
              const { icon, type } = iconMap[notif.type] ?? iconMap.info
              return (
                <div
                  key={notif.id}
                  className="notification-item"
                  style={{ opacity: notif.read ? 0.6 : 1 }}
                >
                  <div className={`notif-icon ${type}`} style={{ stroke: 'inherit' }}>
                    {icon}
                  </div>
                  <div className="notif-content">
                    <p className="notif-title">{notif.title}</p>
                    <p className="notif-msg">{notif.message}</p>
                    <p className="notif-time">{notif.createdAt}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
        <p className="meta-note" style={{ marginTop: 14 }}>
          GET /api/notifications — polling cada 30s recomendado
        </p>
      </div>
    </>
  )
}
