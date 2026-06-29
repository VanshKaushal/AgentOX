import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20' as any // stripe typescript types might complain about unsupported versions
});

export const PLANS = {
  pro: {
    name: 'Pro',
    price: 1200, // $12.00 in cents
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    features: ['Cloud sync', 'Web dashboard', '10 projects', '90-day history']
  },
  team: {
    name: 'Team',
    price: 2500, // $25.00 per seat
    priceId: process.env.STRIPE_TEAM_PRICE_ID!,
    features: ['Everything in Pro', 'Team dashboard', 'Unlimited projects', '1-year history']
  }
};
