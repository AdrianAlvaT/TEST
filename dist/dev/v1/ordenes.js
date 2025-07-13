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
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
router.get('/:id_usuario', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id_usuario = req.params.id_usuario;
    try {
        // Validar que usuario exista
        const usuario = yield prisma.tb_usuario.findUnique({
            where: { id_usuario },
            include: { persona: true },
        });
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        // Traer todas las órdenes con sus detalles y los datos de los productos
        const ordenes = yield prisma.tb_ordenes.findMany({
            where: { id_persona: usuario.id_persona },
            include: {
                detalles: {
                    include: {
                        producto: true,
                    },
                },
            },
            orderBy: {
                fecha: 'desc',
            },
        });
        return res.json({
            usuario: {
                id_usuario: usuario.id_usuario,
                usuario: usuario.usuario,
                rol: usuario.rol,
                persona: {
                    id_persona: usuario.persona.id_persona,
                    nombre: usuario.persona.nombre,
                    apellido: usuario.persona.apellido_paterno,
                },
            },
            ordenes,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener las órdenes del usuario' });
    }
}));
module.exports = router;
