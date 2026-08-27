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

    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get('tipo');
    const semestre = searchParams.get('semestre');
    const talla_playera = searchParams.get('talla_playera');
    const talla_camisa = searchParams.get('talla_camisa');
    const estado = searchParams.get('estado');
    const buscar = searchParams.get('buscar');

    const where: any = {};
    if (tipo) where.tipo = tipo;
    if (estado) where.estadoRegistro = estado;
    if (talla_playera) where.tallaPlayera = { nombre: talla_playera };
    if (talla_camisa) where.tallaCamisa = { nombre: talla_camisa };
    if (semestre) where.alumno = { semestre: parseInt(semestre) };
    if (buscar) {
      where.OR = [
        { nombre: { contains: buscar } },
        { apellidoPaterno: { contains: buscar } },
        { apellidoMaterno: { contains: buscar } },
        { email: { contains: buscar } },
        { alumno: { matricula: { contains: buscar } } }
      ];
    }

    const participantes = await prisma.participante.findMany({
      where,
      include: {
        alumno: true,
        docente: true,
        tallaPlayera: true,
        tallaCamisa: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Registros');

    sheet.columns = [
      { header: 'Nombre Completo', key: 'nombre', width: 30 },
      { header: 'Matrícula', key: 'matricula', width: 15 },
      { header: 'Correo', key: 'correo', width: 25 },
      { header: 'Teléfono', key: 'telefono', width: 15 },
      { header: 'Carrera', key: 'carrera', width: 35 },
      { header: 'Semestre', key: 'semestre', width: 10 },
      { header: 'Tipo', key: 'tipo', width: 15 },
      { header: 'Talla Camisa', key: 'tallaCamisa', width: 15 },
      { header: 'Talla Playera', key: 'tallaPlayera', width: 15 },
      { header: 'Constancia', key: 'constancia', width: 15 },
      { header: 'Estado', key: 'estado', width: 15 }
    ];

    sheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
    });

    participantes.forEach(p => {
      sheet.addRow({
        nombre: `${p.nombre} ${p.apellidoPaterno} ${p.apellidoMaterno}`,
        matricula: p.alumno?.matricula || 'N/A',
        correo: p.email,
        telefono: p.telefono,
        carrera: p.alumno?.carrera || 'N/A',
        semestre: p.alumno?.semestre || 'N/A',
        tipo: p.tipo,
        tallaCamisa: p.tallaCamisa?.nombre || 'N/A',
        tallaPlayera: p.tallaPlayera?.nombre || 'N/A',
        constancia: p.requiereConstancia ? 'Sí' : 'No',
        estado: p.estadoRegistro
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return new Response(buffer as ArrayBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="registros.xlsx"',
      },
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
