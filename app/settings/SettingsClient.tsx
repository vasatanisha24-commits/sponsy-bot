'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string;
  email: string;
}

interface EnvSettings {
  gmailUser: string;
  hasGmailPassword: boolean;
  groqConfigured: boolean;
}

export default function SettingsClient({ user, envSettings }: { user: User | null; envSettings: EnvSettings }) {
  const router = useRouter();
  
  // Account state
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/settings/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, name, email }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update account settings');
      
      setSaveSuccess(true);
      router.refresh();
      
      // Hide success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="px-6 py-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your account and platform configuration.</p>
      </div>

      {/* ACCOUNT SETTINGS */}
      <section className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Account Settings</h2>
        </div>
        <div className="p-6">
          {!user ? (
            <p className="text-sm text-gray-500">No user account found in the database.</p>
          ) : (
            <form onSubmit={handleSaveAccount} className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>
              
              {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>}
              {saveSuccess && <p className="text-sm text-green-600 bg-green-50 p-2 rounded">Account settings saved successfully!</p>}

              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg disabled:opacity-60 flex items-center gap-2"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* AI SETTINGS */}
      <section className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">AI Configuration</h2>
          <span className="text-xs font-semibold px-2 py-0.5 bg-gray-200 text-gray-600 rounded">Read-only</span>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Provider</label>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">Groq</span>
                <span className={`w-2 h-2 rounded-full ${envSettings.groqConfigured ? 'bg-green-500' : 'bg-red-500'}`} title={envSettings.groqConfigured ? 'API Key Configured' : 'Missing API Key'} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Model</label>
              <div className="text-sm font-medium text-gray-900">openai/gpt-oss-120b</div>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">AI settings are managed securely via environment variables.</p>
        </div>
      </section>

      {/* OUTREACH SETTINGS */}
      <section className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Outreach Configuration</h2>
          <span className="text-xs font-semibold px-2 py-0.5 bg-gray-200 text-gray-600 rounded">Read-only</span>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Sender Email (Gmail)</label>
              <div className="text-sm font-medium text-gray-900">{envSettings.gmailUser}</div>
              <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                App Password: 
                <span className={`font-semibold ${envSettings.hasGmailPassword ? 'text-green-600' : 'text-red-600'}`}>
                  {envSettings.hasGmailPassword ? 'Configured' : 'Missing'}
                </span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Follow-up Limits</label>
              <div className="text-sm font-medium text-gray-900">Maximum 2 follow-ups</div>
              <div className="text-xs text-gray-500 mt-1">Triggers automatically after 3 days of no reply.</div>
            </div>
          </div>
        </div>
      </section>

      {/* SAFETY & COMPLIANCE */}
      <section className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Safety &amp; Compliance</h2>
          <span className="text-xs font-semibold px-2 py-0.5 bg-gray-200 text-gray-600 rounded">Enforced</span>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 text-green-500">🔒</div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Human Approval Required</h3>
              <p className="text-xs text-gray-500 mt-0.5">All initial outreach emails and follow-ups must be explicitly approved by an operator before they can be sent.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 pt-2">
            <div className="mt-0.5 text-green-500">🔒</div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Automatic Sending Disabled</h3>
              <p className="text-xs text-gray-500 mt-0.5">Automated dispatch is disabled at the architectural level. Emails only send when you click "Send".</p>
            </div>
          </div>
        </div>
      </section>
      
    </div>
  );
}
