import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface NotificationTemplate {
  templateId: string;
  type: 'payment' | 'invoice' | 'booking' | 'refund' | 'system';
  channel: 'email' | 'in-app' | 'sms';
  subject: string;
  body: string;
  variables: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface TemplateForm extends Omit<NotificationTemplate, 'createdAt' | 'updatedAt'> {
  templateId?: string;
}

const NotificationTemplateManager: React.FC = () => {
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TemplateForm>({
    templateId: '',
    type: 'payment',
    channel: 'email',
    subject: '',
    body: '',
    variables: [],
    isActive: true,
  });
  const [showForm, setShowForm] = useState(false);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/notification-templates', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setTemplates(response.data.data);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleSave = async () => {
    try {
      if (editingId) {
        await axios.put(`/api/notification-templates/${editingId}`, form, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setTemplates(templates.map((t) => (t.templateId === editingId ? { ...t, ...form } : t)));
      } else {
        const response = await axios.post('/api/notification-templates', form, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setTemplates([...templates, response.data.data]);
      }
      resetForm();
      setShowForm(false);
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  const handleEdit = (template: NotificationTemplate) => {
    setForm(template);
    setEditingId(template.templateId);
    setShowForm(true);
  };

  const handleDelete = async (templateId: string) => {
    if (!window.confirm('Delete this template?')) return;
    try {
      await axios.delete(`/api/notification-templates/${templateId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setTemplates(templates.filter((t) => t.templateId !== templateId));
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  const resetForm = () => {
    setForm({
      templateId: '',
      type: 'payment',
      channel: 'email',
      subject: '',
      body: '',
      variables: [],
      isActive: true,
    });
    setEditingId(null);
  };

  const extractVariables = (text: string) => {
    const matches = text.match(/\{\{(\w+)\}\}/g) || [];
    return matches.map((m) => m.slice(2, -2));
  };

  const handleBodyChange = (value: string) => {
    setForm({
      ...form,
      body: value,
      variables: extractVariables(value),
    });
  };

  return (
    <div className="notification-template-manager p-6 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Notification Templates</h2>
        <button
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : 'New Template'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-gray-50 p-6 rounded-lg mb-6 border">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Template ID</label>
              <input
                type="text"
                value={form.templateId}
                onChange={(e) => setForm({ ...form, templateId: e.target.value })}
                placeholder="e.g., tpl_payment_success"
                disabled={!!editingId}
                className="w-full px-3 py-2 border rounded-md disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as any })}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="payment">Payment</option>
                <option value="invoice">Invoice</option>
                <option value="booking">Booking</option>
                <option value="refund">Refund</option>
                <option value="system">System</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Channel</label>
              <select
                value={form.channel}
                onChange={(e) => setForm({ ...form, channel: e.target.value as any })}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="email">Email</option>
                <option value="in-app">In-App</option>
                <option value="sms">SMS</option>
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm font-medium">Active</span>
              </label>
            </div>
          </div>

          {form.channel === 'email' && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Subject</label>
              <input
                type="text"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder="e.g., Payment Received - {{bookingId}}"
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Body</label>
            <textarea
              value={form.body}
              onChange={(e) => handleBodyChange(e.target.value)}
              placeholder="Use {{variableName}} for dynamic content"
              className="w-full px-3 py-2 border rounded-md h-32"
            />
            <p className="text-xs text-gray-500 mt-1">
              Detected variables: {form.variables.length > 0 ? form.variables.join(', ') : 'None'}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              {editingId ? 'Update' : 'Create'}
            </button>
            <button
              onClick={() => {
                resetForm();
                setShowForm(false);
              }}
              className="px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Template List */}
      <div className="space-y-4">
        {loading ? (
          <p className="text-center text-gray-500">Loading templates...</p>
        ) : templates.length > 0 ? (
          templates.map((template) => (
            <div key={template.templateId} className="border rounded-lg p-4 hover:bg-gray-50">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-lg">{template.templateId}</h3>
                  <p className="text-xs text-gray-500">
                    {template.type} • {template.channel} • {template.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(template)}
                    className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(template.templateId)}
                    className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
              {template.subject && <p className="text-sm mb-1"><strong>Subject:</strong> {template.subject}</p>}
              <p className="text-sm mb-2"><strong>Body:</strong> {template.body.substring(0, 100)}...</p>
              {template.variables.length > 0 && (
                <p className="text-xs text-gray-600">
                  <strong>Variables:</strong> {template.variables.join(', ')}
                </p>
              )}
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">No templates found. Create one to get started.</p>
        )}
      </div>
    </div>
  );
};

export default NotificationTemplateManager;
