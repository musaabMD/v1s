// app/api/webhook/stripe/route.js

import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { Readable } from 'stream';
import { createClient } from '@/libs/supabase/server';

export const dynamic = 'force-dynamic';  // ✅ required in App Router
export const runtime = 'nodejs';         // ✅ required to get Node streams

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2020-03-02',
});

const supabase = createClient();

// Buffer helper
async function buffer(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export async function POST(req) {
  const sig = req.headers.get('stripe-signature');
  const body = await buffer(req.body);

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // ✅ Handle events
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        const { user_id, exam_id } = session.metadata;
        
        // Add exam access for the user
        const { error: accessError } = await supabase
          .from('s_user_exams')
          .upsert({
            user_id,
            exam_id,
            is_paid: true,
            access_type: 'lifetime', // or 'subscription' based on your needs
            subscription_start: new Date().toISOString(),
            added_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,exam_id'
          });

        if (accessError) {
          throw new Error(`Failed to grant exam access: ${accessError.message}`);
        }

        console.log('✅ Payment successful and access granted:', {
          user_id,
          exam_id,
          session_id: session.id
        });
        break;

      case 'payment_intent.succeeded':
        console.log('💰 Payment succeeded!', event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
