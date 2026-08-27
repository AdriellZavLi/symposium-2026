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

    const data = result.data;

    // Duplicates check
    const existingMatricula = await prisma.alumno.findUnique({
      where: { matricula: data.matricula }
    });

    if (existingMatricula) {
      return NextResponse.json({ error: 'Esta matrícula ya se encuentra registrada' }, { status: 409 });
    }

    const existingEmail = await prisma.participante.findUnique({
      where: { email: data.email }
    });

    if (existingEmail) {
      return NextResponse.json({ error: 'Este correo ya se encuentra registrado' }, { status: 409 });
    }

    // Find tallas
    const tallaPlayera = await prisma.talla.findFirst({ where: { nombre: data.tallaPlayera } });
    const tallaCamisa = data.tallaCamisa ? await prisma.talla.findFirst({ where: { nombre: data.tallaCamisa } }) : null;

    if (!tallaPlayera) {
      return NextResponse.json({ error: 'Talla de playera no encontrada' }, { status: 400 });
    }

    // Transaction
    const participante = await prisma.$transaction(async (tx) => {
      const part = await tx.participante.create({
        data: {
          nombre: data.nombre,
          apellidoPaterno: data.apellidoPaterno,
          apellidoMaterno: data.apellidoMaterno,
          email: data.email,
          telefono: data.telefono,
          tipo: 'alumno',
          tallaPlayeraId: tallaPlayera.id,
          tallaCamisaId: tallaCamisa?.id,
          requiereConstancia: data.requiereConstancia,
          alumno: {
            create: {
              matricula: data.matricula,
              carrera: 'Ingeniería en Sistemas Computacionales',
              semestre: data.semestre,
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
