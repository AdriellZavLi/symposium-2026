export interface TallaOption {
  id: number;
  nombre: string;
  orden: number;
}

export interface ParticipanteResumen {
  id: number;
  tipo: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string | null;
  email: string;
  telefono: string | null;
  tallaCamisa: string | null;
  tallaPlayera: string | null;
  requiereConstancia: boolean;
  estadoRegistro: string;
  createdAt: string;
  // Alumno fields
  matricula?: string;
  semestre?: number;
  carrera?: string;
  // Docente fields
  numeroEmpleado?: string;
  departamento?: string;
  academia?: string;
}

export interface Estadisticas {
  totalRegistrados: number;
  totalAlumnos: number;
  totalDocentes: number;
  pendientes: number;
  confirmados: number;
  cancelados: number;
  porSemestre: { semestre: number; cantidad: number }[];
  tallasCamisa: { talla: string; cantidad: number }[];
  tallasPlayera: { talla: string; cantidad: number }[];
}

export interface EstadisticasTallas {
  resumen: {
    talla: string;
    camisas: number;
    playeras: number;
  }[];
  porTipo: {
    alumnos: { talla: string; camisas: number; playeras: number }[];
    docentes: { talla: string; camisas: number; playeras: number }[];
  };
  totales: {
    camisas: number;
    playeras: number;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ConfiguracionPublica {
  evento_nombre: string;
  evento_tematica: string;
  evento_fecha: string;
  evento_lugar: string;
  evento_descripcion: string;
  registro_abierto: boolean;
}

export interface ApiError {
  error: string;
  details?: Record<string, string[]>;
}

export interface ApiSuccess {
  message: string;
  data?: unknown;
}
