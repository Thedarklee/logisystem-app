"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import RFIDListener from "@/components/RFIDListener";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // ------------------------------------------------------------------------
  // 🔐 CONTROL DE ROLES (RBAC)
  // En el futuro, esto lo leerás de tu Login (ej: localStorage.getItem('usuario'))
  // Por ahora, cambia esta palabra a 'OPERADOR' o 'ADMIN' para probar cómo cambia la pantalla.
  // ------------------------------------------------------------------------
  const [userRole, setUserRole] = useState<"ADMIN" | "OPERADOR">("ADMIN"); 
  const [userName, setUserName] = useState("Usuario");

  useEffect(() => {
    // Aquí podrías leer el localstorage real de tu login:
    // const userData = localStorage.getItem('usuarioLogueado');
    // if (userData) { setUserRole(JSON.parse(userData).cargo); }

    // 🛡️ PROTECCIÓN DE RUTAS: Si es OPERADOR y está en una ruta prohibida, lo pateamos
    if (userRole === "OPERADOR") {
      const rutasProhibidas = ["/dashboard/usuarios", "/dashboard/vehiculos", "/dashboard/tarjetas"];
      
      // Revisamos si la ruta actual empieza con alguna de las prohibidas
      const accesoIlegal = rutasProhibidas.some(ruta => pathname.startsWith(ruta));
      
      if (accesoIlegal) {
        alert("Acceso Denegado: No tienes permisos de Administrador para ver esta sección.");
        router.push("/dashboard"); // Lo mandamos al inicio
      }
    }
  }, [pathname, userRole, router]);

  return (
    <div className="bg-[#f7f9fb] text-[#191c1e] min-h-screen flex">
      {/* SIDEBAR (Menú lateral izquierdo) */}
      <aside className="h-screen w-64 fixed left-0 top-0 bg-white/80 backdrop-blur-xl shadow-xl flex flex-col py-8 z-50">
        <div className="px-6 mb-10">
          <h1 className="text-2xl font-bold tracking-tighter text-violet-900 font-headline">LogiSystem</h1>
          <p className="text-xs font-medium tracking-tight text-slate-500">
            {userRole === 'ADMIN' ? 'Control Total (Admin)' : 'Panel de Operaciones'}
          </p>
        </div>
        
        <nav className="flex-1 space-y-1">
          {/* === RUTAS PÚBLICAS (Para Admin y Operador) === */}
          <Link href="/dashboard" className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition-all ${pathname === '/dashboard' ? 'text-violet-900 border-l-4 border-emerald-600 bg-slate-50' : 'text-slate-500 hover:text-violet-700 hover:bg-slate-50'}`}>
            <span className="material-symbols-outlined">dashboard</span> Resumen
          </Link>
          
          <Link href="/dashboard/envios" className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition-all ${pathname.includes('/dashboard/envios') ? 'text-violet-900 border-l-4 border-emerald-600 bg-slate-50' : 'text-slate-500 hover:text-violet-700 hover:bg-slate-50'}`}>
            <span className="material-symbols-outlined">local_shipping</span> Gestión de Envíos
          </Link>
          
          <Link href="/dashboard/accesos" className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition-all ${pathname.includes('/dashboard/accesos') ? 'text-violet-900 border-l-4 border-emerald-600 bg-slate-50' : 'text-slate-500 hover:text-violet-700 hover:bg-slate-50'}`}>
            <span className="material-symbols-outlined">gate</span> Accesos
          </Link>

          {/* === RUTAS PRIVADAS (Solo para Administradores) === */}
          {userRole === 'ADMIN' && (
            <>
              <hr className="my-4 border-slate-100" />
              <p className="px-6 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Administración</p>

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

              <Link href="/dashboard/usuarios/nuevo" className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition-all ${pathname === '/dashboard/usuarios/nuevo' ? 'text-violet-900 border-l-4 border-emerald-600 bg-slate-50' : 'text-slate-500 hover:text-violet-700 hover:bg-slate-50'}`}>
                <span className="material-symbols-outlined">person_add</span> Nuevo Usuario
              </Link>
            </>
          )}
        </nav>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 ml-64 min-h-screen flex flex-col relative overflow-x-hidden">
        
        {/* BARRA SUPERIOR */}
        <header className="w-full h-16 sticky top-0 z-40 flex justify-end items-center px-8 bg-transparent">
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-slate-500 hover:text-violet-800 cursor-pointer transition-colors">notifications</span>
            
            {/* Indicador de Rol Visual en la esquina */}
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-slate-700 leading-none">{userName}</p>
                <p className={`text-[10px] font-black uppercase tracking-widest mt-0.5 ${userRole === 'ADMIN' ? 'text-violet-600' : 'text-emerald-600'}`}>
                  {userRole}
                </p>
              </div>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-white shadow-md ${userRole === 'ADMIN' ? 'bg-violet-700' : 'bg-emerald-600'}`}>
                {userName.charAt(0)}
              </div>
            </div>
          </div>
        </header>
        
        {/* LAS PÁGINAS INTERNAS */}
        {children} 

        {/* COMPONENTE DE ALERTA DE ACCESOS */}
        <RFIDListener />
        
      </main>
    </div>
  );
}