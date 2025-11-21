import React from 'react';

export default function WithdrawModalContent({ onConfirm, onClose }) {
  return (
    <div>
      <p>Formulario de retiro (placeholder)</p>
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
