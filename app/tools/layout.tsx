import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import ToolNav from '@/components/layout/ToolNav/ToolNav';
import styles from './layout.module.css';

export const metadata: Metadata = {
  title: 'Tools — Quantrill',
};

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.shell}>
      <header className={styles.topBar}>
        <Link href="/tools" className={styles.logoLink}>
          <div className={styles.logoMark}>
            <Image src="/logo.png" alt="Quantrill" width={28} height={28} />
          </div>
          <span className={styles.logoName}>Tools</span>
        </Link>
        <Link href="/" className={styles.backLink}>
          ← quantrill.me
        </Link>
      </header>

      <div className={styles.body}>
        <aside className={styles.sidebar}>
          <ToolNav />
        </aside>

        <main className={styles.main}>
          {children}
        </main>
      </div>
    </div>
  );
}
