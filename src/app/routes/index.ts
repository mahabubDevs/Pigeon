import express from 'express';
import { UserRoutes } from '../modules/user/user.routes';
import { AuthRoutes } from '../modules/auth/auth.routes';
import { PostRoutes } from '../modules/blogpost/post.route';
import { PackageRoutes } from '../modules/package/package.routes';
import { SubscriptionRoutes } from '../modules/subscription/subscription.routes';

const router = express.Router();

const apiRoutes = [
    { path: "/user", route: UserRoutes },
    { path: "/auth", route: AuthRoutes },
    { path: "/post", route: PostRoutes },
    { path: "/package", route: PackageRoutes },
    { path: "/subscription", route: SubscriptionRoutes },

]

apiRoutes.forEach(route => router.use(route.path, route.route));
export default router;