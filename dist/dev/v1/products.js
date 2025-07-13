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
const express_1 = __importDefault(require("express"));
const prismaClient_1 = __importDefault(require("../../prismaClient"));
const uuid_1 = require("uuid");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const router = express_1.default.Router();
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const products = yield prismaClient_1.default.tb_producto.findMany({
            where: { status: true },
        });
        res.json(products);
    }
    catch (error) {
        console.error('ERROR REAL:', error);
        res.status(500).json({ error: 'Error al obtener productos' });
    }
}));
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    try {
        const product = yield prismaClient_1.default.tb_producto.findUnique({
            where: { id_producto: id },
        });
        if (!product)
            return res.status(404).json({ error: 'Producto no encontrado' });
        res.json(product);
    }
    catch (error) {
        res.status(500).json({ error: 'Error al obtener el producto' });
    }
}));
router.post('/addproducts', (0, auth_1.default)(['admin']), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { nombre_producto, sku_producto, precio_producto, stock } = req.body;
    if (!nombre_producto || !sku_producto || !precio_producto || !stock) {
        return res.status(400).json({
            error: 'Faltan campos obligatorios: nombre_producto, sku_producto, precio_producto y stock',
        });
    }
    try {
        if (req.user.rol !== 'admin') {
            return res.status(403).json({ error: 'Acceso denegado: se requiere rol de administrador' });
        }
        const nuevoProducto = yield prismaClient_1.default.tb_producto.create({
            data: {
                id_producto: (0, uuid_1.v4)(),
                nombre_producto,
                sku_producto,
                precio_producto,
                stock,
                status: true,
            },
        });
        console.log(nuevoProducto);
        return res.status(201).json({ message: 'Producto creado exitosamente', nuevoProducto });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error al crear el producto' });
    }
}));
router.put('/:id', (0, auth_1.default)(['admin']), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const { nombre_producto, sku_producto, precio_producto, stock, status } = req.body;
    try {
        const productoActualizado = yield prismaClient_1.default.tb_producto.update({
            where: { id_producto: id },
            data: { nombre_producto, sku_producto, precio_producto: parseInt(precio_producto), stock: parseInt(stock), status },
        });
        res.json(productoActualizado);
    }
    catch (error) {
        res.status(500).json({ error: 'Error al actualizar el producto' });
    }
}));
router.delete('/:id', (0, auth_1.default)(['admin']), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    try {
        const productoDesactivado = yield prismaClient_1.default.tb_producto.update({
            where: { id_producto: id },
            data: { status: false },
        });
        res.json({ message: 'Producto desactivado', producto: productoDesactivado });
    }
    catch (error) {
        console.error('Érror al desactivar: ', error);
        res.status(500).json({ error: 'Error al desactivar el producto' });
    }
}));
exports.default = router;
