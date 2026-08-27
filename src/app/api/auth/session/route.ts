import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, SessionData } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    if (session.isLoggedIn) {
      return NextResponse.json(session);
    }
    return NextResponse.json({ isLoggedIn: false });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ isLoggedIn: false });
  }
}
