import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json() as { passphrase: string };
  const expected = process.env.TOOLS_PASSPHRASE;

  if (!expected || body.passphrase !== expected) {
    return NextResponse.json({ error: 'Invalid passphrase' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set('tools-auth', '1', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete('tools-auth');
  return res;
}
