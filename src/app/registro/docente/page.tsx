"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegistroDocente() {
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
    tallaPlayera: "",
    tallaCamisa: "",
  });

  useEffect(() => {
    fetch('/api/tallas')
      .then(res => res.json())
      .then(data => setTallas(data))
      .catch(() => setTallas([]));
  }, []);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setErrors({});
    
    const newErrors: Record<string, string> = {};
    if (!formData.nombre.trim()) newErrors.nombre = "El nombre es obligatorio";
    if (!formData.apellidoPaterno.trim()) newErrors.apellidoPaterno = "El apellido paterno es obligatorio";
    if (!formData.email.trim()) newErrors.email = "El correo electrónico es obligatorio";
    if (!formData.telefono.trim()) newErrors.telefono = "El teléfono es obligatorio";
    if (!formData.tallaPlayera) newErrors.tallaPlayera = "Debes seleccionar una talla de playera";
    if (!formData.tallaCamisa) newErrors.tallaCamisa = "Debes seleccionar una talla de camisa";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/registro/docente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: formData.nombre.trim(),
          apellidoPaterno: formData.apellidoPaterno.trim(),
          apellidoMaterno: formData.apellidoMaterno.trim() || undefined,
          email: formData.email.trim(),
          telefono: formData.telefono.trim(),
          tallaPlayera: formData.tallaPlayera,
          tallaCamisa: formData.tallaCamisa,
          requiereConstancia: true,
        })
      });
      
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409) {
          setErrorMsg("Este correo electrónico ya está registrado.");
        } else {
          setErrorMsg(data.error || "Ocurrió un error al registrar.");
        }
        setLoading(false);
        return;
      }
      
      router.push('/registro/exitoso?tipo=docente');
    } catch {
      setErrorMsg("Error de conexión al servidor.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 py-8">
      <Link href="/registro" className="text-indigo-600 hover:text-indigo-800 font-medium mb-6 inline-block">
        &larr; Volver
      </Link>
      
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Registro de Docente</h1>
      <p className="text-slate-500 mb-8">Ingresa tus datos personales y selecciona tu talla.</p>
      
      {errorMsg && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded" role="alert">
          <p>{errorMsg}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
          <h2 className="text-xl font-semibold text-slate-800 border-b pb-2">Información Personal</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombre(s) *</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              />
              {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Primer Apellido *</label>
              <input
                type="text"
                name="apellidoPaterno"
                value={formData.apellidoPaterno}
                onChange={handleChange}
                className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              />
              {errors.apellidoPaterno && <p className="text-red-500 text-xs mt-1">{errors.apellidoPaterno}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Segundo Apellido</label>
              <input
                type="text"
                name="apellidoMaterno"
                value={formData.apellidoMaterno}
                onChange={handleChange}
                placeholder="Opcional"
                className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Correo Electrónico *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="ejemplo@docente.edu.mx"
                className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono *</label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="10 dígitos"
                className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              />
              {errors.telefono && <p className="text-red-500 text-xs mt-1">{errors.telefono}</p>}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
          <h2 className="text-xl font-semibold text-slate-800 border-b pb-2">Selección de Tallas</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Talla de Playera *</label>
              <select
                name="tallaPlayera"
                value={formData.tallaPlayera}
                onChange={handleChange}
                className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              >
                <option value="">Selecciona una talla</option>
                {tallas.map((t) => (
                  <option key={t.id} value={t.nombre}>{t.nombre}</option>
                ))}
              </select>
              {errors.tallaPlayera && <p className="text-red-500 text-xs mt-1">{errors.tallaPlayera}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Talla de Camisa *</label>
              <select
                name="tallaCamisa"
                value={formData.tallaCamisa}
                onChange={handleChange}
                className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              >
                <option value="">Selecciona una talla</option>
                {tallas.map((t) => (
                  <option key={t.id} value={t.nombre}>{t.nombre}</option>
                ))}
              </select>
              {errors.tallaCamisa && <p className="text-red-500 text-xs mt-1">{errors.tallaCamisa}</p>}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg shadow-md transition-colors disabled:opacity-50"
          >
            {loading ? "Procesando..." : "Completar Registro"}
          </button>
        </div>
      </form>
    </div>
  );
}
