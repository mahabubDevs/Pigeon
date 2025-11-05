"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_routes_1 = require("../modules/user/user.routes");
const auth_routes_1 = require("../modules/auth/auth.routes");
// import { PostRoutes } from '../modules/blogpost/post.route';
const package_routes_1 = require("../modules/package/package.routes");
const pigeon_routes_1 = require("../modules/pigeon/pigeon.routes");
const subscription_routes_1 = require("../modules/subscription/subscription.routes");
const breeder_routes_1 = require("../modules/breeder/breeder.routes");
const role_routes_1 = require("../modules/role/role.routes");
const usermanagement_routes_1 = require("../modules/userManagement/usermanagement.routes");
const notification_routes_1 = require("../modules/notification/notification.routes");
const dashboard_routes_1 = require("../modules/dashbordOverview/dashboard.routes");
const analytic_route_1 = require("../modules/analytics/analytic.route");
const userEmailSubscripton_routes_1 = require("../modules/userEmailSubscripton/userEmailSubscripton.routes");
const rule_route_1 = require("../modules/rule/rule.route");
const contact_routes_1 = require("../modules/contactUs/contact.routes");
const admin_route_1 = require("../modules/admin/admin.route");
const router = express_1.default.Router();
const apiRoutes = [
    { path: "/user", route: user_routes_1.UserRoutes },
    { path: "/admin", route: admin_route_1.AdminRoutes },
    { path: "/auth", route: auth_routes_1.AuthRoutes },
    { path: "/rule", route: rule_route_1.RuleRoute },
    { path: "/contact", route: contact_routes_1.ContactRoute },
    { path: "/package", route: package_routes_1.PackageRoutes },
    { path: "/pigeon", route: pigeon_routes_1.PigeonRoutes },
    { path: "/subscription", route: subscription_routes_1.SubscriptionRoutes },
    { path: "/breeder", route: breeder_routes_1.BreederRoutes },
    { path: "/role", route: role_routes_1.RoleRoutes },
    { path: "/usermanage", route: usermanagement_routes_1.UserManagementRoutes },
    { path: "/notification", route: notification_routes_1.NotificationRoutes },
    { path: "/overview", route: dashboard_routes_1.DashboardRoutes },
    { path: "/analytic", route: analytic_route_1.AnalyticRoutes },
    { path: "/user-subscription", route: userEmailSubscripton_routes_1.UserSubscriptionRoutes }, // new user subscription route added
];
apiRoutes.forEach(route => router.use(route.path, route.route));
exports.default = router;
