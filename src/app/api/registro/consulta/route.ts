import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const matricula = searchParams.get('matricula');

    if (!email && !matricula) {
      return NextResponse.json({ error: 'Debe proporcionar un email o matrícula' }, { status: 400 });
    }

    let participante = null;

    if (email) {
      participante = await prisma.participante.findUnique({
        where: { email },
        include: {
          alumno: true,
          docente: true,
          tallaPlayera: true,
          tallaCamisa: true
        }
      });
    } else if (matricula) {
      const alumno = await prisma.alumno.findUnique({
        where: { matricula },
        include: {
          participante: {
            include: {
              alumno: true,
              docente: true,
              tallaPlayera: true,
              tallaCamisa: true
            }
          }
        }
      });
      if (alumno) {
        participante = alumno.participante;
      }
    }

    if (!participante) {
      return NextResponse.json({ error: 'Registro no encontrado' }, { status: 404 });
    }

    return NextResponse.json({
      id: participante.id,
      nombre: participante.nombre,
      apellidoPaterno: participante.apellidoPaterno,
      apellidoMaterno: participante.apellidoMaterno,
      email: participante.email,
      telefono: participante.telefono,
      tipo: participante.tipo,
      estadoRegistro: participante.estadoRegistro,
      requiereConstancia: participante.requiereConstancia,
      tallaPlayera: participante.tallaPlayera?.nombre,
      tallaCamisa: participante.tallaCamisa?.nombre,
      alumno: participante.alumno ? {
        matricula: participante.alumno.matricula,
        carrera: participante.alumno.carrera,
        semestre: participante.alumno.semestre
      } : null,
      docente: participante.docente ? true : null
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
