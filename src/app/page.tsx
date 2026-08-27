"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Home() {
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    fetch('/api/configuracion')
      .then(res => res.json())
      .then(data => setConfig(data))
      .catch(() => setConfig({
         eventoFecha: "15 de Octubre, 2026",
         eventoLugar: "Centro de Convenciones",
         registroAbierto: true
      }));
  }, []);

  return (
    <div className="flex flex-col min-h-[calc(100vh-130px)]">
      <section className="hero-gradient flex-grow flex flex-col items-center justify-center text-white p-6 relative overflow-hidden">
        <div className="absolute top-10 left-10 w-32 h-32 bg-indigo-500 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob"></div>
        <div className="absolute top-10 right-10 w-32 h-32 bg-violet-500 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob animation-delay-2000"></div>
        
        <div className="z-10 text-center max-w-3xl">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-violet-400">
            SYMPOSIUM 2026
          </h1>
          <h2 className="text-2xl md:text-4xl font-semibold mb-6 text-slate-200">
            Synectis — Diseñando el Mañana
          </h2>
          <div className="text-lg md:text-xl text-slate-300 mb-8 font-light">
            <p>{config?.eventoFecha || "Cargando fecha..."}</p>
            <p>{config?.eventoLugar || "Cargando lugar..."}</p>
          </div>
          <p className="text-base md:text-lg text-slate-300 mb-10 max-w-2xl mx-auto">
            El evento más grande de Ingeniería en Sistemas Computacionales. Únete a expertos, estudiantes y profesionales para explorar las tendencias que darán forma al futuro tecnológico.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {config?.registroAbierto === false ? (
              <span className="bg-red-500 text-white px-8 py-3 rounded-full font-bold shadow-lg">
                Registros Cerrados
              </span>
            ) : (
              <Link href="/registro" className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-full font-bold transition-all shadow-lg hover:shadow-indigo-500/30 transform hover:-translate-y-1">
                Registrarme
              </Link>
            )}
            <Link href="/consulta" className="border-2 border-indigo-400 text-indigo-100 hover:bg-indigo-900/50 px-8 py-3 rounded-full font-bold transition-all">
              Consultar mi registro
            </Link>
          </div>
        </div>
      </section>
      <div className="bg-slate-900 text-center py-4">
        <Link href="/admin/login" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">
          Acceso administrativo
        </Link>
      </div>
    </div>
  );
}
