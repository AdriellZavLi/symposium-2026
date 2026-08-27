"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Participantes() {
  const router = useRouter();
  const [participantes, setParticipantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('Todos');
  const [filtroEstado, setFiltroEstado] = useState('Todos');

  useEffect(() => {
    fetchParticipantes();
  }, []);

  const fetchParticipantes = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/participantes?limit=100');
      if (res.status === 401) {
        router.push('/admin/login');
        return;
      }
      const data = await res.json();
      setParticipantes(data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este registro?')) return;
    try {
      const res = await fetch(`/api/admin/participantes/${id}`, { method: 'DELETE' });
      if (res.ok) fetchParticipantes();
    } catch (error) {
      console.error(error);
    }
  };

  const handleToggleEstado = async (id: string, currentEstado: string) => {
    const newEstado = currentEstado === 'pendiente' ? 'confirmado' : 'pendiente';
    try {
      const res = await fetch(`/api/admin/participantes/${id}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: newEstado })
      });
      if (res.ok) fetchParticipantes();
    } catch (error) {
      console.error(error);
    }
  };

  const getEstadoBadge = (estado: string) => {
    if (estado === 'confirmado') return <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-xs font-semibold">Confirmado</span>;
    if (estado === 'cancelado') return <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-semibold">Cancelado</span>;
    return <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-semibold">Pendiente</span>;
  };

  const filtered = participantes.filter((p: any) => {
    const searchLower = searchTerm.toLowerCase();
    const matchSearch = p.nombre.toLowerCase().includes(searchLower) || 
                        p.email.toLowerCase().includes(searchLower) ||
                        (p.matricula || p.numeroEmpleado || '').includes(searchTerm);
    const matchTipo = filtroTipo === 'Todos' || p.tipo === filtroTipo.toLowerCase();
    const matchEstado = filtroEstado === 'Todos' || p.estadoRegistro === filtroEstado.toLowerCase();
    
    return matchSearch && matchTipo && matchEstado;
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link href="/admin/dashboard" className="text-indigo-600 hover:underline text-sm mb-2 inline-block">&larr; Volver al Dashboard</Link>
          <h1 className="text-2xl font-bold text-slate-900">Participantes</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={() => window.location.href='/api/admin/exportar/registros'} className="bg-indigo-50 border border-indigo-200 text-indigo-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-100">
            Exportar Registros
          </button>
          <button onClick={() => window.location.href='/api/admin/exportar/tallas'} className="bg-indigo-50 border border-indigo-200 text-indigo-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-100">
            Exportar Tallas
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-wrap gap-4">
        <input 
          type="text" 
          placeholder="Buscar por nombre, correo, matrícula..." 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="flex-grow p-2 border rounded-md text-sm outline-none focus:border-indigo-500"
        />
        <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)} className="p-2 border rounded-md text-sm outline-none">
          <option>Todos</option>
          <option>Alumno</option>
          <option>Docente</option>
        </select>
        <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)} className="p-2 border rounded-md text-sm outline-none">
          <option>Todos</option>
          <option>Pendiente</option>
          <option>Confirmado</option>
          <option>Cancelado</option>
        </select>
        <button onClick={() => { setSearchTerm(''); setFiltroTipo('Todos'); setFiltroEstado('Todos'); }} className="text-slate-500 text-sm hover:text-slate-700">Limpiar</button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-3 font-semibold text-slate-700">Nombre</th>
              <th className="p-3 font-semibold text-slate-700">Matrícula/No.Emp</th>
              <th className="p-3 font-semibold text-slate-700">Tipo</th>
              <th className="p-3 font-semibold text-slate-700">Tallas (C/P)</th>
              <th className="p-3 font-semibold text-slate-700">Estado</th>
              <th className="p-3 font-semibold text-slate-700 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={6} className="p-8 text-center text-slate-500">Cargando participantes...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-slate-500">No se encontraron registros.</td></tr>
            ) : (
              filtered.map((p: any) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="p-3">
                    <div className="font-medium text-slate-900">{p.nombre} {p.apellidoPaterno}</div>
                    <div className="text-xs text-slate-500">{p.email}</div>
                  </td>
                  <td className="p-3 text-slate-600">{p.matricula || p.numeroEmpleado || '-'}</td>
                  <td className="p-3 capitalize text-slate-600">{p.tipo}</td>
                  <td className="p-3 text-slate-600">{p.tallaCamisa || '-'} / {p.tallaPlayera}</td>
                  <td className="p-3">{getEstadoBadge(p.estadoRegistro)}</td>
                  <td className="p-3 text-right">
                    <button onClick={() => handleToggleEstado(p.id, p.estadoRegistro)} className="text-indigo-600 hover:text-indigo-900 mr-3">
                      {p.estadoRegistro === 'confirmado' ? 'Pendiente' : 'Confirmar'}
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:text-red-700">Eliminar</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
