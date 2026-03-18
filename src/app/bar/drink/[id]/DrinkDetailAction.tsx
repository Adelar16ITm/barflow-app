'use client';

import { useState, useTransition } from 'react';
import { orderDrink } from '@/app/bar/actions';

export function DrinkDetailAction({ drink, availableTokens }: { drink: any, availableTokens: number }) {
  const [quantity, setQuantity] = useState(1);
  const [isPending, startTransition] = useTransition();

  const handleIncrement = () => setQuantity(prev => Math.min(prev + 1, 10)); // Max 10 per order
  const handleDecrement = () => setQuantity(prev => Math.max(prev - 1, 1));
  
  const totalCost = drink.price_mxn * quantity;

  const handleCheckout = () => {
    startTransition(async () => {
      try {
        const response = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            drinkId: drink.id,
            drinkName: drink.name,
            quantity: quantity,
            totalMxn: totalCost,
            imageUrl: drink.image_url
          }),
        });
        
        const data = await response.json();
        
        if (data.url) {
          window.location.href = data.url;
        } else {
          alert('Error creando pago: ' + (data.error || 'Desconocido'));
        }
      } catch (err: any) {
        alert('Error conectando con el servidor de pagos.');
      }
    });
  };

  return (
    <div className="flex flex-col gap-6 w-full mt-auto">
       <div className="flex items-center justify-between bg-black/50 border border-white/10 rounded-2xl p-2 w-full max-w-[200px]">
          <button 
             onClick={handleDecrement}
             className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors font-mono text-2xl"
          >
             -
          </button>
          <span className="text-2xl font-bold font-mono text-white w-8 text-center">{quantity}</span>
          <button 
             onClick={handleIncrement}
             className="w-12 h-12 flex items-center justify-center text-[#00f3ff] hover:text-white hover:bg-[#00f3ff]/20 rounded-xl transition-colors font-mono text-2xl"
          >
             +
          </button>
       </div>

       <button 
          onClick={handleCheckout}
          disabled={isPending || !drink.is_available}
          className="w-full relative overflow-hidden bg-gradient-to-r from-[#bd00ff] to-[#00f3ff] disabled:opacity-50 disabled:grayscale hover:shadow-[0_0_40px_rgba(0,243,255,0.4)] text-white border-none rounded-2xl py-6 font-black text-xl md:text-2xl tracking-tighter transition-all duration-300 group/btn shadow-lg"
       >
          <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></div>
          
          <span className="relative z-10 flex items-center justify-between px-4">
             <span>{isPending ? 'PROCESANDO...' : 'PAGAR ORDEN'}</span>
             <span className="font-mono bg-black/30 px-3 py-1 rounded-xl border border-white/20">
                ${totalCost} MXN
             </span>
          </span>
       </button>
    </div>
  );
}
