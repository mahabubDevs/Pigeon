import { StatusCodes } from 'http-status-codes';
import Stripe from 'stripe';
import ApiError from '../errors/ApiErrors';
import stripe from '../config/stripe';
import { Subscription } from '../app/modules/subscription/subscription.model';
import { User } from '../app/modules/user/user.model';

export const handleSubscriptionDeleted = async (data: Stripe.Subscription) => {
  try {
    const subscription = await stripe.subscriptions.retrieve(data.id);

    const activeSub = await Subscription.findOne({
      customerId: subscription.customer as string,
      status: 'active',
    });

    if (!activeSub) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Active subscription not found.');
    }

    await Subscription.findByIdAndUpdate(activeSub._id, { status: 'deactivated' }, { new: true });

    const existingUser = await User.findById(activeSub.user);
    if (!existingUser) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'User not found.');
    }

    await User.findByIdAndUpdate(existingUser._id, { hasAccess: false }, { new: true });
  } catch (error) {
    console.error('Subscription Deleted Error:', error);
    throw error;
  }
};
