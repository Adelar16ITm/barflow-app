import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Fail fast if env vars are missing at runtime
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req: Request) {
  // Validate env vars before proceeding
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Server misconfigured: missing Supabase env vars' }, { status: 500 });
  }
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Server misconfigured: missing STRIPE_WEBHOOK_SECRET' }, { status: 500 });
  }

  // Service Role Client to bypass RLS for wallet updates
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );

  const payload = await req.text();
  const signature = req.headers.get('Stripe-Signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing Stripe-Signature header' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    // Verify cryptographic signature to prevent fake payment injections
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    console.error(`❌ Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle successful checkout
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    // Extract metadata sealed in /api/checkout
    const userId = session.metadata?.userId;
    const type = session.metadata?.type;
    const tokensGranted = parseInt(session.metadata?.tokens_granted || '10', 10);

    if (userId && type === 'token_recharge') {
      console.log(`💰 Payment verified. Adding ${tokensGranted} tokens for user ${userId}`);

      // Read current balance
      const { data: currentWallet } = await supabaseAdmin
        .from('wallet_balance')
        .select('balance')
        .eq('user_id', userId)
        .single();
        
      const newBalance = (currentWallet?.balance || 0) + tokensGranted;

      // Upsert the new balance
      const { error } = await supabaseAdmin
        .from('wallet_balance')
        .upsert({ 
          user_id: userId,
          balance: newBalance,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('❌ Error updating wallet_balance in Supabase:', error);
        return NextResponse.json({ error: 'DB_ERROR' }, { status: 500 });
      }

      console.log(`✅ Wallet updated: user ${userId} now has ${newBalance} tokens`);
    } else {
      console.warn('⚠️ Webhook received but missing critical token metadata:', session.metadata);
    }
  }

  return NextResponse.json({ received: true });
}
