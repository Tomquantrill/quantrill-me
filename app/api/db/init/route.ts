import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET(req: NextRequest) {
  const auth = req.cookies.get('tools-auth');
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS consultations (
        id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        created_at     TIMESTAMPTZ DEFAULT now(),
        business_name  TEXT,
        business_type  TEXT,
        contact_name   TEXT,
        contact_role   TEXT,
        summary_json   JSONB,
        notes          TEXT,
        status         TEXT DEFAULT 'draft',
        source         TEXT DEFAULT 'full',
        token          TEXT UNIQUE
      )
    `;
    return NextResponse.json({ ok: true, message: 'Database initialised' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
