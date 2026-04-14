"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import RFIDListener from "@/components/RFIDListener";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="bg-[#f7f9fb] text-[#191c1e] min-h-screen flex">
      {/* SIDEBAR (Menú lateral izquierdo) */}
      <aside className="h-screen w-64 fixed left-0 top-0 bg-white/80 backdrop-blur-xl shadow-xl flex flex-col py-8 z-50">
        <div className="px-6 mb-10">
          <h1 className="text-2xl font-bold tracking-tighter text-violet-900 font-headline">LogiSystem</h1>
          <p className="text-xs font-medium tracking-tight text-slate-500">Global Command</p>
        </div>
        
        <nav className="flex-1 space-y-1">
          <Link href="/dashboard" className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition-all ${pathname === '/dashboard' ? 'text-violet-900 border-l-4 border-emerald-600 bg-slate-50' : 'text-slate-500 hover:text-violet-700 hover:bg-slate-50'}`}>
            <span className="material-symbols-outlined">dashboard</span> Resumen
          </Link>
          
          <Link href="/dashboard/envios" className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition-all ${pathname === '/dashboard/envios' ? 'text-violet-900 border-l-4 border-emerald-600 bg-slate-50' : 'text-slate-500 hover:text-violet-700 hover:bg-slate-50'}`}>
            <span className="material-symbols-outlined">local_shipping</span> Gestión de Envíos
          </Link>
          
          <Link href="/dashboard/accesos" className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition-all ${pathname === '/dashboard/accesos' ? 'text-violet-900 border-l-4 border-emerald-600 bg-slate-50' : 'text-slate-500 hover:text-violet-700 hover:bg-slate-50'}`}>
            <span className="material-symbols-outlined">gate</span> Accesos
          </Link>

          <Link href="/dashboard/usuarios" className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition-all ${pathname === '/dashboard/usuarios' ? 'text-violet-900 border-l-4 border-emerald-600 bg-slate-50' : 'text-slate-500 hover:text-violet-700 hover:bg-slate-50'}`}>
            <span className="material-symbols-outlined">group</span> Personal
          </Link>

          <Link href="/dashboard/vehiculos" className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition-all ${pathname === '/dashboard/vehiculos' ? 'text-violet-900 border-l-4 border-emerald-600 bg-slate-50' : 'text-slate-500 hover:text-violet-700 hover:bg-slate-50'}`}>
            <span className="material-symbols-outlined">add_circle</span> Ingreso a Flota
          </Link>

          <Link href="/dashboard/vehiculos/gestion" className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition-all ${pathname === '/dashboard/vehiculos/gestion' ? 'text-violet-900 border-l-4 border-emerald-600 bg-slate-50' : 'text-slate-500 hover:text-violet-700 hover:bg-slate-50'}`}>
            <span className="material-symbols-outlined">minor_crash</span> Inventario Vehículos
          </Link>
          
          <Link href="/dashboard/tarjetas" className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition-all ${pathname === '/dashboard/tarjetas' ? 'text-violet-900 border-l-4 border-emerald-600 bg-slate-50' : 'text-slate-500 hover:text-violet-700 hover:bg-slate-50'}`}>
            <span className="material-symbols-outlined">credit_card</span> Tags RFID
          </Link>

          <hr className="my-2 border-slate-100" />

          <Link href="/dashboard/usuarios/nuevo" className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition-all ${pathname === '/dashboard/usuarios/nuevo' ? 'text-violet-900 border-l-4 border-emerald-600 bg-slate-50' : 'text-slate-500 hover:text-violet-700 hover:bg-slate-50'}`}>
            <span className="material-symbols-outlined">person_add</span> Nuevo Usuario
          </Link>
        </nav>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 ml-64 min-h-screen flex flex-col relative overflow-x-hidden">
        
        {/* BARRA SUPERIOR (Corregido el icono de notifications) */}
        <header className="w-full h-16 sticky top-0 z-40 flex justify-end items-center px-8 bg-transparent">
          <span className="material-symbols-outlined text-slate-600 mr-4">notifications</span>
          <div className="w-8 h-8 rounded-full bg-violet-200"></div>
        </header>
        
        {/* LAS PÁGINAS INTERNAS */}
        {children} 

        {/* COMPONENTE DE ALERTA DE ACCESOS */}
        <RFIDListener />
        
      </main>
    </div>
  );
}