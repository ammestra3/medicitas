const statusMap = {
  pending: { label: 'Pendiente', className: 'badge-pending' },
  confirmed: { label: 'Confirmada', className: 'badge-confirmed' },
  cancelled: { label: 'Cancelada', className: 'badge-cancelled' },
  completed: { label: 'Completada', className: 'badge-completed' }
}

export default function Badge({ status }) {
  const { label, className } = statusMap[status] ?? { label: status, className: '' }
  return <span className={`badge ${className}`}>{label}</span>
}
