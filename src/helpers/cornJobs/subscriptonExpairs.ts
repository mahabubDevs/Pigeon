import cron from "node-cron";


import { USER_ROLES } from "../../enums/user";
import { Subscription } from "../../app/modules/subscription/subscription.model";
import { User } from "../../app/modules/user/user.model";

/**
 * Cron job to check expired subscriptions every day at midnight
 */
export const subscriptionExpiryCron = () => {
    cron.schedule("*/2 * * * *", async () => {
        console.log("Running subscription expiry check...");

        const now = new Date();

        // find all active subscriptions that ended
        const expiredSubscriptions = await Subscription.find({
            status: "active",
            currentPeriodEnd: { $lt: now.toISOString() },
        });

        for (const sub of expiredSubscriptions) {
            await Promise.all([
                User.findByIdAndUpdate(sub.user, {
                    isSubscribed: false,
                    planType: "FREE_USER",
                    role: USER_ROLES.USER,
                    subscriptionStart: null,
                    subscriptionEnd: null
                }),
                Subscription.findByIdAndUpdate(sub._id, { status: "expired" }),
            ]);

            console.log(`Subscription expired for user: ${sub.user}`);
        }

        console.log("Subscription expiry check finished.");
    });
};
