import React from 'react';

interface Props {
  user?: any;
}

export default function AIWorkflowAssistant({ user }: Props) {
  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ fontSize: 18, marginBottom: 8 }}>AI Workflow Assistant (placeholder)</h2>
      <p style={{ color: '#555' }}>This assistant will provide workflow and operational assistance across the app.</p>
      {user && <p style={{ marginTop: 8 }}><strong>User:</strong> {user.name || user.email || 'N/A'}</p>}
    </div>
  );
}
