'use client';

import { useEffect, useState } from 'react';

interface Settings {
  sessionCookie: string;
  accessToken?: string;
  apiAccessKey?: string;
  defaultModel: string;
  rateLimitMaxRequests: number;
  rateLimitWindow: string;
}

export default function AdminPage() {
  const [settings, setSettings] = useState<Settings>({
    sessionCookie: '',
    accessToken: '',
    apiAccessKey: '',
    defaultModel: 'gpt-4o',
    rateLimitMaxRequests: 10,
    rateLimitWindow: '1 m',
  });
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((res) => {
        if (!res.ok) throw new Error('Unauthorized');
        return res.json();
      })
      .then((data) => setSettings(data))
      .catch(() => setMessage('فشل تحميل الإعدادات أو انتهت الجلسة'));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...settings, newAdminPassword }),
      });
      if (res.ok) {
        setMessage('تم الحفظ بنجاح');
        setNewAdminPassword('');
      } else {
        setMessage('حدث خطأ أثناء الحفظ');
      }
    } catch {
      setMessage('فشل الاتصال');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  const handleRefreshToken = async () => {
    const res = await fetch('/api/session', { method: 'POST' });
    if (res.ok) setMessage('تم تحديث التوكن بنجاح');
    else setMessage('فشل تحديث التوكن');
  };

  return (
    <div style={{ maxWidth: 800, margin: '20px auto', padding: 20, backgroundColor: 'white', borderRadius: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>لوحة الإدارة</h1>
        <button onClick={handleLogout} style={{ padding: '5px 10px' }}>
          تسجيل الخروج
        </button>
      </div>
      {message && (
        <p style={{ color: message.includes('نجاح') ? 'green' : 'red', margin: '10px 0' }}>{message}</p>
      )}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 15 }}>
          <label style={{ display: 'block', marginBottom: 5 }}>كوكي الجلسة (Session Cookie)</label>
          <textarea
            name="sessionCookie"
            value={settings.sessionCookie}
            onChange={handleChange}
            rows={3}
            style={{ width: '100%', direction: 'ltr', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
            required
          />
        </div>
        <div style={{ marginBottom: 15 }}>
          <label style={{ display: 'block', marginBottom: 5 }}>Access Token (اختياري)</label>
          <textarea
            name="accessToken"
            value={settings.accessToken || ''}
            onChange={handleChange}
            rows={2}
            style={{ width: '100%', direction: 'ltr', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
          />
        </div>
        <div style={{ marginBottom: 15 }}>
          <label style={{ display: 'block', marginBottom: 5 }}>مفتاح API للحماية (API_ACCESS_KEY)</label>
          <input
            type="text"
            name="apiAccessKey"
            value={settings.apiAccessKey || ''}
            onChange={handleChange}
            style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
          />
        </div>
        <div style={{ marginBottom: 15 }}>
          <label style={{ display: 'block', marginBottom: 5 }}>النموذج الافتراضي</label>
          <select
            name="defaultModel"
            value={settings.defaultModel}
            onChange={handleChange}
            style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
          >
            <option value="gpt-4o">GPT-4o</option>
            <option value="gpt-4">GPT-4</option>
            <option value="text-davinci-002-render-sha">Legacy</option>
          </select>
        </div>
        <div style={{ display: 'flex', gap: 20, marginBottom: 15 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 5 }}>أقصى عدد طلبات (Rate Limit Max)</label>
            <input
              type="number"
              name="rateLimitMaxRequests"
              value={settings.rateLimitMaxRequests}
              onChange={handleChange}
              style={{ width: 100, padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 5 }}>نافذة الوقت (Window)</label>
            <input
              type="text"
              name="rateLimitWindow"
              value={settings.rateLimitWindow}
              onChange={handleChange}
              style={{ width: 100, padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
            />
          </div>
        </div>
        <div style={{ marginBottom: 15 }}>
          <label style={{ display: 'block', marginBottom: 5 }}>
            كلمة مرور جديدة للإدارة (اتركها فارغة لعدم التغيير)
          </label>
          <input
            type="password"
            value={newAdminPassword}
            onChange={(e) => setNewAdminPassword(e.target.value)}
            style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
          />
        </div>
        <button
          type="submit"
          style={{
            padding: '10px 20px',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            fontSize: 16,
          }}
        >
          حفظ الإعدادات
        </button>
      </form>
      <div style={{ marginTop: 30 }}>
        <p style={{ fontSize: 14, color: '#666' }}>
          ملاحظة: بعد حفظ الكوكي، يمكنك تحديث التوكن تلقائيًا بالزر التالي.
        </p>
        <button
          onClick={handleRefreshToken}
          style={{
            padding: '8px 16px',
            marginTop: 10,
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: 4,
          }}
        >
          تحديث Access Token الآن
        </button>
      </div>
    </div>
  );
}
