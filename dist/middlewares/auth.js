"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const SECRET = 'secret'; // ¡Ponlo en .env si estás en producción!
const authMiddleware = (rolesPermitidos = []) => {
    return (req, res, next) => {
        const authHeader = req.headers.authorization;
        console.log(authHeader);
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Token no proporcionado' });
        }
        const token = authHeader.split(' ')[1];
        const payload = jsonwebtoken_1.default.verify(token, SECRET);
        if (typeof payload !== 'string' && 'rol' in payload) {
            if (rolesPermitidos.length && !rolesPermitidos.includes(payload.rol)) {
                return res.status(403).json({ error: 'Token inválido' });
            }
            next();
        }
        else {
            return res.status(401).json({ error: 'Token inválido' });
        }
    };
};
exports.default = verificarToken;
