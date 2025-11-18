import React from 'react'

export default function Modal({ title, children, onClose }) {
  return (
    <div className="ba-modal-backdrop" onClick={onClose}>
      <div className="ba-modal" onClick={(e) => e.stopPropagation()}>
        <header className="ba-modal-header">
          <h3>{title}</h3>
          <button onClick={onClose} aria-label="Fechar">✕</button>
        </header>
        <div className="ba-modal-body">{children}</div>
      </div>
    </div>
  )
}
