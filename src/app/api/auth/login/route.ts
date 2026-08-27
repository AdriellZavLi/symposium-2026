import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import bcrypt from 'bcrypt';
import prisma from '@/lib/db';
import { loginSchema } from '@/lib/validations';
import { sessionOptions, SessionData } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = loginSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: 'Datos inválidos', details: result.error.flatten() }, { status: 400 });
    }

    const { usuario, password } = result.data;

    const admin = await prisma.administrador.findUnique({
      where: { usuario }
    });

    if (!admin) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
    }

    const validPassword = await bcrypt.compare(password, admin.passwordHash);
    
    if (!validPassword) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
    }

    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    session.adminId = admin.id;
    session.usuario = admin.usuario;
    session.nombre = admin.nombre;
    session.rol = admin.rol;
    session.semestre = admin.semestre;
    session.isLoggedIn = true;
    await session.save();

    return NextResponse.json({
      id: admin.id,
      usuario: admin.usuario,
      nombre: admin.nombre,
      rol: admin.rol,
      semestre: admin.semestre
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error en el servidor' }, { status: 500 });
  }
}
