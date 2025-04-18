import Stripe from 'stripe';

type Interval = 'day' | 'month' | 'week' | 'year';

export const createPlan = async (
  name: string,
  amount: number,
  interval: Interval,
  description: string,
) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  // create product
  const product = await stripe.products.create({
    name,
    type: 'service',
    description,
  });

  const price = await stripe.prices.create({
    unit_amount: amount * 100, // in cents
    currency: 'usd',
    recurring: {
      interval,
    },
    product: product.id,
  });

  return price.id;
};

export const updatePrice = async (priceId: string, amount: number) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  await stripe.prices.update(priceId, {
    currency_options: {
      usd: { unit_amount: amount * 100 },
    },
  });
};
