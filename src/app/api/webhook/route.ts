import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

// Usamos Service Role para saltar RLS y poder inyectar saldo
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function POST(req: Request) {
  const payload = await req.text();
  const signature = req.headers.get('Stripe-Signature');

  let event: Stripe.Event;

  try {
    if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
      throw new Error('Falta firma o secreto en env');
    }
    
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    console.error(`❌ Error de Webhook: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Si el pago es exitoso
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    // Extraemos metadata inyectada en /api/checkout
    const userId = session.metadata?.userId;
    const type = session.metadata?.type;
    const tokensGranted = parseInt(session.metadata?.tokens_granted || '10', 10);

    if (userId && type === 'token_recharge') {
      console.log(`💰 Pago de Tokens verificado. Añadiendo ${tokensGranted} tokens para ${userId}`);

      // Registrar los tokens a la cuenta del usuario en Supabase
      const { data: currentWallet } = await supabaseAdmin
        .from('wallet_balance')
        .select('balance')
        .eq('user_id', userId)
        .single();
        
      const newBalance = (currentWallet?.balance || 0) + tokensGranted;

      const { error } = await supabaseAdmin
        .from('wallet_balance')
        .upsert({ 
            user_id: userId,
            balance: newBalance,
            updated_at: new Date().toISOString()
        });

      if (error) {
         console.error('❌ Error actualizando wallet_balance en Supabase:', error);
         return NextResponse.json({ error: 'DB_ERROR' }, { status: 500 });
      }
    } else {
      console.warn('⚠️ Webhook recibido pero faltaban datos críticos de tokens en metadata:', session.metadata);
    }
  }

  return NextResponse.json({ received: true });
}
