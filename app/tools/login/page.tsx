'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './login.module.css';

export default function LoginPage() {
  const router = useRouter();
  const [passphrase, setPassphrase] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passphrase }),
      });

      if (!res.ok) {
        setError('Incorrect passphrase.');
        return;
      }

      router.push('/tools');
    } catch {
      setError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <Image src="/logo.png" alt="Quantrill" width={32} height={32} className={styles.logoImg} />
          <span className={styles.logoName}>Tools</span>
        </div>

        <h1 className={styles.heading}>Private access</h1>
        <p className={styles.subheading}>Enter your passphrase to continue.</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="passphrase">
              Passphrase
            </label>
            <input
              id="passphrase"
              type="password"
              className={styles.input}
              value={passphrase}
              onChange={e => setPassphrase(e.target.value)}
              autoFocus
              autoComplete="current-password"
              disabled={loading}
              required
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button
            type="submit"
            className={styles.button}
            disabled={loading || !passphrase}
          >
            {loading ? 'Checking...' : 'Enter'}
          </button>
        </form>
      </div>
    </div>
  );
}
