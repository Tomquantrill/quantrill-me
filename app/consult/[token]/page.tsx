import { notFound } from 'next/navigation';
import LiteForm from './LiteForm';

interface PageProps {
  params: { token: string };
}

async function getConsultation(token: string) {
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000';

  const res = await fetch(`${baseUrl}/api/consultation?token=${token}`, {
    cache: 'no-store',
  });

  if (!res.ok) return null;
  return res.json() as Promise<{
    id: string;
    token: string;
    contact_name: string | null;
    status: string;
    summary_json: { clientEmail?: string } | null;
  }>;
}

export async function generateMetadata({ params }: PageProps) {
  return {
    title: 'Business questionnaire',
    description: 'Please take a few minutes to tell us about your business.',
  };
}

export default async function ConsultPage({ params }: PageProps) {
  const consultation = await getConsultation(params.token);

  if (!consultation || consultation.status === 'lite_complete') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', padding: '2rem' }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          {consultation?.status === 'lite_complete' ? (
            <>
              <p style={{ fontSize: 14, color: '#5F6B79', marginBottom: 8 }}>Thank you</p>
              <p style={{ fontSize: 14, color: '#5F6B79', fontWeight: 300, lineHeight: 1.75 }}>
                We have received your responses. Tom will be in touch shortly.
              </p>
            </>
          ) : (
            <>
              <p style={{ fontSize: 14, color: '#5F6B79' }}>This link is not valid.</p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <LiteForm
      token={params.token}
      clientName={consultation.contact_name ?? undefined}
    />
  );
}
