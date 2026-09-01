import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(request: Request) {
  try {
    const config = await prisma.configuracion.findUnique({
      where: { clave: 'registro_abierto' }
    });

    if (config?.valor !== '1') {
      return NextResponse.json({ error: 'El registro se encuentra cerrado.' }, { status: 400 });
    }

    const body = await request.json();
    const { matricula, tallaPlayera, tallaCamisa } = body;

    if (!matricula || !tallaPlayera) {
      return NextResponse.json({ error: 'Matrícula y talla de playera son obligatorios.' }, { status: 400 });
    }

    // Find the student
    const alumno = await prisma.alumno.findUnique({
      where: { matricula: matricula.trim() },
      include: { participante: true }
    });

    if (!alumno) {
      return NextResponse.json({ error: 'Número de control no encontrado en la lista.' }, { status: 404 });
    }

    if (alumno.participante.estadoRegistro !== 'sin_registrar') {
      return NextResponse.json({ error: 'Ya completaste tu registro anteriormente.' }, { status: 409 });
    }

    // Find tallas
    const tPlayera = await prisma.talla.findFirst({ where: { nombre: tallaPlayera } });
    if (!tPlayera) {
      return NextResponse.json({ error: 'Talla de playera no válida.' }, { status: 400 });
    }

    const tCamisa = tallaCamisa ? await prisma.talla.findFirst({ where: { nombre: tallaCamisa } }) : null;

    // Update the participant with talla and mark as registered
    await prisma.participante.update({
      where: { id: alumno.participanteId },
      data: {
        tallaPlayeraId: tPlayera.id,
        tallaCamisaId: tCamisa?.id || null,
        estadoRegistro: 'pendiente',
      }
    });

    return NextResponse.json({
      message: 'Registro exitoso',
      nombre: alumno.participante.nombre,
    }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
