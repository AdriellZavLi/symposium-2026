import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const configuraciones = await prisma.configuracion.findMany();
    const configObj = configuraciones.reduce((acc, curr) => {
      acc[curr.clave] = curr.clave === 'registro_abierto' ? curr.valor === '1' : curr.valor;
      return acc;
    }, {} as Record<string, any>);
    return NextResponse.json(configObj);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error al cargar configuración' }, { status: 500 });
  }
}
