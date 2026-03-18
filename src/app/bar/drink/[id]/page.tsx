import { createClient } from '@/utils/supabase/server';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { DrinkDetailAction } from './DrinkDetailAction';

export default async function DrinkDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const drinkId = resolvedParams.id;
  
  const supabase = await createClient();
  
  const { data: drink, error } = await supabase
    .from('drinks')
    .select('*')
    .eq('id', drinkId)
    .single();

  if (error || !drink) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-6">
        <h1 className="text-3xl text-red-500 font-bold mb-4">Error de Base de Datos</h1>
        <p className="text-gray-400">ID Buscado: {drinkId}</p>
        <p className="text-gray-400">Error: {error?.message || 'Bebida no encontrada en la tabla.'}</p>
      </div>
    );
  }

  // MODO INVITADO - Fake Data
  const tokens_available = 100; // Saldo simulado

  return (
    <div className="min-h-screen bg-[#050505] text-[#ededed] font-sans pb-32">
      {/* Background Ambience Layers */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#bd00ff] opacity-10 blur-[120px] rounded-full mix-blend-screen"></div>
        <div className="absolute top-[40%] right-[-10%] w-[400px] h-[400px] bg-[#00f3ff] opacity-[0.05] blur-[150px] rounded-full mix-blend-screen"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 pt-8">
        
        <Link href="/bar" className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-8 group">
          <span className="mr-2 transform group-hover:-translate-x-1 transition-transform">←</span> Volver al menú
        </Link>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-start">
          {/* Imagen Hero */}
          <div className="relative w-full aspect-[4/5] rounded-3xl overflow-hidden bg-[#111111] border border-white/5 shadow-[0_0_50px_rgba(0,0,0,0.8)] animate-fade-in group">
            {drink.image_url ? (
               <Image 
                 src={drink.image_url} 
                 alt={drink.name} 
                 fill 
                 className="object-cover scale-100 group-hover:scale-105 transition-transform duration-1000 ease-out"
                 priority
               />
            ) : (
               <div className="w-full h-full flex flex-col items-center justify-center text-gray-700">No Image</div>
            )}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#050505]/80 via-transparent to-transparent"></div>
          </div>

          {/* Panel de Detalles */}
          <div className="flex flex-col h-full animate-slide-up" style={{animationDelay: '0.1s'}}>
            <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400">
               {drink.name}
            </h1>
            
            <p className="text-gray-400 text-lg md:text-xl font-medium leading-relaxed mb-6">
              {drink.description}
            </p>

            <div className="bg-[#111111]/80 border border-white/5 rounded-2xl p-6 mb-8 backdrop-blur-md">
              <div className="flex justify-between items-center">
                 <span className="text-gray-400 font-medium">Costo por unidad</span>
                 <div className="flex items-center gap-2">
                    <span className="text-3xl font-bold text-[#00f3ff] tracking-tighter">${drink.price_mxn}</span>
                    <span className="text-sm font-mono text-[#00f3ff]/60 tracking-widest">MXN</span>
                 </div>
              </div>
            </div>

            {/* Acción Dinámica de Compra */}
            <DrinkDetailAction drink={drink} availableTokens={tokens_available} />

          </div>
        </div>
      </div>
    </div>
  );
}
