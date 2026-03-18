'use client';

import React, { useState } from 'react';
import { ActionButton } from './ActionButton';

export const RechargeButton = () => {
  const [loading, setLoading] = useState(false);

  const handleRecharge = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url; // Redirigir a Stripe Checkout
      } else {
        console.error('Error creating checkout session:', data.error);
        alert('Hubo un problema al contactar la pasarela de pagos.');
      }
    } catch (err) {
      console.error('Checkout error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleRecharge} 
      disabled={loading}
      className="w-full h-16 rounded-2xl bg-gradient-to-r from-[#bd00ff] to-[#00f3ff] flex items-center justify-center gap-3 active:scale-95 transition-transform shadow-[0_0_20px_rgba(189,0,255,0.4)] disabled:opacity-50"
    >
      {!loading && (
        <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"></path>
        </svg>
      )}
      <span className="font-bold text-xl uppercase tracking-tighter text-white">
        {loading ? 'Redirigiendo...' : 'Recargar Saldo'}
      </span>
    </button>
  );
};
