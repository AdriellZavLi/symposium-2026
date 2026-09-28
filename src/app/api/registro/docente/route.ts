import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { registroDocenteSchema } from '@/lib/validations';

export async function POST(request: Request) {
  try {
    const config = await prisma.configuracion.findUnique({
      where: { clave: 'registro_abierto' }
    });

    if (config?.valor !== '1') {
      return NextResponse.json({ error: 'El registro se encuentra cerrado.' }, { status: 400 });
    }

    const body = await request.json();
    const result = registroDocenteSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ 
        error: 'Datos inválidos', 
        details: result.error.flatten().fieldErrors 
      }, { status: 400 });
    }

    const data = result.data;

    // Check email uniqueness if provided
    const cleanEmail = data.email?.trim() ? data.email.trim().toLowerCase() : null;
    if (cleanEmail) {
      const existingEmail = await prisma.participante.findUnique({
        where: { email: cleanEmail }
      });

      if (existingEmail) {
        return NextResponse.json({ error: 'Este correo electrónico ya se encuentra registrado' }, { status: 409 });
      }
    }

    // Find talla playera polo (obligatoria)
    const tallaPlayera = await prisma.talla.findFirst({ where: { nombre: data.tallaPlayera } });
    if (!tallaPlayera) {
      return NextResponse.json({ error: 'Talla de playera polo no válida' }, { status: 400 });
    }

    // Find or create talla camisa de vestir por número (opcional)
    let tallaCamisaId: number | null = null;
    if (data.tallaCamisa?.trim()) {
      const numStr = data.tallaCamisa.trim();
      const numVal = parseFloat(numStr) || 0;
      const tc = await prisma.talla.upsert({
        where: { nombre: numStr },
        update: {},
        create: {
          nombre: numStr,
          orden: 100 + Math.round(numVal),
          activa: true,
        }
      });
      tallaCamisaId = tc.id;
    }

    // Transaction to create Participante + Docente
    const participante = await prisma.$transaction(async (tx) => {
      const part = await tx.participante.create({
        data: {
          nombre: data.nombre.trim(),
          apellidoPaterno: data.apellidoPaterno.trim(),
          apellidoMaterno: data.apellidoMaterno?.trim() || null,
          email: cleanEmail,
          telefono: data.telefono?.trim() || null,
          tipo: 'docente',
          tallaPlayeraId: tallaPlayera.id,
          tallaCamisaId: tallaCamisaId,
          requiereConstancia: true,
          estadoRegistro: 'confirmado',
          docente: {
            create: {
              departamento: 'Docente',
            }
          }
        }
      });
      return part;
    });

    return NextResponse.json({ 
      message: 'Registro exitoso', 
      participanteId: participante.id 
    }, { status: 201 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
