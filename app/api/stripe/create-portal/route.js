import { createClient } from '@/libs/supabase/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Get the user's subscription
    const { data: subscription } = await supabase
      .from('s_user_subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (!subscription?.stripe_customer_id) {
      return new Response('No active subscription found', { status: 404 });
    }

    // Create a Stripe billing portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
    });

    return new Response(JSON.stringify({ url: session.url }));
  } catch (error) {
    console.error('Error creating portal session:', error);
    return new Response(error.message, { status: 500 });
  }
}
