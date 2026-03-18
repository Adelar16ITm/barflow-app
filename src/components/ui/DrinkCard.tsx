'use client';

import Image from 'next/image';
import Link from 'next/link';

export const DrinkCard = ({ drink }: { drink: any }) => {
  if (!drink.is_available) {
    return (
      <div className="relative group rounded-3xl overflow-hidden bg-[#111111]/80 backdrop-blur-sidebar border border-white/5 opacity-50 flex flex-col justify-between h-full cursor-not-allowed">
        <div className="relative w-full h-56 bg-[#0a0a0a] overflow-hidden">
           <div className="w-full h-full flex items-center justify-center text-gray-700 bg-[#050505]">Agotado</div>
        </div>
        <div className="p-6 flex flex-col h-full gap-4 relative z-10">
          <div className="flex justify-between items-start">
            <h3 className="text-2xl font-bold text-gray-500 tracking-tight">{drink.name}</h3>
          </div>
          <p className="text-gray-600 font-medium leading-relaxed flex-grow text-sm md:text-base line-clamp-3">
            {drink.description}
          </p>
        </div>
      </div>
    );
  }

  return (
    <Link href={`/bar/drink/${drink.id}`} className="block h-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#bd00ff] rounded-2xl">
      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden neon-border-cyan bg-zinc-900 group active:scale-95 transition-transform flex flex-col justify-between h-full w-full">
        {drink.image_url ? (
          <Image 
            src={drink.image_url} 
            alt={drink.name} 
            fill 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-700 bg-zinc-900">No Image</div>
        )}
        
        <div className="drink-card-overlay absolute inset-0 flex flex-col justify-end p-4 text-left z-10 transition-colors group-hover:bg-[#050505]/40">
          <p className="font-bold text-lg leading-tight mb-1 uppercase text-white drop-shadow-md">{drink.name}</p>
          <div className="flex items-center gap-1">
            <span className="text-neon-cyan neon-text-cyan font-bold">${drink.price_mxn}</span>
            <span className="text-[10px] text-neon-cyan/80">MXN</span>
          </div>
        </div>
      </div>
    </Link>
  );
};
