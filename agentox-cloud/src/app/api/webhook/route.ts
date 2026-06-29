import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body, sig, process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (e) {
    return NextResponse.json({error:'Webhook failed'},{status:400});
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    const userId = session.metadata.user_id;
    const plan = session.metadata.plan;
    const customerId = session.customer;
    const subscriptionId = session.subscription;

    await supabaseAdmin
      .from('usage')
      .upsert({
        user_id: userId,
        tier: plan,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        syncs_this_month: 0
      }, { onConflict: 'user_id' }); // Needed for upsert to work properly against unique constraints
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as any;
    const { data } = await supabaseAdmin
      .from('usage')
      .select('user_id')
      .eq('stripe_subscription_id', sub.id)
      .single();

    if (data) {
      await supabaseAdmin
        .from('usage')
        .update({ tier: 'free' })
        .eq('user_id', data.user_id);
    }
  }

  return NextResponse.json({ received: true });
}
