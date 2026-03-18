import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/utils/supabase/server';

// Using a dummy key as fallback allows Vercel's static build process to pass even if the env variable isn't fully loaded yet.
const stripe = new Stripe((process.env.STRIPE_SECRET_KEY as string) || 'sk_test_dummy_key_for_build');

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'You must be logged in to buy tokens' }, { status: 401 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'], // 'card' natively enables Apple Pay and Google Pay if the user's device supports it.
      line_items: [
        {
          price: 'price_1TCSGHQo9kkaOgrkRfgRxgEg', // Recarga de Saldo VIP
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/bar?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/bar?payment=cancel`,
      metadata: {
        userId: user.id,
        type: 'token_recharge',
        tokens_granted: '10'
      }
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('Stripe Checkout Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
