import React from 'react';

interface WorkflowAssistantProps { user?: any; defaultOpen?: boolean }

export default function WorkflowAssistant(_: WorkflowAssistantProps) {
  return (
    <div style={{ padding: 20, maxWidth: 520 }}>
      <h3 style={{ marginBottom: 8 }}>Workflow Assistant — Coming Soon</h3>
      <p style={{ color: 'var(--color-text-secondary)' }}>The AI assistant is currently disabled. This feature will be available once the server-side AI is configured.</p>
    </div>
  );
}
