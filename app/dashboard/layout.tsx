"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import RFIDListener from "@/components/RFIDListener";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // Iniciamos con valores por defecto, pero se actualizarán inmediatamente en el useEffect
  const [userRole, setUserRole] = useState<"ADMIN" | "OPERADOR">("OPERADOR"); 
  const [userName, setUserName] = useState("Cargando...");
  const [isMounted, setIsMounted] = useState(false); // Para evitar parpadeos visuales

  useEffect(() => {
    setIsMounted(true);
    
    // 1. LEER EL USUARIO REAL DEL LOGIN
    // Cambia 'usuarioLogueado' por el nombre exacto de la variable que usas en tu Login si es diferente
    const userDataString = localStorage.getItem('usuarioLogueado'); 
    
    let currentRole = "OPERADOR"; // Por seguridad, si falla, es operador

    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        currentRole = userData.cargo || "OPERADOR";
        setUserRole(currentRole as "ADMIN" | "OPERADOR");
        setUserName(userData.nombre || "Usuario");
      } catch (error) {
        console.error("Error leyendo los datos del usuario", error);
      }
    } else {
      // Si no hay nadie logueado, lo pateamos al Login
      router.push("/login");
      return;
    }

    // 2. PROTECCIÓN DE RUTAS PARA EL OPERADOR
    if (currentRole === "OPERADOR") {
      const rutasProhibidas = ["/dashboard/usuarios", "/dashboard/vehiculos", "/dashboard/tarjetas"];
      
      const accesoIlegal = rutasProhibidas.some(ruta => pathname.startsWith(ruta));
      
      if (accesoIlegal) {
        alert("Acceso Denegado: No tienes permisos de Administrador para ver esta sección.");
        router.push("/dashboard"); 
      }
    }
  }, [pathname, router]);

  // Evitamos renderizar el menú antes de saber quién es (evita parpadeos)
  if (!isMounted) return <div className="min-h-screen bg-[#f7f9fb]"></div>;

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
        
        <nav className="flex-1 space-y-1 overflow-y-auto scrollbar-thin">
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

          {/* === ANALÍTICA === */}
          <hr className="my-4 border-slate-100" />
          <p className="px-6 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Analítica</p>

          <Link href="/dashboard/dashboards/envios" className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition-all ${pathname === '/dashboard/dashboards/envios' ? 'text-violet-900 border-l-4 border-emerald-600 bg-slate-50' : 'text-slate-500 hover:text-violet-700 hover:bg-slate-50'}`}>
            <span className="material-symbols-outlined">donut_small</span> Envíos
          </Link>

          <Link href="/dashboard/dashboards/operacional" className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition-all ${pathname === '/dashboard/dashboards/operacional' ? 'text-violet-900 border-l-4 border-emerald-600 bg-slate-50' : 'text-slate-500 hover:text-violet-700 hover:bg-slate-50'}`}>
            <span className="material-symbols-outlined">bar_chart_4_bars</span> Accesos por Hora
          </Link>

          <Link href="/dashboard/dashboards/tendencia" className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition-all ${pathname === '/dashboard/dashboards/tendencia' ? 'text-violet-900 border-l-4 border-emerald-600 bg-slate-50' : 'text-slate-500 hover:text-violet-700 hover:bg-slate-50'}`}>
            <span className="material-symbols-outlined">trending_up</span> Tendencia Semanal
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
        
        {/* BOTÓN CERRAR SESIÓN (Extra, muy útil) */}
        <div className="mt-auto px-6">
          <button 
            onClick={() => {
              localStorage.removeItem('usuarioLogueado');
              router.push('/login');
            }}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl transition-all"
          >
            <span className="material-symbols-outlined">logout</span> Cerrar Sesión
          </button>
        </div>
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
                {userName.charAt(0).toUpperCase()}
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