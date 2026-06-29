import Link from 'next/link';
import styles from './tools.module.css';

const tools = [
  {
    id: 'consultation',
    title: 'Consultation',
    description:
      'Structured form for client discovery calls. Auto-saves to the database, generates a summary JSON for proposal handoff.',
    href: '/tools/consultation',
    active: true,
  },
  {
    id: 'proposals',
    title: 'Proposals',
    description:
      'Generate a proposal document from a completed consultation. Pulls client and project data automatically.',
    href: '/tools/proposals',
    active: false,
  },
  {
    id: 'waiver',
    title: 'Waiver',
    description:
      'Client waiver generation and tracking. Links to proposal data for pre-filled client details.',
    href: '/tools/waiver',
    active: false,
  },
  {
    id: 'invoices',
    title: 'Invoices',
    description:
      'Invoice management and payment link generation. Reads scope and pricing from proposals.',
    href: '/tools/invoices',
    active: false,
  },
  {
    id: 'remote',
    title: 'Remote Access',
    description:
      'Setup instructions and credentials for remote access sessions with clients.',
    href: '/tools/remote',
    active: false,
  },
];

export default function ToolsPage() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <p className={styles.label}>
          <span className={styles.dot} />
          Tools hub
        </p>
        <h1 className={styles.heading}>Internal workspace</h1>
        <p className={styles.subheading}>
          Tools for running client engagements end to end. Data flows from Consultation through to Invoice.
        </p>
      </div>

      <div className={styles.grid}>
        {tools.map(tool =>
          tool.active ? (
            <Link key={tool.id} href={tool.href} className={`${styles.card} ${styles.cardActive}`}>
              <h2 className={styles.cardTitle}>{tool.title}</h2>
              <p className={styles.cardDesc}>{tool.description}</p>
              <span className={styles.arrow}>→</span>
            </Link>
          ) : (
            <div key={tool.id} className={`${styles.card} ${styles.cardDisabled}`}>
              <div className={styles.cardRow}>
                <h2 className={styles.cardTitle}>{tool.title}</h2>
                <span className={styles.cardBadge}>Coming soon</span>
              </div>
              <p className={styles.cardDesc}>{tool.description}</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
