"use client"; // Necesario porque usamos useState y eventos del cliente

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        // Redirigir al dashboard si todo sale bien
        router.push("/dashboard");
      } else {
        const data = await res.json();
        setError(data.error || "Error al iniciar sesión");
      }
    } catch (err) {
      setError("Fallo de conexión. Intente más tarde.");
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
            {/* Si hay error, lo mostramos */}
            {error && <p className="text-red-500 text-sm text-center font-bold">{error}</p>}

            <div className="space-y-1.5">
              <label className="block text-[0.6875rem] font-bold uppercase tracking-wider text-gray-500" htmlFor="email">Email</label>
              <div className="relative">
                <input 
                  type="email" 
                  id="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="block w-full pl-3 pr-4 py-3 bg-gray-100 border-0 border-b-2 border-gray-300 focus:border-[#420093] focus:ring-0 text-sm rounded-t-lg" 
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
                  className="block w-full pl-3 pr-4 py-3 bg-gray-100 border-0 border-b-2 border-gray-300 focus:border-[#420093] focus:ring-0 text-sm rounded-t-lg" 
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
                {loading ? "Verificando..." : "Iniciar Sesión"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}