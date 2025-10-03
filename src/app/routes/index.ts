import express from 'express';
import { UserRoutes } from '../modules/user/user.routes';
import { AuthRoutes } from '../modules/auth/auth.routes';
// import { PostRoutes } from '../modules/blogpost/post.route';
import { PackageRoutes } from '../modules/package/package.routes';
import { PigeonRoutes } from '../modules/pigeon/pigeon.routes';
import { SubscriptionRoutes } from '../modules/subscription/subscription.routes';
import { BreederRoutes } from '../modules/breeder/breeder.routes';
import { RoleRoutes } from '../modules/role/role.routes';
import { UserManagementRoutes } from '../modules/userManagement/usermanagement.routes';
import { NotificationRoutes } from '../modules/notification/notification.routes';
import { DashboardRoutes } from '../modules/dashbordOverview/dashboard.routes';
import { AnalyticRoutes } from '../modules/analytics/analytic.route';
import { UserSubscriptionRoutes } from '../modules/userEmailSubscripton/userEmailSubscripton.routes';
import { RuleRoute } from '../modules/rule/rule.route';
import { ContactRoute } from '../modules/contactUs/contact.routes';
import { AdminRoutes } from '../modules/admin/admin.route';

const router = express.Router();

const apiRoutes = [
    { path: "/user", route: UserRoutes },
    { path: "/admin", route: AdminRoutes },
    { path: "/auth", route: AuthRoutes },
    { path: "/rule", route: RuleRoute },
    { path: "/contact", route: ContactRoute },
    { path: "/package", route: PackageRoutes },
    { path: "/pigeon", route: PigeonRoutes },
    { path: "/subscription", route: SubscriptionRoutes },
    { path: "/breeder", route: BreederRoutes },
    { path: "/role", route: RoleRoutes },
    { path: "/usermanage", route: UserManagementRoutes },
    { path: "/notification", route: NotificationRoutes },
    { path: "/overview", route: DashboardRoutes },
    { path: "/analytic", route:  AnalyticRoutes },
    {path: "/user-subscription", route: UserSubscriptionRoutes},  // new user subscription route added

]

apiRoutes.forEach(route => router.use(route.path, route.route));
export default router;