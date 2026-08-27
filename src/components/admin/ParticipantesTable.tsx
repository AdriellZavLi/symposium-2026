"use client";

interface ParticipanteResumen {
  id: number;
  tipo: string;
  nombreCompleto: string;
  matriculaONumero: string | null;
  semestreODepto: string | null;
  tallaPlayera: string;
  tallaCamisa: string;
  estado: string;
}

interface ParticipantesTableProps {
  participantes: ParticipanteResumen[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onView: (id: number) => void;
  onChangeEstado: (id: number, estado: string) => void;
}

export default function ParticipantesTable({
  participantes,
  onEdit,
  onDelete,
  onView,
  onChangeEstado
}: ParticipantesTableProps) {
  
  const getEstadoBadge = (estado: string) => {
    switch(estado) {
      case 'confirmado':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Confirmado</span>;
      case 'cancelado':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Cancelado</span>;
      default:
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-800">Pendiente</span>;
    }
  };

  const getTipoBadge = (tipo: string) => {
    return tipo === 'ALUMNO' 
      ? <span className="px-2 py-1 text-xs font-medium bg-indigo-50 text-indigo-700 rounded-md">Alumno</span>
      : <span className="px-2 py-1 text-xs font-medium bg-violet-50 text-violet-700 rounded-md">Docente</span>;
  };

  return (
    <div className="flex flex-col bg-white rounded-lg shadow border border-slate-200 overflow-hidden">
      <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Matrícula/Empleado
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Semestre/Depto
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Tallas (P/C)
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {participantes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-sm text-slate-500">
                      No se encontraron participantes.
                    </td>
                  </tr>
                ) : (
                  participantes.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                        {p.nombreCompleto}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {p.matriculaONumero || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {getTipoBadge(p.tipo)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {p.semestreODepto || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {p.tallaPlayera} / {p.tallaCamisa}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select 
                          className="text-xs bg-transparent border-0 cursor-pointer focus:ring-0"
                          value={p.estado}
                          onChange={(e) => onChangeEstado(p.id, e.target.value)}
                        >
                          <option value="pendiente">Pendiente</option>
                          <option value="confirmado">Confirmado</option>
                          <option value="cancelado">Cancelado</option>
                        </select>
                        <div className="mt-1">{getEstadoBadge(p.estado)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button onClick={() => onView(p.id)} className="text-indigo-600 hover:text-indigo-900 p-1" title="Ver">
                            👁️
                          </button>
                          <button onClick={() => onEdit(p.id)} className="text-blue-600 hover:text-blue-900 p-1" title="Editar">
                            ✏️
                          </button>
                          <button onClick={() => onDelete(p.id)} className="text-red-600 hover:text-red-900 p-1" title="Eliminar">
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
