import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import prisma from '@/lib/db';
import { updateParticipanteSchema } from '@/lib/validations';
import { sessionOptions, SessionData } from '@/lib/auth';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id, 10);
    const participante = await prisma.participante.findUnique({
      where: { id },
      include: {
        alumno: true,
        docente: true,
        tallaPlayera: true,
        tallaCamisa: true
      }
    });

    if (!participante) {
      return NextResponse.json({ error: 'Participante no encontrado' }, { status: 404 });
    }

    return NextResponse.json(participante);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id, 10);
    const body = await request.json();
    const result = updateParticipanteSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Datos inválidos', details: result.error.flatten() }, { status: 400 });
    }

    const data = result.data;
    
    // update participant
    let tallaPlayeraId, tallaCamisaId;
    if (data.tallaPlayera) {
      const tp = await prisma.talla.findFirst({ where: { nombre: data.tallaPlayera } });
      if (tp) tallaPlayeraId = tp.id;
    }
    if (data.tallaCamisa) {
      const tc = await prisma.talla.findFirst({ where: { nombre: data.tallaCamisa } });
      if (tc) tallaCamisaId = tc.id;
    }

    const updateData: any = {
      nombre: data.nombre,
      apellidoPaterno: data.apellidoPaterno,
      apellidoMaterno: data.apellidoMaterno,
      telefono: data.telefono,
      requiereConstancia: data.requiereConstancia,
    };
    if (tallaPlayeraId) updateData.tallaPlayeraId = tallaPlayeraId;
    if (tallaCamisaId) updateData.tallaCamisaId = tallaCamisaId;

    const participante = await prisma.participante.update({
      where: { id },
      data: updateData,
      include: { alumno: true, docente: true }
    });

    if (participante.tipo === 'alumno' && data.semestre) {
      await prisma.alumno.update({
        where: { participanteId: id },
        data: { semestre: data.semestre }
      });
    }

    return NextResponse.json({ message: 'Actualizado exitosamente' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id, 10);
    await prisma.participante.delete({ where: { id } });
    return NextResponse.json({ message: 'Eliminado exitosamente' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
