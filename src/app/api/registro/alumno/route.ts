import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { registroAlumnoSchema } from '@/lib/validations';

export async function POST(request: Request) {
  try {
    const config = await prisma.configuracion.findUnique({
      where: { clave: 'registro_abierto' }
    });

    if (config?.valor !== '1') {
      return NextResponse.json({ error: 'El registro se encuentra cerrado.' }, { status: 400 });
    }

    const body = await request.json();
    const result = registroAlumnoSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({
        error: 'Datos inválidos',
        details: result.error.flatten().fieldErrors
      }, { status: 400 });
    }

    const { matricula, email, telefono, tallaPlayera, tallaCamisa } = result.data;

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

    // Check if email is already taken by another participant
    const existingEmail = await prisma.participante.findUnique({
      where: { email: email.trim().toLowerCase() }
    });

    if (existingEmail && existingEmail.id !== alumno.participanteId) {
      return NextResponse.json({ error: 'Este correo electrónico ya fue utilizado en otro registro.' }, { status: 409 });
    }

    // Find tallas
    const tPlayera = await prisma.talla.findFirst({ where: { nombre: tallaPlayera } });
    if (!tPlayera) {
      return NextResponse.json({ error: 'Talla de playera no válida.' }, { status: 400 });
    }

    const tCamisa = await prisma.talla.findFirst({ where: { nombre: tallaCamisa } });
    if (!tCamisa) {
      return NextResponse.json({ error: 'Talla de camisa no válida.' }, { status: 400 });
    }

    // Update the participant with email, phone, tallas and mark as registered
    await prisma.participante.update({
      where: { id: alumno.participanteId },
      data: {
        email: email.trim().toLowerCase(),
        telefono: telefono.trim(),
        tallaPlayeraId: tPlayera.id,
        tallaCamisaId: tCamisa.id,
        requiereConstancia: true,
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
