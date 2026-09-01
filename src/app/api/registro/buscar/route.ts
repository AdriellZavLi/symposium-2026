import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const matricula = searchParams.get('matricula');

    if (!matricula || !matricula.trim()) {
      return NextResponse.json({ error: 'Debe proporcionar un número de control' }, { status: 400 });
    }

    const alumno = await prisma.alumno.findUnique({
      where: { matricula: matricula.trim() },
      include: {
        participante: {
          include: {
            tallaPlayera: true,
            tallaCamisa: true,
          }
        }
      }
    });

    if (!alumno) {
      return NextResponse.json({ error: 'Tu número de control no se encuentra en la lista de alumnos registrados.' }, { status: 404 });
    }

    const p = alumno.participante;

    if (p.estadoRegistro !== 'sin_registrar') {
      return NextResponse.json({
        error: 'Ya completaste tu registro anteriormente. Si necesitas hacer cambios, contacta a un administrador.',
        yaRegistrado: true,
        nombre: p.nombre,
        apellidoPaterno: p.apellidoPaterno,
        tallaPlayera: p.tallaPlayera?.nombre,
        tallaCamisa: p.tallaCamisa?.nombre,
      }, { status: 409 });
    }

    return NextResponse.json({
      matricula: alumno.matricula,
      semestre: alumno.semestre,
      nombre: p.nombre,
      apellidoPaterno: p.apellidoPaterno,
      apellidoMaterno: p.apellidoMaterno,
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
