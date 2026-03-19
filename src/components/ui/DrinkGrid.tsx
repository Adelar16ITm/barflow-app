'use client';

import { useState } from 'react';
import { DrinkCard } from '@/components/ui/DrinkCard';

export function DrinkGrid({ drinks }: { drinks: any[] }) {
  const [search, setSearch] = useState('');

  const filteredDrinks = drinks.filter(drink => 
    drink.name.toLowerCase().includes(search.toLowerCase()) || 
    (drink.description && drink.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="w-full">
      {/* Elegante barra de búsqueda Neon */}
      <div className="mb-10 relative max-w-md mx-auto md:mx-0 w-full animate-fade-in group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-[#00f3ff]">
          <svg className="h-5 w-5 text-gray-500 group-focus-within:text-[#00f3ff] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Buscar bebida..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[#111111]/80 backdrop-blur-xl border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#00f3ff] focus:ring-1 focus:ring-[#00f3ff] focus:shadow-[0_0_20px_rgba(0,243,255,0.2)] transition-all font-medium text-lg leading-none"
        />
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDrinks.map((drink) => (
          <DrinkCard key={drink.id} drink={drink} />
        ))}
        
        {filteredDrinks.length === 0 && search.trim() !== '' && (
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-center animate-fade-in">
            <div className="w-16 h-16 rounded-full border-t-2 border-gray-600 mb-4 opacity-50"></div>
            <p className="text-gray-500 font-mono tracking-widest uppercase mb-2">Sin Resultados</p>
            <p className="text-sm text-gray-600">No encontramos bebidas con "{search}"</p>
          </div>
        )}
        
        {drinks.length === 0 && search.trim() === '' && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full border-t-2 border-[#00f3ff] animate-spin mb-4"></div>
            <p className="text-gray-500 font-mono tracking-widest uppercase">La barra está cerrada</p>
          </div>
        )}
      </div>
    </div>
  );
}
