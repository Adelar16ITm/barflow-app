import { createClient } from '@/utils/supabase/server';
import { RechargeButton } from '@/components/ui/RechargeButton';
import { DrinkCard } from '@/components/ui/DrinkCard';

export default async function BarDashboard() {
  const supabase = await createClient();

  // Obtenemos lista de tragos disponibles públicamente
  const { data: drinks } = await supabase.from('drinks').select('*').eq('is_available', true);
  const drinkList = drinks || [];
  
  const { data: { user } } = await supabase.auth.getUser();
  let tokens_available = 0;
  
  if (user) {
    const { data: wallet } = await supabase.from('wallet_balance').select('balance').eq('user_id', user.id).single();
    if (wallet) {
      tokens_available = wallet.balance;
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] text-[#ededed] font-sans pb-32 selection:bg-[#bd00ff] selection:text-white">
      
      {/* Background Ambience Layers */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#bd00ff] opacity-10 blur-[120px] rounded-full mix-blend-screen"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-[#00f3ff] opacity-[0.07] blur-[150px] rounded-full mix-blend-screen"></div>
      </div>

      <div className="relative z-10">
        {/* Superior Header (Glassmorphic) */}
        <header className="sticky top-0 w-full z-40 backdrop-blur-xl bg-[#050505]/60 border-b border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#bd00ff] to-[#00f3ff] flex items-center justify-center shadow-[0_0_15px_rgba(189,0,255,0.4)] text-white">
                <span className="text-xl">🍸</span>
              </div>
              <div>
                <h1 className="text-2xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                  BARFLOW
                </h1>
                <p className="text-[10px] text-[#00f3ff] uppercase tracking-[0.2em] font-mono font-bold text-neon-cyan">Menú Bebidas</p>
              </div>
            </div>
            
            <div className="text-right" data-purpose="token-display">
              <p className="text-[10px] text-zinc-400 uppercase tracking-widest">Saldo</p>
              <div className="flex items-center gap-1">
                <span className="text-[#00f3ff] font-bold text-2xl tracking-tighter neon-text-cyan">${tokens_available}</span>
                <span className="text-[#00f3ff] text-xs">MXN</span>
              </div>
            </div>
            
          </div>
        </header>

        {/* Menu Grid (Glass Cards) */}
        <main className="max-w-7xl mx-auto px-6 pt-12 animate-slide-up" style={{animationDelay: '0.1s'}}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {drinkList.map((drink: any) => (
              <DrinkCard key={drink.id} drink={drink} />
            ))}
            
            {drinkList.length === 0 && (
              <div className="col-span-full py-20 flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full border-t-2 border-[#00f3ff] animate-spin mb-4"></div>
                <p className="text-gray-500 font-mono tracking-widest uppercase">La barra está cerrada</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Extreme Floating Recharge Action (One Handed Fixed Bottom) */}
      <div className="fixed bottom-0 left-0 w-full p-6 bg-gradient-to-t from-[#050505] via-[#050505]/90 to-transparent z-50 animate-slide-up" style={{animationDelay: '0.3s'}}>
        <div className="max-w-md mx-auto">
          <RechargeButton />
        </div>
      </div>

    </div>
  );
}
