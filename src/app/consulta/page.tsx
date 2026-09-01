"use client";
import { useState } from 'react';
import Link from 'next/link';

export default function ConsultaRegistro() {
  const [query, setQuery] = useState('');
  const [tipoBusqueda, setTipoBusqueda] = useState<'matricula' | 'correo'>('matricula');
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
      const res = await fetch(`/api/registro/consulta?${paramName}=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || "No se encontró el registro.");
      } else {
        setResultado(data);
      }
    } catch {
      setError("Error de conexión al servidor.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (estado: string) => {
    if (estado === 'confirmado') {
      return <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-semibold border border-emerald-200">Confirmado</span>;
    }
    if (estado === 'cancelado') {
      return <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold border border-red-200">Cancelado</span>;
    }
    if (estado === 'sin_registrar') {
      return <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm font-semibold border border-slate-300">Pendiente de selección de talla</span>;
    }
    return <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-semibold border border-amber-200">Pendiente</span>;
  };

  return (
    <div className="max-w-2xl mx-auto p-4 py-12">
      <Link href="/" className="text-indigo-600 hover:text-indigo-800 font-medium mb-6 inline-block">
        &larr; Volver al inicio
      </Link>

      <h1 className="text-3xl font-bold text-center text-slate-900 mb-2">Consulta tu Registro</h1>
      <p className="text-slate-500 text-center mb-8">Verifica el estatus de tu participación en el Symposium 2026</p>
      
      <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 mb-8">
        <form onSubmit={handleSearch}>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-slate-700 mb-2">¿Cómo deseas buscar?</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${tipoBusqueda === 'matricula' ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-medium' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                <input
                  type="radio"
                  name="tipoBusqueda"
                  checked={tipoBusqueda === 'matricula'}
                  onChange={() => { setTipoBusqueda('matricula'); setQuery(''); setError(''); setResultado(null); }}
                  className="mr-2 text-indigo-600 focus:ring-indigo-500"
                />
                🎓 Alumno (Por Matrícula)
              </label>
              
              <label className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${tipoBusqueda === 'correo' ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-medium' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                <input
                  type="radio"
                  name="tipoBusqueda"
                  checked={tipoBusqueda === 'correo'}
                  onChange={() => { setTipoBusqueda('correo'); setQuery(''); setError(''); setResultado(null); }}
                  className="mr-2 text-indigo-600 focus:ring-indigo-500"
                />
                👨‍🏫 Docente (Por Correo)
              </label>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-grow">
              <input 
                type={tipoBusqueda === 'correo' ? 'email' : 'text'}
                value={query} 
                onChange={e => setQuery(e.target.value)} 
                placeholder={tipoBusqueda === 'matricula' ? 'Ingresa tu número de control (ej. 23100225)' : 'Ingresa tu correo institucional'} 
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                required
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? "Buscando..." : "Buscar"}
            </button>
          </div>
        </form>
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-sm text-center mb-6">
          {error}
        </div>
      )}
      
      {resultado && (
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 border-b p-4 flex flex-wrap justify-between items-center gap-2">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full mr-2">
                {resultado.tipo === 'alumno' ? 'Estudiante' : 'Docente'}
              </span>
              <h2 className="text-xl font-bold text-slate-800 inline">Detalles del Registro</h2>
            </div>
            {getStatusBadge(resultado.estadoRegistro)}
          </div>

          <div className="p-6">
            {resultado.estadoRegistro === 'sin_registrar' ? (
              <div className="text-center py-4">
                <p className="text-slate-700 mb-3">
                  Hola <strong>{resultado.nombre}</strong>, estás en la lista pero aún no has seleccionado tus tallas.
                </p>
                <Link
                  href="/registro/alumno"
                  className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                >
                  Completar mi registro ahora &rarr;
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm">
                <div>
                  <p className="text-slate-500">Nombre Completo</p>
                  <p className="font-semibold text-slate-900 text-base">{resultado.nombre} {resultado.apellidoPaterno} {resultado.apellidoMaterno || ''}</p>
                </div>

                {resultado.email && (
                  <div>
                    <p className="text-slate-500">Correo Electrónico</p>
                    <p className="font-medium text-slate-900">{resultado.email}</p>
                  </div>
                )}

                {resultado.telefono && (
                  <div>
                    <p className="text-slate-500">Teléfono</p>
                    <p className="font-medium text-slate-900">{resultado.telefono}</p>
                  </div>
                )}

                {resultado.tipo === 'alumno' && resultado.alumno && (
                  <>
                    <div>
                      <p className="text-slate-500">Número de Control</p>
                      <p className="font-medium text-slate-900">{resultado.alumno.matricula}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Semestre</p>
                      <p className="font-medium text-slate-900">{resultado.alumno.semestre}° Semestre</p>
                    </div>
                  </>
                )}

                <div>
                  <p className="text-slate-500">Talla de Playera</p>
                  <p className="font-semibold text-indigo-600">{resultado.tallaPlayera || 'No asignada'}</p>
                </div>

                <div>
                  <p className="text-slate-500">Talla de Camisa</p>
                  <p className="font-semibold text-indigo-600">{resultado.tallaCamisa || 'Sin camisa'}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
