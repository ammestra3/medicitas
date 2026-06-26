import { useEffect, useRef, useState } from 'react'
import { chatService, userService } from '../api/services'
import { useAuth } from '../context/AuthContext'

export default function Chat() {
  const { user, isDoctor } = useAuth()
  const [contacts, setContacts] = useState([])
  const [allUsers, setAllUsers] = useState([])
  const [selected, setSelected] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    chatService.getContacts().then(({ data }) => setContacts(data))
    const fetchUsers = isDoctor() ? userService.getPatients : userService.getDoctors
    fetchUsers().then(({ data }) => setAllUsers(data))
  }, [])

  useEffect(() => {
    if (!selected) return
    setLoading(true)
    chatService.getConversation(selected.id)
      .then(({ data }) => setMessages(data))
      .finally(() => setLoading(false))
    const interval = setInterval(() => {
      chatService.getConversation(selected.id).then(({ data }) => setMessages(data))
    }, 5000)
    return () => clearInterval(interval)
  }, [selected])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = async (e) => {
    e.preventDefault()
    if (!text.trim() || !selected) return
    const { data } = await chatService.send({ receiverId: selected.id, content: text.trim() })
    setMessages(m => [...m, data])
    setText('')
    if (!contacts.find(c => c.id === selected.id)) setContacts(c => [...c, selected])
  }

  const allContacts = [...contacts, ...allUsers.filter(u => !contacts.find(c => c.id === u.id))]

  return (
    <>
      <div className="page-header"><h1 className="page-title">Mensajes</h1></div>
      <div className="page-content" style={{ padding: 0 }}>
        <div style={{ display:'flex', height:'calc(100vh - 65px)' }}>
          <div style={{ width:240,borderRight:'1px solid var(--color-border)',overflowY:'auto',background:'var(--color-surface)' }}>
            <div style={{ padding:'12px 14px',fontSize:12,fontWeight:500,color:'var(--color-text-secondary)',borderBottom:'1px solid var(--color-border)' }}>
              {isDoctor() ? 'Pacientes' : 'Mis medicos'}
            </div>
            {allContacts.map(c => (
              <button key={c.id} onClick={() => setSelected(c)} style={{
                display:'flex',alignItems:'center',gap:10,width:'100%',padding:'12px 14px',border:'none',
                background: selected?.id===c.id ? 'var(--color-primary-light)' : 'transparent',
                color: selected?.id===c.id ? 'var(--color-primary)' : 'var(--color-text)',
                cursor:'pointer',textAlign:'left',borderBottom:'1px solid var(--color-border)'
              }}>
                <div style={{ width:32,height:32,borderRadius:'50%',background:'var(--color-bg)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:600,color:'var(--color-text-secondary)',flexShrink:0 }}>
                  {c.name?.charAt(0)}
                </div>
                <div>
                  <p style={{ fontSize:13,fontWeight:500 }}>{c.name}</p>
                  {c.role && <p style={{ fontSize:11,color:'var(--color-text-secondary)' }}>{c.role === 'DOCTOR' ? 'Medico' : 'Paciente'}</p>}
                </div>
              </button>
            ))}
          </div>

          <div style={{ flex:1,display:'flex',flexDirection:'column' }}>
            {!selected ? (
              <div style={{ flex:1,display:'flex',alignItems:'center',justifyContent:'center',color:'var(--color-text-secondary)',fontSize:13 }}>
                Selecciona un contacto para iniciar la conversacion
              </div>
            ) : (
              <>
                <div style={{ padding:'12px 16px',borderBottom:'1px solid var(--color-border)',background:'var(--color-surface)' }}>
                  <p style={{ fontSize:14,fontWeight:500 }}>{selected.name}</p>
                </div>
                <div style={{ flex:1,overflowY:'auto',padding:16,display:'flex',flexDirection:'column',gap:8 }}>
                  {loading && <div className="loading-center"><div className="spinner" /></div>}
                  {messages.map(m => {
                    const isMine = m.senderId === Number(user?.id)
                    return (
                      <div key={m.id} style={{ display:'flex',justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                        <div style={{
                          maxWidth:'65%',padding:'8px 12px',borderRadius:12,fontSize:13,lineHeight:1.5,
                          background: isMine ? 'var(--color-primary)' : 'var(--color-bg)',
                          color: isMine ? '#fff' : 'var(--color-text)',
                          borderBottomRightRadius: isMine ? 4 : 12,
                          borderBottomLeftRadius: isMine ? 12 : 4
                        }}>
                          {m.content}
                          <p style={{ fontSize:10,marginTop:4,opacity:.65,textAlign:'right' }}>
                            {new Date(m.sentAt).toLocaleTimeString('es-CO',{hour:'2-digit',minute:'2-digit'})}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={bottomRef} />
                </div>
                <form onSubmit={send} style={{ display:'flex',gap:8,padding:'12px 16px',borderTop:'1px solid var(--color-border)',background:'var(--color-surface)' }}>
                  <input className="form-control" value={text} onChange={e=>setText(e.target.value)} placeholder="Escribe un mensaje..." style={{ flex:1 }} />
                  <button type="submit" className="btn btn-primary" disabled={!text.trim()}>Enviar</button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
