"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const product_controller_1 = require("./product.controller");
const product_validation_1 = require("./product.validation");
const router = express_1.default.Router();
router.get('/:id', (0, auth_1.default)('shopkeeper'), product_controller_1.ProductControllers.getSingleProduct);
router.put('/:id', (0, auth_1.default)('shopkeeper'), (0, validateRequest_1.default)(product_validation_1.productUpdateSchema), product_controller_1.ProductControllers.updateAProduct);
router.delete('/:id', (0, auth_1.default)('shopkeeper'), product_controller_1.ProductControllers.deleteAProduct);
router.post('/', (0, auth_1.default)('shopkeeper'), (0, validateRequest_1.default)(product_validation_1.productSchema), product_controller_1.ProductControllers.createProduct);
router.get('/', (0, auth_1.default)('shopkeeper'), product_controller_1.ProductControllers.getAllProducts);
router.delete('/', (0, auth_1.default)('shopkeeper'), product_controller_1.ProductControllers.deleteMultipleProducts);
exports.ProductRoutes = router;
