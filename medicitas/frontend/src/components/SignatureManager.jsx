import { useEffect, useRef, useState } from 'react'

const STORAGE_KEY = 'doctor_signature'

export function useSignature() {
  const [signature, setSignature] = useState(() => localStorage.getItem(STORAGE_KEY) || null)

  const save = (dataUrl) => {
    localStorage.setItem(STORAGE_KEY, dataUrl)
    setSignature(dataUrl)
  }

  const clear = () => {
    localStorage.removeItem(STORAGE_KEY)
    setSignature(null)
  }

  return { signature, save, clear }
}

export default function SignatureManager({ onClose }) {
  const canvasRef = useRef(null)
  const [drawing, setDrawing] = useState(false)
  const [mode, setMode] = useState('draw')
  const [hasStrokes, setHasStrokes] = useState(false)
  const { signature, save, clear } = useSignature()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = '#1a56db'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }, [mode])

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const src = e.touches?.[0] ?? e
    return { x: (src.clientX - rect.left) * scaleX, y: (src.clientY - rect.top) * scaleY }
  }

  const startDraw = (e) => {
    e.preventDefault()
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const pos = getPos(e, canvas)
    ctx.beginPath()
    ctx.moveTo(pos.x, pos.y)
    setDrawing(true)
  }

  const draw = (e) => {
    if (!drawing) return
    e.preventDefault()
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const pos = getPos(e, canvas)
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
    setHasStrokes(true)
  }

  const stopDraw = () => setDrawing(false)

  const clearCanvas = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    setHasStrokes(false)
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const img = new Image()
      img.onload = () => {
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        const ratio = Math.min(canvas.width / img.width, canvas.height / img.height)
        const w = img.width * ratio
        const h = img.height * ratio
        ctx.drawImage(img, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h)
        setHasStrokes(true)
      }
      img.src = ev.target.result
    }
    reader.readAsDataURL(file)
  }

  const handleSave = () => {
    const canvas = canvasRef.current
    save(canvas.toDataURL('image/png'))
    onClose?.()
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose?.()}>
      <div className="modal" style={{ width: 460 }}>
        <p className="modal-title">Firma del medico</p>

        <div style={{ display: 'flex', gap: 2, marginBottom: 14, background: 'var(--color-bg)', borderRadius: 'var(--radius-md)', padding: 4 }}>
          {[['draw', 'Dibujar firma'], ['upload', 'Subir imagen']].map(([k, label]) => (
            <button key={k} onClick={() => { setMode(k); clearCanvas() }} style={{
              flex: 1, padding: '6px 12px', border: 'none', cursor: 'pointer', borderRadius: 'var(--radius-sm)',
              fontSize: 13, fontWeight: 500,
              background: mode === k ? 'var(--color-surface)' : 'transparent',
              color: mode === k ? 'var(--color-primary)' : 'var(--color-text-secondary)'
            }}>{label}</button>
          ))}
        </div>

        {signature && (
          <div style={{ marginBottom: 14, padding: '8px 12px', background: 'var(--color-success-bg)', borderRadius: 'var(--radius-sm)', fontSize: 12, color: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Firma guardada actualmente</span>
            <button onClick={() => { clear(); onClose?.() }} style={{ fontSize: 11, color: 'var(--color-danger)', background: 'none', border: 'none', cursor: 'pointer' }}>Eliminar firma</button>
          </div>
        )}

        <canvas
          ref={canvasRef}
          width={600}
          height={180}
          style={{ width: '100%', height: 160, border: '1px solid var(--color-border-strong)', borderRadius: 'var(--radius-sm)', cursor: mode === 'draw' ? 'crosshair' : 'default', touchAction: 'none', display: 'block' }}
          onMouseDown={mode === 'draw' ? startDraw : undefined}
          onMouseMove={mode === 'draw' ? draw : undefined}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onTouchStart={mode === 'draw' ? startDraw : undefined}
          onTouchMove={mode === 'draw' ? draw : undefined}
          onTouchEnd={stopDraw}
        />

        {mode === 'draw' && (
          <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 6 }}>
            Dibuja tu firma con el mouse o en pantalla tactil
          </p>
        )}

        {mode === 'upload' && (
          <div style={{ marginTop: 10 }}>
            <label className="form-label">Seleccionar imagen de firma (PNG, JPG)</label>
            <input type="file" accept="image/png,image/jpeg" onChange={handleImageUpload} className="form-control" style={{ fontSize: 12 }} />
          </div>
        )}

        <div className="modal-footer">
          <button className="btn" onClick={() => { clearCanvas(); setHasStrokes(false) }}>Limpiar</button>
          <button className="btn" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" disabled={!hasStrokes} onClick={handleSave}>Guardar firma</button>
        </div>
      </div>
    </div>
  )
}
