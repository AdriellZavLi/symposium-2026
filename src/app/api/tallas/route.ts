import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const tallas = await prisma.talla.findMany({
      where: { activa: true },
      orderBy: { orden: 'asc' }
    });
    return NextResponse.json(tallas);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
