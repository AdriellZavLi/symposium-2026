import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import prisma from '@/lib/db';
import { sessionOptions, SessionData } from '@/lib/auth';
import ExcelJS from 'exceljs';

export async function GET(request: Request) {
  try {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const tallas = await prisma.talla.findMany();
    const stats = await Promise.all(tallas.map(async (talla) => {
      const camisasAlumno = await prisma.participante.count({ where: { tallaCamisaId: talla.id, tipo: 'alumno' }});
      const camisasDocente = await prisma.participante.count({ where: { tallaCamisaId: talla.id, tipo: 'docente' }});
      const playerasAlumno = await prisma.participante.count({ where: { tallaPlayeraId: talla.id, tipo: 'alumno' }});
      const playerasDocente = await prisma.participante.count({ where: { tallaPlayeraId: talla.id, tipo: 'docente' }});
      
      return {
        talla: talla.nombre,
        camisas: { alumno: camisasAlumno, docente: camisasDocente, total: camisasAlumno + camisasDocente },
        playeras: { alumno: playerasAlumno, docente: playerasDocente, total: playerasAlumno + playerasDocente }
      };
    }));

    const workbook = new ExcelJS.Workbook();
    
    const styleHeader = (sheet: ExcelJS.Worksheet) => {
      sheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
      });
    };

    // Sheet 1: Resumen
    const sheet1 = workbook.addWorksheet('Resumen de Tallas');
    sheet1.columns = [
      { header: 'Talla', key: 'talla', width: 15 },
      { header: 'Camisas (Total)', key: 'camisas', width: 20 },
      { header: 'Playeras (Total)', key: 'playeras', width: 20 }
    ];
    styleHeader(sheet1);
    stats.forEach(s => sheet1.addRow({ talla: s.talla, camisas: s.camisas.total, playeras: s.playeras.total }));

    // Sheet 2: Alumnos
    const sheet2 = workbook.addWorksheet('Tallas por Alumnos');
    sheet2.columns = [
      { header: 'Talla', key: 'talla', width: 15 },
      { header: 'Camisas (Alumnos)', key: 'camisas', width: 20 },
      { header: 'Playeras (Alumnos)', key: 'playeras', width: 20 }
    ];
    styleHeader(sheet2);
    stats.forEach(s => sheet2.addRow({ talla: s.talla, camisas: s.camisas.alumno, playeras: s.playeras.alumno }));

    // Sheet 3: Docentes
    const sheet3 = workbook.addWorksheet('Tallas por Docentes');
    sheet3.columns = [
      { header: 'Talla', key: 'talla', width: 15 },
      { header: 'Camisas (Docentes)', key: 'camisas', width: 20 },
      { header: 'Playeras (Docentes)', key: 'playeras', width: 20 }
    ];
    styleHeader(sheet3);
    stats.forEach(s => sheet3.addRow({ talla: s.talla, camisas: s.camisas.docente, playeras: s.playeras.docente }));

    const buffer = await workbook.xlsx.writeBuffer();
    return new Response(buffer as ArrayBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="tallas.xlsx"',
      },
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
