-- CreateTable
CREATE TABLE "participantes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tipo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido_paterno" TEXT NOT NULL,
    "apellido_materno" TEXT,
    "email" TEXT NOT NULL,
    "telefono" TEXT,
    "talla_camisa_id" INTEGER,
    "talla_playera_id" INTEGER,
    "requiere_constancia" BOOLEAN NOT NULL DEFAULT false,
    "estado_registro" TEXT NOT NULL DEFAULT 'pendiente',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "participantes_talla_camisa_id_fkey" FOREIGN KEY ("talla_camisa_id") REFERENCES "tallas" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "participantes_talla_playera_id_fkey" FOREIGN KEY ("talla_playera_id") REFERENCES "tallas" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "alumnos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "participante_id" INTEGER NOT NULL,
    "matricula" TEXT NOT NULL,
    "carrera" TEXT NOT NULL DEFAULT 'Ingeniería en Sistemas Computacionales',
    "semestre" INTEGER NOT NULL,
    CONSTRAINT "alumnos_participante_id_fkey" FOREIGN KEY ("participante_id") REFERENCES "participantes" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "docentes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "participante_id" INTEGER NOT NULL,
    "numero_empleado" TEXT,
    "departamento" TEXT NOT NULL,
    "academia" TEXT,
    CONSTRAINT "docentes_participante_id_fkey" FOREIGN KEY ("participante_id") REFERENCES "participantes" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "tallas" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "orden" INTEGER NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "administradores" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "usuario" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "rol" TEXT NOT NULL DEFAULT 'lider_generacion',
    "semestre" INTEGER,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "configuracion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "clave" TEXT NOT NULL,
    "valor" TEXT NOT NULL,
    "descripcion" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "participantes_email_key" ON "participantes"("email");

-- CreateIndex
CREATE INDEX "participantes_tipo_idx" ON "participantes"("tipo");

-- CreateIndex
CREATE INDEX "participantes_estado_registro_idx" ON "participantes"("estado_registro");

-- CreateIndex
CREATE UNIQUE INDEX "alumnos_participante_id_key" ON "alumnos"("participante_id");

-- CreateIndex
CREATE UNIQUE INDEX "alumnos_matricula_key" ON "alumnos"("matricula");

-- CreateIndex
CREATE INDEX "alumnos_semestre_idx" ON "alumnos"("semestre");

-- CreateIndex
CREATE UNIQUE INDEX "docentes_participante_id_key" ON "docentes"("participante_id");

-- CreateIndex
CREATE UNIQUE INDEX "tallas_nombre_key" ON "tallas"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "administradores_usuario_key" ON "administradores"("usuario");

-- CreateIndex
CREATE UNIQUE INDEX "configuracion_clave_key" ON "configuracion"("clave");
