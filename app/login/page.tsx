"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      // 1. Leemos la respuesta como texto crudo primero para atrapar CUALQUIER cosa
      const text = await res.text();
      let data;
      
      try {
        // 2. Intentamos convertirlo a JSON
        data = JSON.parse(text); 
      } catch (parseError) {
        // 3. Si falla (ej. Vercel devuelve un error 500 en HTML), lo mostramos crudo
        throw new Error(`Respuesta no-JSON del servidor (Status ${res.status}): ${text.substring(0, 150)}...`);
      }

      if (res.ok) {
        // ✨ ¡AQUÍ ESTÁ LA MAGIA QUE FALTABA! ✨
        // Guardamos los datos del usuario en el navegador para que el Dashboard sepa quién es.
        localStorage.setItem('usuarioLogueado', JSON.stringify(data.usuario));
        
        // Y ahora sí, lo mandamos al Dashboard
        router.push("/dashboard");
      } else {
        // 4. MOSTRAR EL ERROR EXACTO QUE MANDA LA API (Con el código HTTP)
        setError(`Error API (${res.status}): ${data.error || JSON.stringify(data)}`);
      }
    } catch (err: any) {
      // 5. MOSTRAR EL ERROR EXACTO DE RED O DEL CÓDIGO
      setError(`Error Crítico: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-[#420093] to-[#006c4b]">
      <div className="relative z-10 w-full max-w-md px-6 py-12">
        <div className="bg-white rounded-xl shadow-[0_20px_40px_rgba(25,28,30,0.15)] p-10 w-full">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-extrabold tracking-tighter text-[#420093] mb-2 font-headline">LogiSystem</h1>
            <p className="text-gray-500 font-medium">Control de Acceso y Logística</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* ALERTA DE ERROR DETALLADA PARA DEBUGGING */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                <p className="text-red-700 text-xs font-bold font-mono break-words">{error}</p>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-[0.6875rem] font-bold uppercase tracking-wider text-gray-500" htmlFor="email">Email</label>
              <div className="relative">
                <input 
                  type="email" 
                  id="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="block w-full pl-3 pr-4 py-3 bg-gray-100 border-0 border-b-2 border-gray-300 focus:border-[#420093] focus:ring-0 text-sm rounded-t-lg outline-none" 
                  placeholder="nombre@logisystem.com" 
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[0.6875rem] font-bold uppercase tracking-wider text-gray-500" htmlFor="password">Password</label>
              <div className="relative">
                <input 
                  type="password" 
                  id="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="block w-full pl-3 pr-4 py-3 bg-gray-100 border-0 border-b-2 border-gray-300 focus:border-[#420093] focus:ring-0 text-sm rounded-t-lg outline-none" 
                  placeholder="••••••••" 
                />
              </div>
            </div>

            <div className="pt-4">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[#420093] text-white font-bold py-4 rounded-xl shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? "Cargando..." : "Iniciar Sesión"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}