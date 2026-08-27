"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registroAlumnoSchema, SEMESTRES_VALIDOS } from '@/lib/validations';

export default function RegistroAlumno() {
  const router = useRouter();
  const [tallas, setTallas] = useState<{id: number, nombre: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    nombre: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    email: "",
    telefono: "",
    matricula: "",
    semestre: 1,
    tallaCamisa: "",
    tallaPlayera: "",
    requiereConstancia: false
  });

  useEffect(() => {
    fetch('/api/tallas')
      .then(res => res.json())
      .then(data => setTallas(data))
      .catch(() => setTallas([]));
  }, []);

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setFormData(prev => ({ ...prev, [name]: name === 'semestre' ? parseInt(value) : val }));
    if(errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setErrors({});
    
    try {
      const validData = registroAlumnoSchema.parse(formData);
      
      setLoading(true);
      const res = await fetch('/api/registro/alumno', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validData)
      });
      
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409) {
          setErrorMsg("La matrícula o el correo ya están registrados.");
        } else {
          setErrorMsg(data.error || "Ocurrió un error al registrar.");
        }
        setLoading(false);
        return;
      }
      
      router.push('/registro/exitoso?tipo=alumno');
    } catch (error: any) {
      if (error.name === "ZodError") {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err: any) => {
          if (err.path[0]) fieldErrors[err.path[0]] = err.message;
        });
        setErrors(fieldErrors);
      } else {
        setErrorMsg("Error de validación o conexión.");
      }
    } finally {
      if(!errorMsg && Object.keys(errors).length === 0 && !loading) {
         // keep loading state if redirecting
      } else {
         setLoading(false);
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 py-8">
      <Link href="/registro" className="text-indigo-600 hover:text-indigo-800 font-medium mb-6 inline-block">
        &larr; Volver
      </Link>
      
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Registro de Alumno</h1>
      
      {errorMsg && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{errorMsg}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800 mb-4 border-b pb-2">Sección 1: Información Personal</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombre *</label>
              <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} className="w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500" />
              {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Apellido Paterno *</label>
              <input type="text" name="apellidoPaterno" value={formData.apellidoPaterno} onChange={handleChange} className="w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500" />
              {errors.apellidoPaterno && <p className="text-red-500 text-xs mt-1">{errors.apellidoPaterno}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Apellido Materno</label>
              <input type="text" name="apellidoMaterno" value={formData.apellidoMaterno} onChange={handleChange} className="w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500" />
              {errors.apellidoMaterno && <p className="text-red-500 text-xs mt-1">{errors.apellidoMaterno}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Correo Electrónico *</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
              <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} className="w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500" />
              {errors.telefono && <p className="text-red-500 text-xs mt-1">{errors.telefono}</p>}
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800 mb-4 border-b pb-2">Sección 2: Información Académica</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Matrícula *</label>
              <input type="text" name="matricula" value={formData.matricula} onChange={handleChange} placeholder="Ej. 23100225" className="w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500" />
              <p className="text-xs text-slate-500 mt-1">8 dígitos, ej. 2310XXXX</p>
              {errors.matricula && <p className="text-red-500 text-xs mt-1">{errors.matricula}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Semestre *</label>
              <select name="semestre" value={formData.semestre} onChange={handleChange} className="w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                {SEMESTRES_VALIDOS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {errors.semestre && <p className="text-red-500 text-xs mt-1">{errors.semestre}</p>}
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800 mb-4 border-b pb-2">Sección 3: Información del Symposium</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Talla de Camisa *</label>
              <select name="tallaCamisa" value={formData.tallaCamisa} onChange={handleChange} className="w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                <option value="">Seleccione una talla</option>
                {tallas.map((t) => (
                  <option key={t.id} value={t.nombre}>{t.nombre}</option>
                ))}
              </select>
              {errors.tallaCamisa && <p className="text-red-500 text-xs mt-1">{errors.tallaCamisa}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Talla de Playera *</label>
              <select name="tallaPlayera" value={formData.tallaPlayera} onChange={handleChange} className="w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                <option value="">Selecciona una talla</option>
                {tallas.map((t) => (
                  <option key={t.id} value={t.nombre}>{t.nombre}</option>
                ))}
              </select>
              {errors.tallaPlayera && <p className="text-red-500 text-xs mt-1">{errors.tallaPlayera}</p>}
            </div>
            <div className="col-span-1 md:col-span-2 flex items-center mt-4">
              <input type="checkbox" name="requiereConstancia" id="requiereConstancia" checked={formData.requiereConstancia} onChange={handleChange} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
              <label htmlFor="requiereConstancia" className="ml-2 block text-sm text-slate-700">
                Requiero constancia de participación
              </label>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg shadow-md transition-colors disabled:opacity-50">
            {loading ? "Procesando..." : "Completar Registro"}
          </button>
        </div>
      </form>
    </div>
  );
}
