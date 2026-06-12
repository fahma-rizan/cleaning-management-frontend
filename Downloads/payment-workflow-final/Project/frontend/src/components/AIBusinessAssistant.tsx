import React from 'react';
import type { User } from './types';

interface Props {
  user?: any;
}

export default function AIBusinessAssistant({ user }: Props) {
  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ fontSize: 18, marginBottom: 8 }}>AI Business Assistant (placeholder)</h2>
      <p style={{ color: '#555' }}>This assistant is not yet implemented. It will provide business-level insights and reports.</p>
      {user && <p style={{ marginTop: 8 }}><strong>User:</strong> {user.name || user.email || 'N/A'}</p>}
    </div>
  );
}
