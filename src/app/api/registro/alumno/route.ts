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

    // Check if email is provided and already taken by another participant
    const cleanEmail = email?.trim() ? email.trim().toLowerCase() : null;
    if (cleanEmail) {
      const existingEmail = await prisma.participante.findUnique({
        where: { email: cleanEmail }
      });

      if (existingEmail && existingEmail.id !== alumno.participanteId) {
        return NextResponse.json({ error: 'Este correo electrónico ya fue utilizado en otro registro.' }, { status: 409 });
      }
    }

    // Find talla playera polo (obligatoria)
    const tPlayera = await prisma.talla.findFirst({ where: { nombre: tallaPlayera } });
    if (!tPlayera) {
      return NextResponse.json({ error: 'Talla de playera polo no válida.' }, { status: 400 });
    }

    // Find or create talla camisa de vestir por número (opcional)
    let tCamisaId: number | null = null;
    if (tallaCamisa?.trim()) {
      const numStr = tallaCamisa.trim();
      const numVal = parseFloat(numStr) || 0;
      const tCamisa = await prisma.talla.upsert({
        where: { nombre: numStr },
        update: {},
        create: {
          nombre: numStr,
          orden: 100 + Math.round(numVal),
          activa: true,
        }
      });
      tCamisaId = tCamisa.id;
    }

    // Update the participant with optional email, phone, tallas and mark as registered
    await prisma.participante.update({
      where: { id: alumno.participanteId },
      data: {
        email: cleanEmail,
        telefono: telefono?.trim() || null,
        tallaPlayeraId: tPlayera.id,
        tallaCamisaId: tCamisaId,
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
