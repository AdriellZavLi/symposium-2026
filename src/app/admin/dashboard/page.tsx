"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/estadisticas');
        if (res.status === 401) {
          router.push('/admin/login');
          return;
        }
        if (!res.ok) throw new Error('Error fetching stats');
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [router]);

  if (loading) return <div className="p-8 text-center">Cargando dashboard...</div>;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500">Bienvenido al panel de administración del Symposium 2026</p>
        </div>
        <div className="space-x-4">
          <Link href="/admin/participantes" className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-4 py-2 rounded-lg font-medium transition-colors">
            Ver Participantes
          </Link>
          <button onClick={() => {
            fetch('/api/auth/logout', { method: 'POST' }).then(() => router.push('/admin/login'));
          }} className="text-red-500 hover:text-red-700 font-medium">
            Cerrar Sesión
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
          <p className="text-sm text-slate-500 mb-1">Total Registrados</p>
          <p className="text-3xl font-bold text-slate-800">{stats?.total || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-indigo-500">
          <p className="text-sm text-slate-500 mb-1">Alumnos</p>
          <p className="text-3xl font-bold text-slate-800">{stats?.alumnos || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-purple-500">
          <p className="text-sm text-slate-500 mb-1">Docentes</p>
          <p className="text-3xl font-bold text-slate-800">{stats?.docentes || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-emerald-500">
          <p className="text-sm text-slate-500 mb-1">Confirmados</p>
          <p className="text-3xl font-bold text-slate-800">{stats?.confirmados || 0}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Participantes por Semestre</h2>
          <div className="space-y-3">
            {stats?.porSemestre?.map((item: any) => (
              <div key={item.semestre} className="flex items-center">
                <span className="w-24 text-sm text-slate-600">Semestre {item.semestre}</span>
                <div className="flex-grow bg-slate-100 rounded-full h-4 overflow-hidden">
                  <div className="bg-indigo-500 h-full" style={{ width: `${(item.count / (stats.alumnos || 1)) * 100}%` }}></div>
                </div>
                <span className="w-12 text-right text-sm font-medium">{item.count}</span>
              </div>
            ))}
            {(!stats?.porSemestre || stats.porSemestre.length === 0) && <p className="text-slate-500 text-sm">Sin datos</p>}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Resumen de Tallas</h2>
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-2 border-b">Talla</th>
                <th className="p-2 border-b">Camisas</th>
                <th className="p-2 border-b">Playeras</th>
              </tr>
            </thead>
            <tbody>
              {stats?.tallas?.map((talla: any) => (
                <tr key={talla.nombre} className="border-b last:border-0">
                  <td className="p-2 font-medium">{talla.nombre}</td>
                  <td className="p-2">{talla.camisas}</td>
                  <td className="p-2">{talla.playeras}</td>
                </tr>
              ))}
              {(!stats?.tallas || stats.tallas.length === 0) && <tr><td colSpan={3} className="p-2 text-slate-500">Sin datos</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
