import Stripe from 'stripe';
import config from '.';

const stripe = new Stripe(config.stripe.stripeSecretKey as string, {
   apiVersion: "2025-10-29.clover"


});

export default stripe;