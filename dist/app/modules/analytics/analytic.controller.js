"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const exceljs_1 = __importDefault(require("exceljs"));
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const analytic_service_1 = require("./analytic.service");
exports.DashboardController = {
    getDashboardData: (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { year, month, dataTypes } = req.query;
        // Query parameters parse
        const allowedTypes = ["revenue", "userActivity", "pedigreeStats"];
        const filter = {
            year: year ? Number(year) : undefined,
            month: month ? Number(month) : undefined,
            dataTypes: dataTypes
                ? (dataTypes
                    .split(",")
                    .filter((type) => allowedTypes.includes(type)))
                : undefined,
        };
        const data = yield analytic_service_1.DashboardService.getFilteredData(filter);
        (0, sendResponse_1.default)(res, {
            statusCode: 200,
            success: true,
            message: "Dashboard data fetched successfully",
            data,
        });
    })),
    exportDashboardExcel: (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w;
        const { year, month, dataTypes } = req.query;
        const allowedTypes = ["revenue", "userActivity", "pedigreeStats"];
        const filter = {
            year: year ? Number(year) : undefined,
            month: month ? Number(month) : undefined,
            dataTypes: dataTypes
                ? (dataTypes
                    .split(",")
                    .filter((type) => allowedTypes.includes(type)))
                : undefined,
        };
        const data = yield analytic_service_1.DashboardService.getFilteredData(filter);
        const workbook = new exceljs_1.default.Workbook();
        const sheet = workbook.addWorksheet("Dashboard Data");
        // Dynamic columns based on selected dataTypes
        const columns = [];
        if (data.revenue) {
            columns.push({ header: "Revenue Month", key: "revMonth" });
            columns.push({ header: "Revenue Year", key: "revYear" });
            columns.push({ header: "Total Revenue", key: "totalRevenue" });
        }
        if (data.userActivity) {
            columns.push({ header: "Activity Month", key: "actMonth" });
            columns.push({ header: "Activity Year", key: "actYear" });
            columns.push({ header: "Total Activity", key: "totalActivity" });
        }
        if (data.pedigreeStats) {
            columns.push({ header: "Pedigree Month", key: "pedMonth" });
            columns.push({ header: "Pedigree Year", key: "pedYear" });
            columns.push({ header: "Total Pedigree", key: "totalPedigree" });
        }
        sheet.columns = columns;
        // Determine max rows length
        const maxRows = Math.max(((_a = data.revenue) === null || _a === void 0 ? void 0 : _a.length) || 0, ((_b = data.userActivity) === null || _b === void 0 ? void 0 : _b.length) || 0, ((_c = data.pedigreeStats) === null || _c === void 0 ? void 0 : _c.length) || 0);
        for (let i = 0; i < maxRows; i++) {
            sheet.addRow({
                revMonth: ((_e = (_d = data.revenue) === null || _d === void 0 ? void 0 : _d[i]) === null || _e === void 0 ? void 0 : _e._id.month) || "",
                revYear: ((_g = (_f = data.revenue) === null || _f === void 0 ? void 0 : _f[i]) === null || _g === void 0 ? void 0 : _g._id.year) || "",
                totalRevenue: ((_j = (_h = data.revenue) === null || _h === void 0 ? void 0 : _h[i]) === null || _j === void 0 ? void 0 : _j.totalRevenue) || "",
                actMonth: ((_l = (_k = data.userActivity) === null || _k === void 0 ? void 0 : _k[i]) === null || _l === void 0 ? void 0 : _l._id.month) || "",
                actYear: ((_o = (_m = data.userActivity) === null || _m === void 0 ? void 0 : _m[i]) === null || _o === void 0 ? void 0 : _o._id.year) || "",
                totalActivity: ((_q = (_p = data.userActivity) === null || _p === void 0 ? void 0 : _p[i]) === null || _q === void 0 ? void 0 : _q.totalActivity) || "",
                pedMonth: ((_s = (_r = data.pedigreeStats) === null || _r === void 0 ? void 0 : _r[i]) === null || _s === void 0 ? void 0 : _s._id.month) || "",
                pedYear: ((_u = (_t = data.pedigreeStats) === null || _t === void 0 ? void 0 : _t[i]) === null || _u === void 0 ? void 0 : _u._id.year) || "",
                totalPedigree: ((_w = (_v = data.pedigreeStats) === null || _v === void 0 ? void 0 : _v[i]) === null || _w === void 0 ? void 0 : _w.totalPedigree) || "",
            });
        }
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", `attachment; filename=dashboard-${Date.now()}.xlsx`);
        yield workbook.xlsx.write(res);
        res.end();
    })),
};
