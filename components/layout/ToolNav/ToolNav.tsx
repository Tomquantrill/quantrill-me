'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './ToolNav.module.css';

const tools = [
  { id: 'consultation', label: 'Consultation', href: '/tools/consultation', active: true },
  { id: 'proposals', label: 'Proposals', href: '/tools/proposals', active: false },
  { id: 'waiver', label: 'Waiver', href: '/tools/waiver', active: false },
  { id: 'invoices', label: 'Invoices', href: '/tools/invoices', active: false },
  { id: 'remote', label: 'Remote Access', href: '/tools/remote', active: false },
];

export default function ToolNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav} aria-label="Tools navigation">
      {tools.map(tool => {
        const isCurrent = pathname.startsWith(tool.href);

        if (!tool.active) {
          return (
            <span key={tool.id} className={`${styles.item} ${styles.itemDisabled}`}>
              <span className={styles.itemLabel}>{tool.label}</span>
              <span className={styles.badge}>Soon</span>
            </span>
          );
        }

        return (
          <Link
            key={tool.id}
            href={tool.href}
            className={`${styles.item} ${isCurrent ? styles.itemActive : ''}`}
            aria-current={isCurrent ? 'page' : undefined}
          >
            <span className={styles.itemLabel}>{tool.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
