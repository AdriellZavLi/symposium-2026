"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface AlumnoInfo {
  matricula: string;
  semestre: number;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string | null;
}

export default function RegistroAlumno() {
  const router = useRouter();
  const [tallas, setTallas] = useState<{id: number, nombre: string}[]>([]);
  const [step, setStep] = useState<'buscar' | 'talla'>('buscar');
  const [matricula, setMatricula] = useState('');
  const [alumnoInfo, setAlumnoInfo] = useState<AlumnoInfo | null>(null);
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [tallaPlayera, setTallaPlayera] = useState('');
  const [tallaCamisa, setTallaCamisa] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [yaRegistrado, setYaRegistrado] = useState(false);

  useEffect(() => {
    fetch('/api/tallas')
      .then(res => res.json())
      .then(data => setTallas(data))
      .catch(() => setTallas([]));
  }, []);

  const handleBuscar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matricula.trim()) return;

    setLoading(true);
    setError('');
    setFieldErrors({});
    setYaRegistrado(false);

    try {
      const res = await fetch(`/api/registro/buscar?matricula=${encodeURIComponent(matricula.trim())}`);
      const data = await res.json();

      if (res.status === 409) {
        setError(data.error);
        setYaRegistrado(true);
      } else if (!res.ok) {
        setError(data.error || 'No se encontró el número de control.');
      } else {
        setAlumnoInfo(data);
        setStep('talla');
      }
    } catch {
      setError('Error de conexión.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegistrar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    const newErrors: Record<string, string> = {};
    if (!email.trim()) newErrors.email = 'El correo electrónico es obligatorio';
    if (!telefono.trim()) newErrors.telefono = 'El teléfono es obligatorio';
    if (!tallaPlayera) newErrors.tallaPlayera = 'Debes seleccionar una talla de playera';
    if (!tallaCamisa) newErrors.tallaCamisa = 'Debes seleccionar una talla de camisa';

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/registro/alumno', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matricula: alumnoInfo?.matricula,
          email: email.trim(),
          telefono: telefono.trim(),
          tallaPlayera,
          tallaCamisa,
        })
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.details) {
          const mapped: Record<string, string> = {};
          for (const key of Object.keys(data.details)) {
            mapped[key] = data.details[key][0];
          }
          setFieldErrors(mapped);
        } else {
          setError(data.error || 'Error al registrar.');
        }
      } else {
        router.push('/registro/exitoso?tipo=alumno');
      }
    } catch {
      setError('Error de conexión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 py-8">
      <Link href="/registro" className="text-indigo-600 hover:text-indigo-800 font-medium mb-6 inline-block">
        &larr; Volver
      </Link>

      <h1 className="text-3xl font-bold text-slate-900 mb-2">Registro de Alumno</h1>
      <p className="text-slate-500 mb-8">Ingresa tu número de control para completar tus datos y seleccionar tu talla.</p>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded" role="alert">
          <p>{error}</p>
          {yaRegistrado && (
            <Link href="/consulta" className="text-red-800 underline font-semibold mt-2 inline-block">
              Consultar mi registro →
            </Link>
          )}
        </div>
      )}

      {step === 'buscar' && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800 mb-4 border-b pb-2">Paso 1: Identifícate</h2>
          <form onSubmit={handleBuscar}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">Número de Control (Matrícula)</label>
              <input
                type="text"
                value={matricula}
                onChange={e => { setMatricula(e.target.value); setError(''); }}
                placeholder="Ej. 23100225"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-lg"
                required
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Buscando...' : 'Buscar'}
            </button>
          </form>
        </div>
      )}

      {step === 'talla' && alumnoInfo && (
        <div className="space-y-6">
          <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-200">
            <h2 className="text-lg font-semibold text-indigo-800 mb-3">Alumno encontrado</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-indigo-600 font-medium">Nombre</p>
                <p className="text-slate-800 font-semibold">{alumnoInfo.nombre} {alumnoInfo.apellidoPaterno} {alumnoInfo.apellidoMaterno || ''}</p>
              </div>
              <div>
                <p className="text-indigo-600 font-medium">Matrícula</p>
                <p className="text-slate-800 font-semibold">{alumnoInfo.matricula}</p>
              </div>
              <div>
                <p className="text-indigo-600 font-medium">Semestre</p>
                <p className="text-slate-800 font-semibold">{alumnoInfo.semestre}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-semibold text-slate-800 mb-4 border-b pb-2">Paso 2: Datos de Contacto y Tallas</h2>
            <form onSubmit={handleRegistrar} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Correo Electrónico *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setFieldErrors(prev => ({ ...prev, email: '' })); }}
                    placeholder="ejemplo@correo.com"
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  />
                  {fieldErrors.email && <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono *</label>
                  <input
                    type="tel"
                    value={telefono}
                    onChange={e => { setTelefono(e.target.value); setFieldErrors(prev => ({ ...prev, telefono: '' })); }}
                    placeholder="10 dígitos"
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  />
                  {fieldErrors.telefono && <p className="text-red-500 text-xs mt-1">{fieldErrors.telefono}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Talla de Playera *</label>
                  <select
                    value={tallaPlayera}
                    onChange={e => { setTallaPlayera(e.target.value); setFieldErrors(prev => ({ ...prev, tallaPlayera: '' })); }}
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  >
                    <option value="">Selecciona una talla</option>
                    {tallas.map(t => (
                      <option key={t.id} value={t.nombre}>{t.nombre}</option>
                    ))}
                  </select>
                  {fieldErrors.tallaPlayera && <p className="text-red-500 text-xs mt-1">{fieldErrors.tallaPlayera}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Talla de Camisa *</label>
                  <select
                    value={tallaCamisa}
                    onChange={e => { setTallaCamisa(e.target.value); setFieldErrors(prev => ({ ...prev, tallaCamisa: '' })); }}
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  >
                    <option value="">Selecciona una talla</option>
                    {tallas.map(t => (
                      <option key={t.id} value={t.nombre}>{t.nombre}</option>
                    ))}
                  </select>
                  {fieldErrors.tallaCamisa && <p className="text-red-500 text-xs mt-1">{fieldErrors.tallaCamisa}</p>}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setStep('buscar'); setError(''); setFieldErrors({}); }}
                  className="px-6 py-3 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Atrás
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-grow bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-colors disabled:opacity-50"
                >
                  {loading ? 'Procesando...' : 'Confirmar Registro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
