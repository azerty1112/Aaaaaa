'use client';

import { useState } from 'react';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(false);
  const [stream, setStream] = useState(false);
  const [apiKey, setApiKey] = useState('');

  const handleSubmit = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setReply('');
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (apiKey) headers['x-api-key'] = apiKey;

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({ prompt, stream }),
      });

      if (!res.ok) {
        setReply('خطأ: ' + res.status);
        setLoading(false);
        return;
      }

      if (stream) {
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let done = false;
        while (!done) {
          const { value, done: doneReading } = await reader!.read();
          done = doneReading;
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data:')) {
              const dataStr = line.slice(5).trim();
              if (dataStr === '[DONE]') break;
              try {
                const json = JSON.parse(dataStr);
                const content = json.choices?.[0]?.delta?.content;
                if (content) setReply((prev) => prev + content);
              } catch {}
            }
          }
        }
      } else {
        const data = await res.json();
        if (data.success) setReply(data.response);
        else setReply('خطأ: ' + data.error);
      }
    } catch (err) {
      setReply('فشل الاتصال بالخادم');
    }
    setLoading(false);
  };

  return (
    <main style={{ maxWidth: 700, margin: '20px auto', padding: 20 }}>
      <h1 style={{ textAlign: 'center', marginBottom: 20 }}>ChatGPT Proxy on Vercel</h1>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={4}
        placeholder="اكتب رسالتك هنا..."
        style={{ width: '100%', padding: 10, fontSize: 16, borderRadius: 8, border: '1px solid #ccc' }}
      />
      <div style={{ margin: '10px 0', display: 'flex', alignItems: 'center', gap: 15, flexWrap: 'wrap' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <input
            type="checkbox"
            checked={stream}
            onChange={(e) => setStream(e.target.checked)}
          />
          تفعيل البث المباشر
        </label>
        <input
          type="text"
          placeholder="API Key (اختياري)"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          style={{ padding: 5, borderRadius: 4, border: '1px solid #ccc', flex: 1 }}
        />
      </div>
      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          padding: '10px 20px',
          fontSize: 16,
          backgroundColor: '#0070f3',
          color: 'white',
          border: 'none',
          borderRadius: 8,
          cursor: 'pointer',
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? 'جارٍ التفكير...' : 'إرسال'}
      </button>
      <div
        style={{
          marginTop: 20,
          whiteSpace: 'pre-wrap',
          border: '1px solid #ccc',
          padding: 15,
          minHeight: 150,
          borderRadius: 8,
          backgroundColor: 'white',
        }}
      >
        {reply || 'الرد سيظهر هنا...'}
      </div>
    </main>
  );
}
