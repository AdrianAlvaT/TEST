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
const prismaClient_1 = __importDefault(require("../../prismaClient"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const SECRET = 'secret'; // Reemplázalo con process.env.SECRET en producción
const loginUsuario = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { usuario, password } = req.body;
    try {
        const user = yield prismaClient_1.default.tb_usuario.findUnique({
            where: { usuario },
        });
        console.log(user);
        if (!user) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
        const valid = yield bcrypt_1.default.compare(password, user.password);
        console.log(valid);
        if (!valid) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
        //generar el token con id y rol
        const token = jsonwebtoken_1.default.sign({ id: user.id_usuario, rol: user.rol }, SECRET, { expiresIn: '1h' });
        res.json({
            message: 'Login exitoso',
            token,
            usuario: user.usuario,
            rol: user.rol,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: 'Error desconocido' });
        }
    }
});
exports.default = loginUsuario;
