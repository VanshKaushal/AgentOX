import { NextRequest, NextResponse } from 'next/server';
import { stripe, PLANS } from '@/lib/stripe';
import { getUserFromToken, supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) {
    return NextResponse.json({error:'Not authenticated'},{status:401});
  }
  const token = auth.replace('Bearer ', '');
  const user = await getUserFromToken(token);
  if (!user) {
    return NextResponse.json({error:'Invalid session'},{status:403});
  }

  const { plan } = await req.json();
  const planConfig = PLANS[plan as keyof typeof PLANS];
  if (!planConfig) {
    return NextResponse.json({error:'Invalid plan'},{status:400});
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const session = await stripe.checkout.sessions.create({
    customer_email: user.email,
    payment_method_types: ['card'],
    line_items: [{
      price: planConfig.priceId,
      quantity: 1
    }],
    mode: 'subscription',
    success_url: `${appUrl}/dashboard?upgraded=true`,
    cancel_url: `${appUrl}/pricing`,
    metadata: {
      user_id: user.id,
      plan
    }
  });

  return NextResponse.json({ url: session.url });
}
