import React from 'react';

export default function Toast({ message }) {
  if (!message) return null;
  return (
    <div className="ba-toast" role="status">
      {message}
    </div>
  );
}
