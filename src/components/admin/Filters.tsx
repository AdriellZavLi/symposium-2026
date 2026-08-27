"use client";

import { SEMESTRES_VALIDOS } from "@/lib/validations";

interface FiltersType {
  tipo: string;
  semestre: string;
  estado: string;
  tallaPlayera: string;
  tallaCamisa: string;
  buscar: string;
}

interface FiltersProps {
  filters: FiltersType;
  onChange: (f: FiltersType) => void;
  tallas: string[];
}

export default function Filters({ filters, onChange, tallas }: FiltersProps) {
  
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange({ ...filters, [name]: value });
  };

  const handleClear = () => {
    onChange({
      tipo: "",
      semestre: "",
      estado: "",
      tallaPlayera: "",
      tallaCamisa: "",
      buscar: ""
    });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 mb-6 space-y-4">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="text-slate-400">🔍</span>
        </div>
        <input
          type="text"
          name="buscar"
          value={filters.buscar}
          onChange={handleChange}
          className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md leading-5 bg-white placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Buscar por nombre, matrícula o empleado..."
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <select
          name="tipo"
          value={filters.tipo}
          onChange={handleChange}
          className="block w-full py-2 px-3 border border-slate-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="">Tipo (Todos)</option>
          <option value="ALUMNO">Alumno</option>
          <option value="DOCENTE">Docente</option>
        </select>

        <select
          name="estado"
          value={filters.estado}
          onChange={handleChange}
          className="block w-full py-2 px-3 border border-slate-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="">Estado (Todos)</option>
          <option value="pendiente">Pendiente</option>
          <option value="confirmado">Confirmado</option>
          <option value="cancelado">Cancelado</option>
        </select>

        <select
          name="semestre"
          value={filters.semestre}
          onChange={handleChange}
          disabled={filters.tipo === 'DOCENTE'}
          className="block w-full py-2 px-3 border border-slate-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-slate-100"
        >
          <option value="">Semestre (Todos)</option>
          {SEMESTRES_VALIDOS.map(s => (
            <option key={s} value={s.toString()}>{s}</option>
          ))}
        </select>

        <select
          name="tallaPlayera"
          value={filters.tallaPlayera}
          onChange={handleChange}
          className="block w-full py-2 px-3 border border-slate-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="">Talla Playera</option>
          {tallas.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <select
          name="tallaCamisa"
          value={filters.tallaCamisa}
          onChange={handleChange}
          className="block w-full py-2 px-3 border border-slate-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="">Talla Camisa</option>
          {tallas.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <button
          onClick={handleClear}
          className="w-full flex items-center justify-center px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Limpiar filtros
        </button>
      </div>
    </div>
  );
}
