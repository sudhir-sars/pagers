"use client";
import { useState } from 'react';
import MathpixRenderer from '@/component/mathpixRenderer/MathpixRenderer';

export default function Home() {
  const [docContent, setDocContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDoc = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/static', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // You can send any necessary body data here if needed.
        body: JSON.stringify({}),
      });
      const data = await response.json();
      if (data.content) {
        setDocContent(data.content);
      } else {
        setError(data.error || 'Error fetching document content');
      }
    } catch (err) {
      setError('An error occurred while fetching the document');
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Document Viewer</h1>
      <button onClick={fetchDoc} disabled={loading}>
        {loading ? 'Loading...' : 'Load Document'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {docContent && (
        <div style={{ marginTop: '20px' }}>
          <MathpixRenderer markdownData={docContent} />
        </div>
      )}
    </div>
  );
}
