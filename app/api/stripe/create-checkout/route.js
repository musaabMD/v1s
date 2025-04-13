import { createClient } from '@/libs/supabase/server';
import Stripe from 'stripe';
import { NextResponse } from 'next/server';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is missing. Please add it to your .env.local file');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16'
});

// This function is used to create a Stripe Checkout Session (one-time payment or subscription)
// It's called by the <ButtonCheckout /> component
// Users must be authenticated. It will prefill the Checkout data with their email and/or credit card (if any)
export async function POST(req) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { examId } = body;

    if (!examId) {
      return NextResponse.json(
        { error: 'Missing exam ID' },
        { status: 400 }
      );
    }

    console.log(`ℹ️ Creating checkout session for user ${user.id} and exam ${examId}`);

    // Get exam details
    const { data: exam, error: examError } = await supabase
      .from('s_exams')
      .select('*')
      .eq('id', examId)
      .single();

    if (examError || !exam) {
      console.error('❌ Error fetching exam:', examError);
      return NextResponse.json(
        { error: 'Exam not found' },
        { status: 404 }
      );
    }

    // Ensure we have a valid price
    const price = exam.lifetime_price || exam.subscription_price || 49;
    if (!price || isNaN(price)) {
      return NextResponse.json(
        { error: 'Invalid exam price' },
        { status: 400 }
      );
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: exam.name || 'Exam Access',
              description: exam.description || 'Full exam access',
            },
            unit_amount: Math.round(price * 100), // Convert to cents and ensure it's an integer
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/exams/${examId}?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/exams/${examId}?canceled=true`,
      metadata: {
        user_id: user.id,
        exam_id: examId,
        user_email: user.email,
      },
      customer_email: user.email,
    });

    console.log('✅ Checkout session created:', session.id);
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('❌ Error creating checkout session:', err.message);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
