import { z } from "zod";

// --- Validación de matrícula ---
// Formato: GGEE#### donde GG=generación, EE=siempre "10", ####=ID único
export const matriculaSchema = z
  .string()
  .length(8, "La matrícula debe tener exactamente 8 dígitos")
  .regex(/^\d{8}$/, "La matrícula solo debe contener números")
  .refine(
    (val) => val.substring(2, 4) === "10",
    "El formato de matrícula no es válido (posiciones 3-4 deben ser '10')"
  );

// --- Semestres válidos ---
export const SEMESTRES_VALIDOS = [1, 3, 5, 7, 9, 11, 13] as const;

// --- Tallas válidas ---
export const TALLAS_VALIDAS = ["CH", "M", "G", "XG", "XXG"] as const;

// --- Schema: Registro de alumno ---
export const registroAlumnoSchema = z.object({
  nombre: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no debe exceder 100 caracteres")
    .trim(),
  apellidoPaterno: z
    .string()
    .min(2, "El apellido paterno debe tener al menos 2 caracteres")
    .max(100, "El apellido paterno no debe exceder 100 caracteres")
    .trim(),
  apellidoMaterno: z
    .string()
    .max(100, "El apellido materno no debe exceder 100 caracteres")
    .trim()
    .optional()
    .or(z.literal("")),
  email: z
    .string()
    .email("El correo electrónico no tiene un formato válido")
    .max(200, "El correo no debe exceder 200 caracteres")
    .trim()
    .toLowerCase(),
  telefono: z
    .string()
    .min(10, "El teléfono debe tener al menos 10 dígitos")
    .max(15, "El teléfono no debe exceder 15 dígitos")
    .regex(/^[\d\s\-\+\(\)]+$/, "El teléfono solo debe contener números")
    .trim()
    .optional()
    .or(z.literal("")),
  matricula: matriculaSchema,
  semestre: z
    .number()
    .int()
    .refine(
      (val) => SEMESTRES_VALIDOS.includes(val as (typeof SEMESTRES_VALIDOS)[number]),
      "El semestre seleccionado no es válido"
    ),
  tallaCamisa: z.string().min(1, "Debes seleccionar una talla de camisa"),
  tallaPlayera: z.string().min(1, "Debes seleccionar una talla de playera"),
  requiereConstancia: z.boolean().default(false),
});

// --- Schema: Registro de docente ---
export const registroDocenteSchema = z.object({
  nombre: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no debe exceder 100 caracteres")
    .trim(),
  apellidoPaterno: z
    .string()
    .min(2, "El apellido paterno debe tener al menos 2 caracteres")
    .max(100, "El apellido paterno no debe exceder 100 caracteres")
    .trim(),
  apellidoMaterno: z
    .string()
    .max(100, "El apellido materno no debe exceder 100 caracteres")
    .trim()
    .optional()
    .or(z.literal("")),
  email: z
    .string()
    .email("El correo electrónico no tiene un formato válido")
    .max(200, "El correo no debe exceder 200 caracteres")
    .trim()
    .toLowerCase(),
  telefono: z
    .string()
    .min(10, "El teléfono debe tener al menos 10 dígitos")
    .max(15, "El teléfono no debe exceder 15 dígitos")
    .regex(/^[\d\s\-\+\(\)]+$/, "El teléfono solo debe contener números")
    .trim()
    .optional()
    .or(z.literal("")),
  numeroEmpleado: z
    .string()
    .max(20, "El número de empleado no debe exceder 20 caracteres")
    .trim()
    .optional()
    .or(z.literal("")),
  departamento: z
    .string()
    .min(2, "El departamento debe tener al menos 2 caracteres")
    .max(200, "El departamento no debe exceder 200 caracteres")
    .trim(),
  academia: z
    .string()
    .max(200, "La academia no debe exceder 200 caracteres")
    .trim()
    .optional()
    .or(z.literal("")),
  tallaCamisa: z.string().min(1, "Debes seleccionar una talla de camisa"),
  tallaPlayera: z.string().min(1, "Debes seleccionar una talla de playera"),
  requiereConstancia: z.boolean().default(false),
});

// --- Schema: Login ---
export const loginSchema = z.object({
  usuario: z.string().min(1, "El usuario es requerido").trim(),
  password: z.string().min(1, "La contraseña es requerida"),
});

// --- Schema: Actualización de participante (admin) ---
export const updateParticipanteSchema = z.object({
  nombre: z.string().min(2).max(100).trim().optional(),
  apellidoPaterno: z.string().min(2).max(100).trim().optional(),
  apellidoMaterno: z.string().max(100).trim().optional(),
  email: z.string().email().max(200).trim().toLowerCase().optional(),
  telefono: z.string().max(15).trim().optional(),
  tallaCamisa: z.string().optional(),
  tallaPlayera: z.string().optional(),
  requiereConstancia: z.boolean().optional(),
  estadoRegistro: z
    .enum(["pendiente", "confirmado", "cancelado"])
    .optional(),
  // Campos de alumno
  matricula: z.string().optional(),
  semestre: z.number().int().optional(),
  // Campos de docente
  numeroEmpleado: z.string().optional(),
  departamento: z.string().optional(),
  academia: z.string().optional(),
});

export type RegistroAlumnoInput = z.infer<typeof registroAlumnoSchema>;
export type RegistroDocenteInput = z.infer<typeof registroDocenteSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateParticipanteInput = z.infer<typeof updateParticipanteSchema>;
