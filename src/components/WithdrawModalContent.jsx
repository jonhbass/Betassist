import React from 'react';

export default function WithdrawModalContent({ onConfirm, onClose }) {
  return (
    <div>
      <p>Formulário de saque (placeholder)</p>
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
