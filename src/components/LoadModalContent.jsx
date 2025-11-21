import React from 'react';

export default function LoadModalContent({ onConfirm, onClose }) {
  return (
    <div>
      <p>Formulario de recarga (placeholder)</p>
      <button
        onClick={() => {
          onConfirm && onConfirm();
          onClose && onClose();
        }}
      >
        Confirmar
      </button>
    </div>
  );
}
