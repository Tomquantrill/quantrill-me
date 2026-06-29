import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import type { LiteFormData } from '@/lib/types';

export async function POST(req: NextRequest) {
  const auth = req.cookies.get('tools-auth');
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json() as { clientName?: string; clientEmail?: string };
    const token = crypto.randomUUID().replace(/-/g, '');

    const rows = await sql`
      INSERT INTO consultations (
        contact_name, status, source, token, summary_json
      ) VALUES (
        ${body.clientName || null},
        'lite_pending',
        'lite',
        ${token},
        ${JSON.stringify({ clientName: body.clientName, clientEmail: body.clientEmail })}
      )
      RETURNING id, token
    `;

    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to create lite consultation' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 });
  }

  try {
    const body = await req.json() as LiteFormData;

    const rows = await sql`
      UPDATE consultations SET
        business_name = ${body.businessName || null},
        business_type = ${body.businessType || null},
        contact_name  = ${body.contactName || null},
        contact_role  = ${body.contactRole || null},
        summary_json  = ${JSON.stringify({ source: 'lite', ...body })},
        status        = 'lite_complete'
      WHERE token = ${token} AND source = 'lite'
      RETURNING id, created_at
    `;

    if (!rows.length) {
      return NextResponse.json({ error: 'Not found or already submitted' }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to submit' }, { status: 500 });
  }
}
