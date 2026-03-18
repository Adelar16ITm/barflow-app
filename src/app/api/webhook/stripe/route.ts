import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js'; 

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

// REGLA ANTIGRAV: Service Role Client para el Webhook (Se brinca el RLS para actualizar saldo con potestad).
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const payload = await req.text();
  const signature = req.headers.get('Stripe-Signature');

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing Stripe Signature or Secret env var' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    // Validar la firma criptográfica para evitar inyecciones de pagos falsos.
    event = stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Manejar el evento de Checkout Exitoso (Tarjeta cobrada correctamante)
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    // Extraer metadata sellada previamente en el API checkout
    const userId = session.metadata?.userId;
    const tokensAdded = parseInt(session.metadata?.tokensAdded || '0', 10);

    if (userId && tokensAdded > 0) {
      // 1. Corroborar el balance actual del cantinero
      const { data: currentWallet, error: fetchError } = await supabaseAdmin
        .from('wallet_balance')
        .select('tokens_available')
        .eq('user_id', userId)
        .single();
      
      if (!fetchError && currentWallet) {
        // 2. Añadir los tokens pagados (Upsert del ledger monetario)
        await supabaseAdmin
          .from('wallet_balance')
          .update({ 
            tokens_available: currentWallet.tokens_available + tokensAdded,
            last_recharge_date: new Date().toISOString()
          })
          .eq('user_id', userId);
      }
    }
  }

  return NextResponse.json({ received: true });
}
