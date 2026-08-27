import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // --- Tallas ---
  const tallas = [
    { nombre: "CH", orden: 1 },
    { nombre: "M", orden: 2 },
    { nombre: "G", orden: 3 },
    { nombre: "XG", orden: 4 },
    { nombre: "XXG", orden: 5 },
  ];

  for (const talla of tallas) {
    await prisma.talla.upsert({
      where: { nombre: talla.nombre },
      update: {},
      create: talla,
    });
  }
  console.log("  ✅ Tallas creadas");

  // --- Administradores ---
  const admins = [
    {
      usuario: "admin",
      password: "Symposium2026!",
      nombre: "Administrador General",
      rol: "super_admin",
      semestre: null,
    },
    {
      usuario: "lider1",
      password: "Lider1_2026",
      nombre: "Líder 1° Semestre",
      rol: "lider_generacion",
      semestre: 1,
    },
    {
      usuario: "lider3",
      password: "Lider3_2026",
      nombre: "Líder 3° Semestre",
      rol: "lider_generacion",
      semestre: 3,
    },
    {
      usuario: "lider5",
      password: "Lider5_2026",
      nombre: "Líder 5° Semestre",
      rol: "lider_generacion",
      semestre: 5,
    },
    {
      usuario: "lider7",
      password: "Lider7_2026",
      nombre: "Líder 7° Semestre",
      rol: "lider_generacion",
      semestre: 7,
    },
    {
      usuario: "lider9",
      password: "Lider9_2026",
      nombre: "Líder 9° Semestre",
      rol: "lider_generacion",
      semestre: 9,
    },
  ];

  for (const admin of admins) {
    const hash = await bcrypt.hash(admin.password, 12);
    await prisma.administrador.upsert({
      where: { usuario: admin.usuario },
      update: {},
      create: {
        usuario: admin.usuario,
        passwordHash: hash,
        nombre: admin.nombre,
        rol: admin.rol,
        semestre: admin.semestre,
      },
    });
  }
  console.log("  ✅ Administradores creados");

  // --- Configuración ---
  const configs = [
    {
      clave: "evento_nombre",
      valor: "Symposium 2026",
      descripcion: "Nombre del evento",
    },
    {
      clave: "evento_tematica",
      valor: "Synectis — Diseñando el Mañana",
      descripcion: "Temática del evento",
    },
    {
      clave: "evento_fecha",
      valor: "Por definir",
      descripcion: "Fecha del evento",
    },
    {
      clave: "evento_lugar",
      valor: "Por definir",
      descripcion: "Lugar del evento",
    },
    {
      clave: "evento_descripcion",
      valor: "Congreso anual de Ingeniería en Sistemas Computacionales.",
      descripcion: "Descripción breve del evento",
    },
    {
      clave: "registro_abierto",
      valor: "1",
      descripcion: "Si el registro está abierto (1) o cerrado (0)",
    },
  ];

  for (const config of configs) {
    await prisma.configuracion.upsert({
      where: { clave: config.clave },
      update: {},
      create: config,
    });
  }
  console.log("  ✅ Configuración creada");

  // --- Datos de prueba (50+ registros) ---
  const nombresHombre = [
    "Carlos", "Miguel", "José", "Juan", "Luis", "Pedro", "Daniel",
    "Andrés", "Diego", "Fernando", "Roberto", "Ricardo", "Eduardo",
    "Alejandro", "Francisco", "Javier", "Sergio", "Raúl", "Manuel", "Arturo",
  ];
  const nombresMujer = [
    "María", "Ana", "Laura", "Carmen", "Sofía", "Valentina", "Gabriela",
    "Fernanda", "Daniela", "Mariana", "Paola", "Andrea", "Lucía",
    "Isabella", "Camila", "Natalia", "Diana", "Karla", "Vanessa", "Regina",
  ];
  const apellidos = [
    "García", "Hernández", "López", "Martínez", "González", "Rodríguez",
    "Pérez", "Sánchez", "Ramírez", "Torres", "Flores", "Rivera",
    "Gómez", "Díaz", "Cruz", "Morales", "Reyes", "Gutiérrez", "Ortiz", "Ruiz",
  ];
  const semestres = [1, 3, 5, 7, 9];
  const tallasNombres = ["CH", "M", "G", "XG", "XXG"];
  const generaciones: Record<number, string> = { 1: "26", 3: "25", 5: "24", 7: "23", 9: "22" };

  const allTallas = await prisma.talla.findMany();
  const tallaMap = Object.fromEntries(allTallas.map((t) => [t.nombre, t.id]));

  for (let i = 0; i < 55; i++) {
    const esMujer = i % 2 === 0;
    const nombres = esMujer ? nombresMujer : nombresHombre;
    const nombre = nombres[i % nombres.length];
    const ap = apellidos[i % apellidos.length];
    const am = apellidos[(i + 7) % apellidos.length];
    const sem = semestres[i % semestres.length];
    const gen = generaciones[sem];
    const idUnico = String(i + 1).padStart(4, "0");
    const matricula = `${gen}10${idUnico}`;
    const email = `al${matricula}@example.edu.mx`;
    const tallaCamisa = tallasNombres[i % tallasNombres.length];
    const tallaPlayera = tallasNombres[(i + 2) % tallasNombres.length];

    try {
      await prisma.participante.create({
        data: {
          tipo: "alumno",
          nombre,
          apellidoPaterno: ap,
          apellidoMaterno: am,
          email,
          telefono: `961${String(1000000 + i).slice(0, 7)}`,
          tallaCamisaId: tallaMap[tallaCamisa],
          tallaPlayeraId: tallaMap[tallaPlayera],
          requiereConstancia: i % 3 === 0,
          estadoRegistro: i % 5 === 0 ? "pendiente" : "confirmado",
          alumno: {
            create: {
              matricula,
              semestre: sem,
            },
          },
        },
      });
    } catch {
      // Skip duplicates
    }
  }
  console.log("  ✅ 55 alumnos de prueba creados");

  // Docentes de prueba
  const deptos = [
    "Sistemas Computacionales",
    "Ciencias Básicas",
    "Desarrollo Académico",
  ];
  for (let i = 0; i < 5; i++) {
    const nombre = nombresHombre[i + 10];
    const ap = apellidos[i + 10];
    const email = `docente${i + 1}@example.edu.mx`;
    try {
      await prisma.participante.create({
        data: {
          tipo: "docente",
          nombre,
          apellidoPaterno: ap,
          apellidoMaterno: apellidos[i + 12],
          email,
          telefono: `961${String(2000000 + i).slice(0, 7)}`,
          tallaCamisaId: tallaMap[tallasNombres[i % tallasNombres.length]],
          tallaPlayeraId: tallaMap[tallasNombres[(i + 1) % tallasNombres.length]],
          requiereConstancia: true,
          estadoRegistro: "confirmado",
          docente: {
            create: {
              numeroEmpleado: `EMP${String(i + 1).padStart(4, "0")}`,
              departamento: deptos[i % deptos.length],
              academia: "Ingeniería en Sistemas Computacionales",
            },
          },
        },
      });
    } catch {
      // Skip duplicates
    }
  }
  console.log("  ✅ 5 docentes de prueba creados");
  console.log("🎉 Seed completado!");
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
