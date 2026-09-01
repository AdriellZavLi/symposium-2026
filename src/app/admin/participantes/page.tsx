"use client";
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface ParticipanteItem {
  id: number;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  email: string;
  telefono: string;
  tipo: string;
  estadoRegistro: string;
  requiereConstancia: boolean;
  tallaPlayera: string;
  tallaCamisa: string;
  createdAt: string;
  matricula: string;
  semestre: number | null;
  carrera: string;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function Participantes() {
  const router = useRouter();
  const [participantes, setParticipantes] = useState<ParticipanteItem[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ total: 0, page: 1, limit: 50, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('Todos');
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [filtroSemestre, setFiltroSemestre] = useState('Todos');

  const fetchParticipantes = useCallback(async (currentPage = page) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set('page', currentPage.toString());
      params.set('limit', '50');
      if (searchTerm.trim()) params.set('buscar', searchTerm.trim());
      if (filtroTipo !== 'Todos') params.set('tipo', filtroTipo);
      if (filtroEstado !== 'Todos') params.set('estado', filtroEstado);
      if (filtroSemestre !== 'Todos') params.set('semestre', filtroSemestre);

      const res = await fetch(`/api/admin/participantes?${params.toString()}`);
      if (res.status === 401) {
        router.push('/admin/login');
        return;
      }
      const data = await res.json();
      setParticipantes(data.data || []);
      if (data.meta) setMeta(data.meta);
    } catch (error) {
      console.error('Error fetching participantes:', error);
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, filtroTipo, filtroEstado, filtroSemestre, router]);

  useEffect(() => {
    fetchParticipantes(page);
  }, [page, filtroTipo, filtroEstado, filtroSemestre, fetchParticipantes]);

  // Debounced search on search term change
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchParticipantes(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este registro?')) return;
    try {
      const res = await fetch(`/api/admin/participantes/${id}`, { method: 'DELETE' });
      if (res.ok) fetchParticipantes(page);
    } catch (error) {
      console.error(error);
    }
  };

  const handleToggleEstado = async (id: number, currentEstado: string) => {
    const newEstado = currentEstado === 'confirmado' ? 'pendiente' : 'confirmado';
    try {
      const res = await fetch(`/api/admin/participantes/${id}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: newEstado })
      });
      if (res.ok) fetchParticipantes(page);
    } catch (error) {
      console.error(error);
    }
  };

  const getEstadoBadge = (estado: string) => {
    if (estado === 'confirmado') {
      return <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full text-xs font-semibold border border-emerald-200">Confirmado</span>;
    }
    if (estado === 'cancelado') {
      return <span className="bg-red-100 text-red-800 px-2.5 py-0.5 rounded-full text-xs font-semibold border border-red-200">Cancelado</span>;
    }
    if (estado === 'sin_registrar') {
      return <span className="bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full text-xs font-semibold border border-slate-300">Sin Registrar</span>;
    }
    return <span className="bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full text-xs font-semibold border border-amber-200">Pendiente</span>;
  };

  const handleLimpiarFiltros = () => {
    setSearchTerm('');
    setFiltroTipo('Todos');
    setFiltroEstado('Todos');
    setFiltroSemestre('Todos');
    setPage(1);
  };

  const getExportUrl = (type: 'registros' | 'tallas') => {
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.set('buscar', searchTerm.trim());
    if (filtroTipo !== 'Todos') params.set('tipo', filtroTipo);
    if (filtroEstado !== 'Todos') params.set('estado', filtroEstado);
    if (filtroSemestre !== 'Todos') params.set('semestre', filtroSemestre);
    return `/api/admin/exportar/${type}?${params.toString()}`;
  };

  const startRecord = (meta.page - 1) * meta.limit + 1;
  const endRecord = Math.min(meta.page * meta.limit, meta.total);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <Link href="/admin/dashboard" className="text-indigo-600 hover:underline text-sm mb-1 inline-block font-medium">
            &larr; Volver al Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">Listado de Participantes</h1>
          <p className="text-slate-500 text-sm">
            {meta.total > 0 ? `Mostrando ${startRecord} - ${endRecord} de ${meta.total} participantes (50 por página)` : 'Cargando registros...'}
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href={getExportUrl('registros')}
            download="registros.xlsx"
            className="bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 shadow-sm transition-colors flex items-center gap-2"
          >
            📊 Exportar Registros
          </a>
          <a
            href={getExportUrl('tallas')}
            download="tallas.xlsx"
            className="bg-slate-800 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-700 shadow-sm transition-colors flex items-center gap-2"
          >
            👕 Exportar Tallas
          </a>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-wrap gap-3 items-center">
        <div className="flex-grow min-w-[240px]">
          <input 
            type="text" 
            placeholder="Buscar por nombre, apellidos, correo, matrícula..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full p-2.5 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500 uppercase">Tipo:</label>
          <select 
            value={filtroTipo} 
            onChange={e => { setFiltroTipo(e.target.value); setPage(1); }} 
            className="p-2 border rounded-lg text-sm outline-none bg-white"
          >
            <option value="Todos">Todos</option>
            <option value="alumno">Alumno</option>
            <option value="docente">Docente</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500 uppercase">Estado:</label>
          <select 
            value={filtroEstado} 
            onChange={e => { setFiltroEstado(e.target.value); setPage(1); }} 
            className="p-2 border rounded-lg text-sm outline-none bg-white"
          >
            <option value="Todos">Todos</option>
            <option value="sin_registrar">Sin Registrar</option>
            <option value="pendiente">Pendiente</option>
            <option value="confirmado">Confirmado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500 uppercase">Semestre:</label>
          <select 
            value={filtroSemestre} 
            onChange={e => { setFiltroSemestre(e.target.value); setPage(1); }} 
            className="p-2 border rounded-lg text-sm outline-none bg-white"
          >
            <option value="Todos">Todos</option>
            <option value="1">1° Semestre</option>
            <option value="3">3° Semestre</option>
            <option value="5">5° Semestre</option>
            <option value="7">7° Semestre</option>
            <option value="9">9° Semestre</option>
            <option value="11">11° Semestre</option>
            <option value="13">13° Semestre</option>
          </select>
        </div>

        <button 
          onClick={handleLimpiarFiltros}
          className="text-slate-500 hover:text-slate-800 text-sm font-medium px-2 py-1"
        >
          Limpiar filtros
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-3.5 font-semibold text-slate-700">Nombre</th>
                <th className="p-3.5 font-semibold text-slate-700">Matrícula</th>
                <th className="p-3.5 font-semibold text-slate-700">Semestre / Tipo</th>
                <th className="p-3.5 font-semibold text-slate-700">Contacto</th>
                <th className="p-3.5 font-semibold text-slate-700">Tallas (Playera / Camisa)</th>
                <th className="p-3.5 font-semibold text-slate-700">Estado</th>
                <th className="p-3.5 font-semibold text-slate-700 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-500">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent mb-2"></div>
                    <p>Cargando participantes...</p>
                  </td>
                </tr>
              ) : participantes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-500">
                    No se encontraron participantes con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                participantes.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-900">
                        {p.nombre} {p.apellidoPaterno} {p.apellidoMaterno || ''}
                      </div>
                    </td>
                    <td className="p-3.5 text-slate-700 font-mono">
                      {p.matricula || '-'}
                    </td>
                    <td className="p-3.5">
                      {p.tipo === 'alumno' ? (
                        <span className="text-slate-800 font-medium">
                          {p.semestre ? `${p.semestre}° Semestre` : 'Alumno'}
                        </span>
                      ) : (
                        <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded text-xs font-semibold">
                          Docente
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-xs text-slate-600">
                      <div>{p.email || <span className="text-slate-400 italic">Sin correo</span>}</div>
                      <div>{p.telefono || <span className="text-slate-400 italic">Sin teléfono</span>}</div>
                    </td>
                    <td className="p-3.5">
                      {p.tallaPlayera ? (
                        <span className="text-slate-800 font-semibold">
                          {p.tallaPlayera} <span className="text-slate-400 font-normal">/</span> {p.tallaCamisa || '-'}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-xs">Sin registrar</span>
                      )}
                    </td>
                    <td className="p-3.5">
                      {getEstadoBadge(p.estadoRegistro)}
                    </td>
                    <td className="p-3.5 text-right space-x-2 whitespace-nowrap">
                      {p.estadoRegistro !== 'sin_registrar' ? (
                        <button 
                          onClick={() => handleToggleEstado(p.id, p.estadoRegistro)} 
                          className="text-xs font-semibold px-2.5 py-1 rounded border border-indigo-200 text-indigo-700 hover:bg-indigo-50 transition-colors"
                        >
                          {p.estadoRegistro === 'confirmado' ? 'Marcar Pendiente' : 'Confirmar'}
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleToggleEstado(p.id, p.estadoRegistro)} 
                          className="text-xs font-semibold px-2.5 py-1 rounded border border-emerald-200 text-emerald-700 hover:bg-emerald-50 transition-colors"
                        >
                          Confirmar
                        </button>
                      )}
                      <button 
                        onClick={() => handleDelete(p.id)} 
                        className="text-xs font-semibold px-2.5 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {meta.totalPages > 1 && (
          <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-600">
              Página <strong>{meta.page}</strong> de <strong>{meta.totalPages}</strong> ({meta.total} total)
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={meta.page <= 1 || loading}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                &larr; Anterior
              </button>

              {Array.from({ length: meta.totalPages }, (_, i) => i + 1)
                .filter(pNum => pNum === 1 || pNum === meta.totalPages || Math.abs(pNum - meta.page) <= 2)
                .map((pNum, idx, arr) => {
                  const prev = arr[idx - 1];
                  const showEllipsis = prev && pNum - prev > 1;
                  return (
                    <span key={pNum} className="flex items-center">
                      {showEllipsis && <span className="px-1 text-slate-400">...</span>}
                      <button
                        onClick={() => setPage(pNum)}
                        disabled={loading}
                        className={`min-w-[32px] h-8 px-2 rounded-lg text-xs font-semibold transition-colors ${
                          pNum === meta.page
                            ? 'bg-indigo-600 text-white'
                            : 'border border-slate-300 text-slate-700 hover:bg-white'
                        }`}
                      >
                        {pNum}
                      </button>
                    </span>
                  );
                })}

              <button
                onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                disabled={meta.page >= meta.totalPages || loading}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Siguiente &rarr;
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
