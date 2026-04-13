"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname(); // Para saber en qué página estamos y pintar el menú

  return (
    <div className="bg-[#f7f9fb] text-[#191c1e] min-h-screen flex">
      {/* SIDEBAR */}
      <aside className="h-screen w-64 fixed left-0 top-0 bg-white/80 backdrop-blur-xl shadow-xl flex flex-col py-8 z-50">
        <div className="px-6 mb-10">
          <h1 className="text-2xl font-bold tracking-tighter text-violet-900 font-headline">LogiSystem</h1>
          <p className="text-xs font-medium tracking-tight text-slate-500">Global Command</p>
        </div>
        <nav className="flex-1 space-y-1">
          <Link href="/dashboard" className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition-all ${pathname === '/dashboard' ? 'text-violet-900 border-l-4 border-emerald-600 bg-slate-50' : 'text-slate-500 hover:text-violet-700 hover:bg-slate-50'}`}>
            <span className="material-symbols-outlined">Historial</span> 
          </Link>
          
          <Link href="/dashboard/envios" className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition-all ${pathname === '/dashboard/envios' ? 'text-violet-900 border-l-4 border-emerald-600 bg-slate-50' : 'text-slate-500 hover:text-violet-700 hover:bg-slate-50'}`}>
            <span className="material-symbols-outlined">Gestion Envios</span>
          </Link>
          
          <Link href="/dashboard/accesos" className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition-all ${pathname === '/dashboard/accesos' ? 'text-violet-900 border-l-4 border-emerald-600 bg-slate-50' : 'text-slate-500 hover:text-violet-700 hover:bg-slate-50'}`}>
            <span className="material-symbols-outlined">Accesos</span> 
          </Link>

          {/* CRUD USUARIOS */}
          <Link href="/dashboard/usuarios" className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition-all ${pathname === '/dashboard/usuarios' ? 'text-violet-900 border-l-4 border-emerald-600 bg-slate-50' : 'text-slate-500 hover:text-violet-700 hover:bg-slate-50'}`}>
            <span className="material-symbols-outlined">Gestión Usuarios</span> 
          </Link>

          {/* CRUD VEHÍCULOS (Apuntando a la nueva vista de gestión) */}
          <Link href="/dashboard/vehiculos/gestion" className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition-all ${pathname === '/dashboard/vehiculos/gestion' ? 'text-violet-900 border-l-4 border-emerald-600 bg-slate-50' : 'text-slate-500 hover:text-violet-700 hover:bg-slate-50'}`}>
            <span className="material-symbols-outlined">Gestión Flota</span>
          </Link>
          
          <Link href="/dashboard/tarjetas" className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition-all ${pathname === '/dashboard/tarjetas' ? 'text-violet-900 border-l-4 border-emerald-600 bg-slate-50' : 'text-slate-500 hover:text-violet-700 hover:bg-slate-50'}`}>
            <span className="material-symbols-outlined">Asignacion RFID</span> 
          </Link>

          <hr className="my-2 border-slate-100" />

          <Link href="/dashboard/usuarios/nuevo" className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition-all ${pathname === '/dashboard/usuarios/nuevo' ? 'text-violet-900 border-l-4 border-emerald-600 bg-slate-50' : 'text-slate-500 hover:text-violet-700 hover:bg-slate-50'}`}>
            <span className="material-symbols-outlined">Nuevo Usuario</span> 
          </Link>
        </nav>
      </aside>

      {/* CONTENIDO PRINCIPAL (El children cambia según la ruta) */}
      <main className="flex-1 ml-64 min-h-screen flex flex-col relative overflow-x-hidden">
        {/* Aquí iría la barra superior (TopNavBar) resumida */}
        <header className="w-full h-16 sticky top-0 z-40 flex justify-end items-center px-8 bg-transparent">
             <span className="material-symbols-outlined text-slate-600 mr-4">Notificaciones</span>
             <div className="w-8 h-8 rounded-full bg-violet-200"></div>
        </header>
        
        {/* Aquí se inyectan las páginas internas */}
        {children} 
      </main>
    </div>
  );
}