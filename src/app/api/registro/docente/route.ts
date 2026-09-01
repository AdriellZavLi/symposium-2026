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

    // Check email uniqueness
    const existingEmail = await prisma.participante.findUnique({
      where: { email: data.email.trim().toLowerCase() }
    });

    if (existingEmail) {
      return NextResponse.json({ error: 'Este correo ya se encuentra registrado' }, { status: 409 });
    }

    // Find tallas
    const tallaPlayera = await prisma.talla.findFirst({ where: { nombre: data.tallaPlayera } });
    if (!tallaPlayera) {
      return NextResponse.json({ error: 'Talla de playera no válida' }, { status: 400 });
    }

    const tallaCamisa = await prisma.talla.findFirst({ where: { nombre: data.tallaCamisa } });
    if (!tallaCamisa) {
      return NextResponse.json({ error: 'Talla de camisa no válida' }, { status: 400 });
    }

    // Transaction to create Participante + Docente
    const participante = await prisma.$transaction(async (tx) => {
      const part = await tx.participante.create({
        data: {
          nombre: data.nombre.trim(),
          apellidoPaterno: data.apellidoPaterno.trim(),
          apellidoMaterno: data.apellidoMaterno?.trim() || null,
          email: data.email.trim().toLowerCase(),
          telefono: data.telefono.trim(),
          tipo: 'docente',
          tallaPlayeraId: tallaPlayera.id,
          tallaCamisaId: tallaCamisa.id,
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
