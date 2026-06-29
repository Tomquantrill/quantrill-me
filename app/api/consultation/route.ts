import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import type { ConsultationFormData } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as ConsultationFormData;

    const rows = await sql`
      INSERT INTO consultations (
        business_name, business_type, contact_name, contact_role,
        summary_json, notes, status, source
      ) VALUES (
        ${body.partA.businessName || null},
        ${body.partA.businessType || null},
        ${body.contactName || null},
        ${body.partA.contactRole || null},
        ${JSON.stringify(body)},
        ${body.notes || null},
        'draft',
        'full'
      )
      RETURNING id, created_at, status
    `;

    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to create consultation' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  const token = req.nextUrl.searchParams.get('token');

  if (token) {
    try {
      const rows = await sql`
        SELECT * FROM consultations WHERE token = ${token} LIMIT 1
      `;
      if (!rows.length) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
      return NextResponse.json(rows[0]);
    } catch (err) {
      return NextResponse.json({ error: 'Failed to fetch consultation' }, { status: 500 });
    }
  }

  if (!id) {
    try {
      const rows = await sql`
        SELECT id, created_at, business_name, contact_name, status, source
        FROM consultations
        WHERE source = 'full'
        ORDER BY created_at DESC
        LIMIT 20
      `;
      return NextResponse.json(rows);
    } catch (err) {
      return NextResponse.json({ error: 'Failed to list consultations' }, { status: 500 });
    }
  }

  try {
    const rows = await sql`
      SELECT * FROM consultations WHERE id = ${id} LIMIT 1
    `;
    if (!rows.length) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json(rows[0]);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch consultation' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  try {
    const body = await req.json() as ConsultationFormData & { status?: string };

    const rows = await sql`
      UPDATE consultations SET
        business_name = ${body.partA?.businessName || null},
        business_type = ${body.partA?.businessType || null},
        contact_name  = ${body.contactName || null},
        contact_role  = ${body.partA?.contactRole || null},
        summary_json  = ${JSON.stringify(body)},
        notes         = ${body.notes || null},
        status        = COALESCE(${body.status ?? null}, status)
      WHERE id = ${id}
      RETURNING id, created_at, status
    `;

    if (!rows.length) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to update consultation' }, { status: 500 });
  }
}
