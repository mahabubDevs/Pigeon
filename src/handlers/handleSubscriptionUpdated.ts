// import { StatusCodes } from 'http-status-codes';
// import Stripe from 'stripe';
// import ApiError from '../errors/ApiErrors';
// import stripe from '../config/stripe';
// import { Subscription } from '../app/modules/subscription/subscription.model';
// import { User } from '../app/modules/user/user.model';
// import { Package } from '../app/modules/package/package.model';

// export const handleSubscriptionUpdated = async (data: Stripe.Subscription) => {
//     try {
//         // Retrieve the subscription from Stripe
//         const subscription = await stripe.subscriptions.retrieve(data.id);

//         // Retrieve customer
//         const customer = (await stripe.customers.retrieve(subscription.customer as string)) as Stripe.Customer;

//         if (!customer?.email) {
//             throw new ApiError(StatusCodes.BAD_REQUEST, 'No email found for the customer!');
//         }

//         // Find user
//         const existingUser = await User.findOne({ email: customer.email });
//         if (!existingUser) {
//             throw new ApiError(StatusCodes.NOT_FOUND, `User with Email: ${customer.email} not found!`);
//         }

//         // Extract price ID
//         const priceId = subscription.items.data[0]?.price?.id;

//         // Find pricing plan
//         const pricingPlan = await Package.findOne({ priceId });
//         if (!pricingPlan) {
//             throw new ApiError(StatusCodes.NOT_FOUND, `Pricing plan with Price ID: ${priceId} not found!`);
//         }

//         // Invoice details
//         const invoice = await stripe.invoices.retrieve(subscription.latest_invoice as string);
//         const trxId = invoice?.payment_intent as string;
//         const amountPaid = invoice?.total ? invoice.total / 100 : 0;

//         // Required subscription fields
//         const currentPeriodStart = subscription.current_period_start;
//         const currentPeriodEnd = subscription.current_period_end;
//         const subscriptionId = subscription.id;
//         const price = subscription.items.data[0].price.unit_amount! / 100;
//         const remaining = subscription.items.data[0].quantity || 1;

//         // Check existing active subscription
//         const currentActiveSubscription = await Subscription.findOne({
//             user: existingUser._id,
//             status: 'active',
//         });

//         if (currentActiveSubscription) {
//             // Deactivate old subscription if price changed
//             if ((currentActiveSubscription.package as any).priceId !== pricingPlan.priceId) {
//                 await Subscription.findByIdAndUpdate(currentActiveSubscription._id, { status: 'deactivated' });

//                 // Create new subscription
//                 const newSubscription = new Subscription({
//                     user: existingUser._id,
//                     customerId: customer.id,
//                     package: pricingPlan._id,
//                     status: 'active',
//                     trxId,
//                     amountPaid,
//                     price,
//                     subscriptionId,
//                     currentPeriodStart: new Date(currentPeriodStart * 1000).toISOString(),
//                     currentPeriodEnd: new Date(currentPeriodEnd * 1000).toISOString(),
//                     remaining,
//                 });
//                 await newSubscription.save();

//                 await User.findByIdAndUpdate(existingUser._id, { role: 'PAIDUSER' }, { new: true });
//             }
//         } else {
//             // If no active subscription, create new
//             const newSubscription = new Subscription({
//                 user: existingUser._id,
//                 customerId: customer.id,
//                 package: pricingPlan._id,
//                 status: 'active',
//                 trxId,
//                 amountPaid,
//                 price,
//                 subscriptionId,
//                 currentPeriodStart: new Date(currentPeriodStart * 1000).toISOString(),
//                 currentPeriodEnd: new Date(currentPeriodEnd * 1000).toISOString(),
//                 remaining,
//             });
//             await newSubscription.save();
//             await User.findByIdAndUpdate(existingUser._id, { role: 'PAIDUSER' }, { new: true });
//         }
//     } catch (error) {
//         console.error('Subscription Updated Error:', error);
//         throw error;
//     }
// };


import { StatusCodes } from 'http-status-codes';
import Stripe from 'stripe';
import stripe from '../config/stripe';
import ApiError from '../errors/ApiErrors';
import { Subscription } from '../app/modules/subscription/subscription.model';
import { User } from '../app/modules/user/user.model';
import { Package } from '../app/modules/package/package.model';

export const handleSubscriptionUpdated = async (data: Stripe.Subscription) => {
  try {
    const subscription:any = await stripe.subscriptions.retrieve(data.id);
    const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;

    if (!customer.email) throw new ApiError(StatusCodes.BAD_REQUEST, 'No email found');

    const user = await User.findOne({ email: customer.email });
    if (!user) throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');

    const priceId = subscription.items.data[0]?.price?.id;
    const pricingPlan = await Package.findOne({ priceId });
    if (!pricingPlan) throw new ApiError(StatusCodes.NOT_FOUND, 'Pricing plan not found');

    const currentPeriodStart = new Date(subscription.current_period_start * 1000).toISOString();
    const currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();
    const trxId = subscription.latest_invoice || '';

    let dbSub = await Subscription.findOne({ subscriptionId: subscription.id });

    if (!dbSub) {
      // New subscription if somehow not exists in DB
      dbSub = new Subscription({
        user: user._id,
        customerId: customer.id,
        package: pricingPlan._id,
        status: 'active',
        trxId,
        amountPaid: subscription.items.data[0].price.unit_amount! / 100,
        price: subscription.items.data[0].price.unit_amount! / 100,
        subscriptionId: subscription.id,
        currentPeriodStart,
        currentPeriodEnd,
        remaining: subscription.items.data[0].quantity || 1,
      });
      await dbSub.save();
    } else {
      // Auto-renew or update
      dbSub.currentPeriodStart = currentPeriodStart;
      dbSub.currentPeriodEnd = currentPeriodEnd;
     // Auto-renew or cancel mapping
dbSub.status = subscription.status === 'active' ? 'active' : 'cancel';

      await dbSub.save();
    }

    // Update user access
    if (subscription.status === 'active') {
      await User.findByIdAndUpdate(user._id, { role: 'PAIDUSER', isSubscribed: true, hasAccess: true });
    } else {
      await User.findByIdAndUpdate(user._id, { role: 'USER', isSubscribed: false, hasAccess: false });
    }

  } catch (err) {
    console.error('Subscription Updated Error:', err);
    throw err;
  }
};
