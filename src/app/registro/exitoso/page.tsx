"use client";
import Link from 'next/link';

export default function RegistroExitoso() {
  return (
    <div className="max-w-2xl mx-auto p-6 py-20 text-center">
      <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-500">
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      
      <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">¡Registro Exitoso!</h1>
      <p className="text-lg text-slate-600 mb-2">Tu registro ha sido recibido correctamente.</p>
      <div className="inline-block bg-amber-100 text-amber-800 px-4 py-2 rounded-full font-medium mb-8 border border-amber-200">
        El estado actual es: <span className="font-bold">Pendiente</span>
      </div>
      
      <p className="text-slate-600 mb-10">Puedes consultar el estado de tu registro en cualquier momento usando tu matrícula o correo electrónico.</p>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/consulta" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
          Consultar mi registro
        </Link>
        <Link href="/" className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-6 py-3 rounded-lg font-medium transition-colors">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
