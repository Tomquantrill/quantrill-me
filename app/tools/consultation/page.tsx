import { Suspense } from 'react';
import ConsultationForm from '@/components/tools/consultation/ConsultationForm';
import styles from './consultation.module.css';

export const metadata = {
  title: 'Consultation — Tools',
};

function Loading() {
  return <div className={styles.loading}>Loading…</div>;
}

export default function ConsultationPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ConsultationForm />
    </Suspense>
  );
}
