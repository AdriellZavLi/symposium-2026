"use client";
import { useState } from 'react';

export default function ConsultaRegistro() {
  const [query, setQuery] = useState('');
  const [tipoBusqueda, setTipoBusqueda] = useState('matricula');
  const [resultado, setResultado] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    setError('');
    setResultado(null);
    
    try {
      const paramName = tipoBusqueda === 'correo' ? 'email' : 'matricula';
      const res = await fetch(`/api/registro/consulta?${paramName}=${encodeURIComponent(query)}`);
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || "No se encontró el registro.");
      } else {
        setResultado(data);
      }
    } catch (err) {
      setError("Error de conexión.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (estado: string) => {
    if (estado === 'confirmado') return <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-semibold border border-emerald-200">Confirmado</span>;
    if (estado === 'cancelado') return <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold border border-red-200">Cancelado</span>;
    return <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-semibold border border-amber-200">Pendiente</span>;
  };

  return (
    <div className="max-w-2xl mx-auto p-4 py-12">
      <h1 className="text-3xl font-bold text-center text-slate-900 mb-8">Consulta tu Registro</h1>
      
      <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 mb-8">
        <form onSubmit={handleSearch}>
          <div className="flex gap-4 mb-4">
            <label className="flex items-center">
              <input type="radio" checked={tipoBusqueda === 'matricula'} onChange={() => setTipoBusqueda('matricula')} className="mr-2 text-indigo-600 focus:ring-indigo-500" />
              Matrícula
            </label>
            <label className="flex items-center">
              <input type="radio" checked={tipoBusqueda === 'correo'} onChange={() => setTipoBusqueda('correo')} className="mr-2 text-indigo-600 focus:ring-indigo-500" />
              Correo Electrónico
            </label>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <input 
              type="text" 
              value={query} 
              onChange={e => setQuery(e.target.value)} 
              placeholder={tipoBusqueda === 'matricula' ? 'Ingresa tu matrícula' : 'Ingresa tu correo'} 
              className="flex-grow p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              required
            />
            <button 
              type="submit" 
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? "Buscando..." : "Buscar"}
            </button>
          </div>
        </form>
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-sm text-center">
          {error}
        </div>
      )}
      
      {resultado && (
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 border-b p-4 flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-800">Detalles del Registro</h2>
            {getStatusBadge(resultado.estadoRegistro)}
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
              <div>
                <p className="text-sm text-slate-500">Nombre Completo</p>
                <p className="font-medium text-slate-900">{resultado.nombre} {resultado.apellidoPaterno} {resultado.apellidoMaterno}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Correo Electrónico</p>
                <p className="font-medium text-slate-900">{resultado.email}</p>
              </div>
              {resultado.tipo === 'alumno' ? (
                <>
                  <div>
                    <p className="text-sm text-slate-500">Matrícula</p>
                    <p className="font-medium text-slate-900">{resultado.alumno?.matricula}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Semestre</p>
                    <p className="font-medium text-slate-900">{resultado.alumno?.semestre}</p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p className="text-sm text-slate-500">Departamento</p>
                    <p className="font-medium text-slate-900">{resultado.docente?.departamento}</p>
                  </div>
                  {resultado.docente?.numeroEmpleado && (
                    <div>
                      <p className="text-sm text-slate-500">No. Empleado</p>
                      <p className="font-medium text-slate-900">{resultado.docente.numeroEmpleado}</p>
                    </div>
                  )}
                </>
              )}
              <div>
                <p className="text-sm text-slate-500">Talla Camisa</p>
                <p className="font-medium text-slate-900">{resultado.tallaCamisa}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Talla Playera</p>
                <p className="font-medium text-slate-900">{resultado.tallaPlayera}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
