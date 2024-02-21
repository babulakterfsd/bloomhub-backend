"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SellsRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const sell_controller_1 = require("./sell.controller");
const sell_validation_1 = require("./sell.validation");
const router = express_1.default.Router();
router.post('/', (0, auth_1.default)('shopkeeper'), (0, validateRequest_1.default)(sell_validation_1.sellSchema), sell_controller_1.SellControllers.createSell);
router.get('/', (0, auth_1.default)('shopkeeper'), sell_controller_1.SellControllers.getAllSells);
exports.SellsRoutes = router;
