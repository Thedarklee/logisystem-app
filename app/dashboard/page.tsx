// src/app/dashboard/page.tsx
export default function DashboardPage() {
  return (
    <div className="p-8 space-y-8">
      {/* Sección KPI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Tarjeta Envíos Activos */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Envíos Activos</p>
          <h3 className="text-3xl font-extrabold font-headline text-violet-900">28</h3>
        </div>

        {/* Tarjeta Entregas */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Entregas Completadas</p>
          <h3 className="text-3xl font-extrabold font-headline text-violet-900">54</h3>
        </div>

        {/* Tarjeta Accesos */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Accesos Registrados</p>
          <h3 className="text-3xl font-extrabold font-headline text-violet-900">112</h3>
        </div>

        {/* Tarjeta Incidencias */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-red-600">
          <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Incidencias</p>
          <h3 className="text-3xl font-extrabold font-headline text-red-600">4</h3>
        </div>
      </div>

      {/* Tabla de Actividad Reciente */}
      <section className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100">
        <div className="px-8 py-6 bg-gray-50 border-b border-gray-100">
          <h2 className="text-xl font-bold font-headline text-violet-900">Actividad Reciente</h2>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[10px] uppercase tracking-widest text-gray-500 font-bold bg-white">
              <th className="px-8 py-4">Hora</th>
              <th className="px-8 py-4">Evento</th>
              <th className="px-8 py-4">Responsable</th>
              <th className="px-8 py-4">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {/* Fila de ejemplo (Esto luego lo puedes mapear desde la base de datos) */}
            <tr className="hover:bg-gray-50">
              <td className="px-8 py-5 text-sm font-medium">14:23</td>
              <td className="px-8 py-5 text-sm font-semibold">Salida de Almacén</td>
              <td className="px-8 py-5 text-sm">Juan Pérez</td>
              <td className="px-8 py-5">
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">Correcto</span>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  );
}