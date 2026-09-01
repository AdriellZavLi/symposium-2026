import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import prisma from '@/lib/db';
import { sessionOptions, SessionData } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get('tipo');

    if (tipo === 'tallas') {
      const tallas = await prisma.talla.findMany();
      const stats = await Promise.all(tallas.map(async (talla) => {
        const camisasAlumno = await prisma.participante.count({ where: { tallaCamisaId: talla.id, tipo: 'alumno' }});
        const camisasDocente = await prisma.participante.count({ where: { tallaCamisaId: talla.id, tipo: 'docente' }});
        const playerasAlumno = await prisma.participante.count({ where: { tallaPlayeraId: talla.id, tipo: 'alumno' }});
        const playerasDocente = await prisma.participante.count({ where: { tallaPlayeraId: talla.id, tipo: 'docente' }});
        
        return {
          talla: talla.nombre,
          camisas: {
            alumno: camisasAlumno,
            docente: camisasDocente,
            total: camisasAlumno + camisasDocente
          },
          playeras: {
            alumno: playerasAlumno,
            docente: playerasDocente,
            total: playerasAlumno + playerasDocente
          }
        };
      }));
      return NextResponse.json(stats);
    }

    const totalParticipantes = await prisma.participante.count();
    const totalAlumnos = await prisma.participante.count({ where: { tipo: 'alumno' }});
    const totalDocentes = await prisma.participante.count({ where: { tipo: 'docente' }});
    const sinRegistrar = await prisma.participante.count({ where: { estadoRegistro: 'sin_registrar' }});
    const registrados = await prisma.participante.count({ where: { estadoRegistro: { not: 'sin_registrar' } }});
    
    const byEstado = await prisma.participante.groupBy({
      by: ['estadoRegistro'],
      _count: { id: true }
    });

    const bySemestre = await prisma.alumno.groupBy({
      by: ['semestre'],
      _count: { matricula: true }
    });

    const tallas = await prisma.talla.findMany();
    const tallasCamisa = await Promise.all(tallas.map(async (t) => {
      const c = await prisma.participante.count({ where: { tallaCamisaId: t.id }});
      return { talla: t.nombre, count: c };
    }));
    const tallasPlayera = await Promise.all(tallas.map(async (t) => {
      const c = await prisma.participante.count({ where: { tallaPlayeraId: t.id }});
      return { talla: t.nombre, count: c };
    }));

    const confirmadosCount = byEstado.find(e => e.estadoRegistro === 'confirmado')?._count.id || 0;

    const tallasResumen = tallas.map(t => {
      const camisasCount = tallasCamisa.find(tc => tc.talla === t.nombre)?.count || 0;
      const playerasCount = tallasPlayera.find(tp => tp.talla === t.nombre)?.count || 0;
      return { nombre: t.nombre, camisas: camisasCount, playeras: playerasCount };
    });

    return NextResponse.json({
      total: totalParticipantes,
      alumnos: totalAlumnos,
      docentes: totalDocentes,
      sinRegistrar,
      registrados,
      confirmados: confirmadosCount,
      porTipo: { alumno: totalAlumnos, docente: totalDocentes },
      porEstado: byEstado.map(e => ({ estado: e.estadoRegistro, count: e._count.id })),
      porSemestre: bySemestre.map(s => ({ semestre: s.semestre, count: s._count.matricula })),
      tallas: tallasResumen
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
