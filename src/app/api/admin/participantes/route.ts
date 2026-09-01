import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import prisma from '@/lib/db';
import { sessionOptions, SessionData } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.max(1, parseInt(searchParams.get('limit') || '50'));
    const tipo = searchParams.get('tipo');
    const semestre = searchParams.get('semestre');
    const talla_playera = searchParams.get('talla_playera');
    const talla_camisa = searchParams.get('talla_camisa');
    const estado = searchParams.get('estado');
    const buscar = searchParams.get('buscar')?.trim();

    const where: any = {};
    if (tipo && tipo !== 'Todos') where.tipo = tipo.toLowerCase();
    if (estado && estado !== 'Todos') where.estadoRegistro = estado.toLowerCase().replace(' ', '_');
    if (talla_playera && talla_playera !== 'Todos') where.tallaPlayera = { nombre: talla_playera };
    if (talla_camisa && talla_camisa !== 'Todos') where.tallaCamisa = { nombre: talla_camisa };
    
    if (semestre && semestre !== 'Todos') {
      where.alumno = { semestre: parseInt(semestre) };
    }

    if (buscar) {
      where.OR = [
        { nombre: { contains: buscar, mode: 'insensitive' } },
        { apellidoPaterno: { contains: buscar, mode: 'insensitive' } },
        { apellidoMaterno: { contains: buscar, mode: 'insensitive' } },
        { email: { contains: buscar, mode: 'insensitive' } },
        { alumno: { matricula: { contains: buscar, mode: 'insensitive' } } }
      ];
    }

    const skip = (page - 1) * limit;

    const [total, participantes] = await Promise.all([
      prisma.participante.count({ where }),
      prisma.participante.findMany({
        where,
        include: {
          alumno: true,
          docente: true,
          tallaPlayera: true,
          tallaCamisa: true
        },
        orderBy: [
          { alumno: { semestre: 'asc' } },
          { apellidoPaterno: 'asc' },
          { nombre: 'asc' }
        ],
        skip,
        take: limit
      })
    ]);

    const flatParticipantes = participantes.map(p => ({
      id: p.id,
      nombre: p.nombre,
      apellidoPaterno: p.apellidoPaterno,
      apellidoMaterno: p.apellidoMaterno || '',
      email: p.email || '',
      telefono: p.telefono || '',
      tipo: p.tipo,
      estadoRegistro: p.estadoRegistro,
      requiereConstancia: p.requiereConstancia,
      tallaPlayera: p.tallaPlayera?.nombre || '',
      tallaCamisa: p.tallaCamisa?.nombre || '',
      createdAt: p.createdAt,
      matricula: p.alumno?.matricula || '',
      semestre: p.alumno?.semestre ?? null,
      carrera: p.alumno?.carrera || ''
    }));

    return NextResponse.json({
      data: flatParticipantes,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit))
      }
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
