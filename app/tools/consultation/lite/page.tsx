'use client';

import { useState, FormEvent } from 'react';
import styles from './lite.module.css';

export default function LiteGeneratorPage() {
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ url: string } | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/consultation/lite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientName, clientEmail }),
      });

      if (!res.ok) throw new Error('Failed to create link');

      const data = await res.json() as { id: string; token: string };
      const url = `${window.location.origin}/consult/${data.token}`;
      setResult({ url });
    } catch {
      setError('Failed to generate link. Check the database connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!result) return;
    await navigator.clipboard.writeText(result.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleReset() {
    setResult(null);
    setClientName('');
    setClientEmail('');
    setCopied(false);
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <p className={styles.label}>
          <span className={styles.dot} />
          Consultation — Lite
        </p>
        <h1 className={styles.heading}>Generate a client link</h1>
        <p className={styles.subheading}>
          Creates a short form the client fills in themselves. Covers business basics, the problem, and a condensed digital inventory. Available in English and German. Saves to the consultations table.
        </p>
      </div>

      {!result ? (
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.card}>
            <div className={styles.formGroup}>
              <label className={styles.fieldLabel} htmlFor="clientName">
                Client name <span className={styles.optional}>(optional)</span>
              </label>
              <input
                id="clientName"
                type="text"
                className={styles.input}
                value={clientName}
                onChange={e => setClientName(e.target.value)}
                placeholder="Who the form is for"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.fieldLabel} htmlFor="clientEmail">
                Client email <span className={styles.optional}>(optional, for your reference)</span>
              </label>
              <input
                id="clientEmail"
                type="email"
                className={styles.input}
                value={clientEmail}
                onChange={e => setClientEmail(e.target.value)}
                placeholder="Stored in the record, not used to send anything"
              />
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <button type="submit" className={styles.btn} disabled={loading}>
              {loading ? 'Generating…' : 'Generate link'}
            </button>
          </div>
        </form>
      ) : (
        <div className={styles.card}>
          <p className={styles.successLabel}>Link ready</p>
          <div className={styles.linkBox}>
            <span className={styles.linkText}>{result.url}</span>
          </div>
          <p className={styles.linkNote}>
            Send this to your client. The form is available in English and German.
            Their response will appear in the consultations database.
          </p>
          <div className={styles.resultActions}>
            <button type="button" className={styles.btn} onClick={handleCopy}>
              {copied ? 'Copied!' : 'Copy link'}
            </button>
            <button type="button" className={styles.btnSecondary} onClick={handleReset}>
              Generate another
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
