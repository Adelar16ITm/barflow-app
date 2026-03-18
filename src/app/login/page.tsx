'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy'
  );

  const handleFastLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return alert('Por favor, ingresa tu nombre.');

    setLoading(true);

    // Tequila-Proof Magic: Creamos una cuenta sombra inmediatamente para no pedir contraseñas ni correos reales.
    const randomId = Math.random().toString(36).substring(2, 10);
    const shadowEmail = `guest_${randomId}@barflow.app`;
    const shadowPassword = `GUEST_${randomId}_PASS99!`;

    try {
      // 1. Crear el usuario desde el servidor con confirmación obligatoria desactivada.
      const res = await fetch('/api/auth/guest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: shadowEmail, password: shadowPassword, name: name.trim() })
      });
      
      const resData = await res.json();
      
      if (!res.ok) {
        throw new Error(resData.error || 'Error creando acceso VIP');
      }

      // 2. Iniciar sesión automáticamente en el cliente una vez creado y confirmado
      const { error: signInError } = await supabase.auth.signInWithPassword({
         email: shadowEmail,
         password: shadowPassword
      });

      if (signInError) throw signInError;

      router.push('/bar');
    } catch (err: any) {
      console.error('FastLogin Auth Error:', err);
      alert('Error en el acceso: ' + err.message);
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/bar`
      }
    });
    if (error) alert(error.message);
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 selection:bg-[#bd00ff]">
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#bd00ff] opacity-10 blur-[120px] rounded-full mix-blend-screen"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-[#00f3ff] opacity-[0.07] blur-[150px] rounded-full mix-blend-screen"></div>
      </div>
      
      <div className="relative z-10 w-full max-w-md p-8 backdrop-blur-xl bg-[#050505]/60 border border-white/10 rounded-3xl shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <h1 className="text-4xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-2">
          BARFLOW
        </h1>
        <p className="text-[#00f3ff] text-sm uppercase tracking-widest font-mono mb-8">Fast-Track Entry</p>
        
        <form className="flex flex-col gap-4" onSubmit={handleFastLogin}>
          <input 
            type="text" 
            placeholder="¿Cómo te llamas?" 
            className="p-5 text-lg font-bold bg-black/50 border border-white/10 rounded-xl text-white outline-none focus:border-[#00f3ff] focus:shadow-[0_0_15px_rgba(0,243,255,0.2)] transition-all"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <button 
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-5 rounded-xl bg-gradient-to-r from-[#bd00ff] to-[#00f3ff] text-black font-black text-xl uppercase tracking-wider shadow-[0_0_30px_rgba(189,0,255,0.4)] hover:brightness-125 hover:shadow-[0_0_50px_rgba(0,243,255,0.6)] transition-all disabled:opacity-50"
          >
            {loading ? 'Entrando...' : '⚡ Entrar al Bar'}
          </button>
        </form>
        
        <div className="mt-8 flex items-center gap-4">
          <div className="h-px bg-white/10 flex-1"></div>
          <span className="text-white/40 text-[10px] uppercase font-mono tracking-widest">O enlaza tu cuenta</span>
          <div className="h-px bg-white/10 flex-1"></div>
        </div>
        
        <button 
          onClick={handleGoogleLogin}
          className="w-full mt-6 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold uppercase tracking-wider flex items-center justify-center gap-3 hover:bg-white/10 transition-all"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Google Auth
        </button>

      </div>
    </div>
  );
}
