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
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const verificarToken = require('../../middlewares/auth');
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const usuarios = yield prisma.tb_usuario.findMany({
            where: { status: true },
            include: { persona: true },
        });
        res.json(usuarios);
    }
    catch (error) {
        res.status(500).json({ error: 'Error al obtener usuarios' });
    }
}));
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id);
    try {
        const usuario = yield prisma.tb_usuario.findUnique({
            where: { id_usuario: id },
            include: { persona: true },
        });
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.json(usuario);
    }
    catch (error) {
        res.status(500).json({ error: 'Error al obtener el usuario' });
    }
}));
router.post('/register', verificarToken(['admin']), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { nombre, apellido_paterno, apellido_materno, edad, sexo, usuario, password, rol } = req.body;
    if (!nombre || !apellido_paterno || !usuario || !password) {
        return res.status(400).json({
            error: 'Faltan campos obligatorios: nombre, apellido_paterno, usuario y password',
        });
    }
    try {
        if (req.user.rol !== 'admin') {
            return res.status(403).json({ error: 'Acceso denegado: se requiere rol de administrador' });
        }
        const persona = yield prisma.tb_persona.create({
            data: {
                id_persona: uuidv4(),
                nombre,
                apellido_paterno,
                apellido_materno,
                edad: edad ? parseInt(edad) : null,
                sexo: sexo !== undefined ? Boolean(sexo) : null,
            },
        });
        const hashedPassword = yield bcrypt.hash(password, 10);
        const nuevoUsuario = yield prisma.tb_usuario.create({
            data: {
                id_usuario: uuidv4(),
                id_persona: persona.id_persona,
                usuario,
                password: hashedPassword,
                rol: rol || 'cliente',
                status: true,
            },
        });
        return res.status(201).json({ message: 'Persona y usuario registrados exitosamente', persona, usuario: nuevoUsuario });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al persona y usuario' });
    }
}));
router.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id);
    const { id_persona, usuario, password, rol, status } = req.body;
    try {
        const usuarioActualizado = yield prisma.tb_usuario.update({
            where: { id_usuario: id },
            data: {
                id_persona,
                usuario,
                password,
                rol,
                status,
            },
        });
        res.json(usuarioActualizado);
    }
    catch (error) {
        res.status(500).json({ error: 'Error al actualizar usuario' });
    }
}));
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id);
    try {
        const usuarioDesactivado = yield prisma.tb_usuario.update({
            where: { id_usuario: id },
            data: { status: false },
        });
        res.json({ message: 'Usuario desactivado', usuario: usuarioDesactivado });
    }
    catch (error) {
        res.status(500).json({ error: 'Error al desactivar usuario' });
    }
}));
module.exports = router;
