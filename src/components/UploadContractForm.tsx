"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UploadContractForm() {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [policy, setPolicy] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !text) {
      setError('Title and text are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, contractText: text, policyText: policy }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to extract data');
      }

      router.push(`/contract/${data.contractId}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-danger-color text-sm bg-red-900/20 p-3 rounded">{error}</div>}
      
      <div className="form-group">
        <label className="form-label">Contract Title</label>
        <input 
          type="text" 
          className="form-input" 
          placeholder="e.g. Acme Corp NDA 2024"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Contract Text (Required)</label>
        <textarea 
          className="form-textarea" 
          rows={8} 
          placeholder="Paste the raw text of the contract here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Organizational Policy (Optional)</label>
        <textarea 
          className="form-textarea" 
          rows={4} 
          placeholder="Paste optional organizational policy document..."
          value={policy}
          onChange={(e) => setPolicy(e.target.value)}
          disabled={loading}
        />
      </div>

      <button type="submit" className="btn btn-primary w-full" disabled={loading} style={{ width: '100%' }}>
        {loading ? (
          <>
            <span className="loader"></span> Processing AI...
          </>
        ) : (
          'Analyze Contract'
        )}
      </button>
      <p className="text-xs text-gray-400 text-center mt-2">
        Note: This is an information-management tool, not legal advice.
      </p>
    </form>
  );
}
