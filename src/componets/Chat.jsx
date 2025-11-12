import React, { useState, useRef, useEffect } from 'react'
import { getAuthUser } from '../utils/auth'

export default function Chat() {
  const getCurrentUser = () => getAuthUser() || 'Guest'
  const USE_SOCKET = import.meta.env.VITE_USE_SOCKET === 'true' || import.meta.env.VITE_USE_API === 'true'

  const [messages, setMessages] = useState(() => {
    try {
      const raw = localStorage.getItem('CHAT_MESSAGES')
      if (!raw) return [{ id: 1, text: 'Bem-vindo ao chat! 👋', from: 'system', time: new Date().toISOString() }]
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) && parsed.length ? parsed : [{ id: 1, text: 'Bem-vindo ao chat! 👋', from: 'system', time: new Date().toISOString() }]
    } catch (e) {
      void e
      // ignore parse errors and fall back
      return [{ id: 1, text: 'Bem-vindo ao chat! 👋', from: 'system', time: new Date().toISOString() }]
    }
  })

  const [text, setText] = useState('')
  const [typing, setTyping] = useState('')
  const listRef = useRef(null)
  const socketRef = useRef(null)
  const typingTimeout = useRef(null)

  // Socket.IO connection
  useEffect(() => {
    if (!USE_SOCKET) return
    // dynamic import to keep bundle small when not used
    let mounted = true
    ;(async () => {
      const mod = await import('socket.io-client')
      const ioFn = mod.io || mod.default || mod
      const url = import.meta.env.VITE_API_URL || 'http://localhost:4000'
      const socket = ioFn(url)
      socketRef.current = socket

      socket.on('connect', () => {
        console.log('chat socket connected', socket.id)
      })

      socket.on('chat:history', (list) => {
        if (!mounted) return
        setMessages(list)
      })

      socket.on('chat:message', (msg) => {
        if (!mounted) return
        console.log('socket received chat:message', msg)
        setMessages((m) => [...m, msg])
      })

      socket.on('chat:typing', (p) => {
        if (!mounted) return
        setTyping(p.name)
        if (typingTimeout.current) clearTimeout(typingTimeout.current)
        typingTimeout.current = setTimeout(() => setTyping(''), 2000)
      })

      socket.on('connect_error', (err) => {
        console.warn('socket connect_error', err && err.message)
      })

      socket.on('disconnect', (reason) => {
        console.log('socket disconnected', reason)
      })
    })()

    return () => {
      mounted = false
      if (socketRef.current) socketRef.current.disconnect()
    }
  }, [USE_SOCKET])

  useEffect(() => {
    // persist messages locally as fallback
  try { localStorage.setItem('CHAT_MESSAGES', JSON.stringify(messages)) } catch (e) { void e /* ignore storage errors */ }
    if (listRef.current) listRef.current.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  function send(e) {
    e && e.preventDefault()
    const t = text.trim()
    if (!t) return
    const currentUser = getCurrentUser()
    const msg = { id: Date.now(), text: t, from: currentUser, time: new Date().toISOString() }
    console.log('chat send', msg)

    if (USE_SOCKET && socketRef.current) {
      // emit even if not connected yet — socket.io buffers emits until connected
      socketRef.current.emit('chat:message', msg)
    } else {
      setMessages((m) => [...m, msg])
    }

    setText('')
  }

  function onTyping(e) {
    setText(e.target.value)
    if (!USE_SOCKET || !socketRef.current) return
    socketRef.current.emit('chat:typing', { name: getCurrentUser() })
  }

  function formatTime(iso) {
    try { const d = new Date(iso); return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) } catch (e) { void e; return '' }
  }

  function clearChat() {
    if (!confirm('Limpar histórico do chat local?')) return
    setMessages([])
  try { localStorage.removeItem('CHAT_MESSAGES') } catch (e) { void e }
    if (USE_SOCKET && socketRef.current) socketRef.current.emit('chat:message', { id: Date.now(), text: `${getCurrentUser()} limpou o chat`, from: 'system', time: new Date().toISOString() })
  }

  return (
    <div className="ba-chat-wrap">
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8}}>
  <div style={{fontSize:13, color:'rgba(255,255,255,0.7)'}}>Chat</div>
        <div>
          <button className="ba-btn small" onClick={clearChat} type="button">Limpar</button>
        </div>
      </div>

      <div className="ba-chat-list" ref={listRef}>
        {messages.map((m) => {
          const isMe = m.from === getCurrentUser()
          return (
            <div key={m.id} className={`ba-chat-msg ${isMe ? 'me' : 'other'}`}>
              <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:6}}>
                <div className="ba-chat-avatar">{m.from === 'system' ? '🔔' : m.from.slice(0,1).toUpperCase()}</div>
                <div style={{fontSize:12, color:'rgba(255,255,255,0.6)'}}>
                  {m.from === 'system' ? 'Sistema' : m.from}
                </div>
                <div style={{marginLeft:8, fontSize:11, color:'rgba(255,255,255,0.38)'}}>{formatTime(m.time)}</div>
              </div>
              <div className="ba-chat-text">{m.text}</div>
            </div>
          )
        })}
      </div>

      {typing && <div style={{fontSize:12, color:'rgba(255,255,255,0.6)', marginTop:6}}>{typing} está digitando...</div>}

      <form className="ba-chat-form" onSubmit={send}>
        <input
          value={text}
          onChange={onTyping}
          placeholder={`Escreva uma mensagem...`}
        />
        <button type="submit">Enviar</button>
      </form>
    </div>
  )
}
