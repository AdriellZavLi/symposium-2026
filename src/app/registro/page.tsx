"use client";
import Link from 'next/link';

export default function SeleccionRegistro() {
  return (
    <div className="max-w-4xl mx-auto p-6 py-12">
      <Link href="/" className="text-indigo-600 hover:text-indigo-800 font-medium mb-8 inline-block">
        &larr; Volver al inicio
      </Link>
      
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-12 text-slate-900">
        Selecciona tu tipo de participante
      </h1>
      
      <div className="grid md:grid-cols-2 gap-8">
        <Link href="/registro/alumno" className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow p-8 flex flex-col items-center text-center border-2 border-transparent hover:border-indigo-100 group">
          <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">🎓</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Alumno</h2>
          <p className="text-slate-600">Ingresa tu número de control y selecciona tu talla.</p>
        </Link>
        
        <Link href="/registro/docente" className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow p-8 flex flex-col items-center text-center border-2 border-transparent hover:border-indigo-100 group">
          <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">👨‍🏫</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Docente</h2>
          <p className="text-slate-600">Registro para personal docente y administrativo.</p>
        </Link>
      </div>
    </div>
  );
}
