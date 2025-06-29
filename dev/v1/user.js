const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const verificarToken = require('../../middlewares/auth');

router.get('/', async (req, res) => {
  try {
    const usuarios = await prisma.tb_usuario.findMany({
      where: { status: true },
      include: { persona: true },
    });
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const usuario = await prisma.tb_usuario.findUnique({
      where: { id_usuario: id },
      include: { persona: true },
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(usuario);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el usuario' });
  }
});

router.post('/register', verificarToken(['admin']), async (req, res) => {
  const { nombre, apellido_paterno, apellido_materno, edad, sexo, usuario, password, rol } = req.body;

  if(!nombre || !apellido_paterno || !usuario || !password){
    return res.status(400).json({
      error: 'Faltan campos obligatorios: nombre, apellido_paterno, usuario y password',
    });
  }


  try {

    if (req.user.rol !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado: se requiere rol de administrador' });
    }

    const persona = await prisma.tb_persona.create({
      data: {
        nombre,
        apellido_paterno,
        apellido_materno,
        edad: edad ? parseInt(edad) : null,
        sexo: sexo !== undefined ? Boolean(sexo) : null,
      },
    });

    const hashedPassword = await bcrypt.hash(password, 10);

    const nuevoUsuario = await prisma.tb_usuario.create({
      data: {
        id_persona: persona.id_persona,
        usuario,
        password: hashedPassword,
        rol: rol || 'cliente',
        status: true,
      },
    });

    return res.status(201).json({ message: 'Persona y usuario registrados exitosamente', persona, usuario: nuevoUsuario });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al persona y usuario' });
  }
});

router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { id_persona, usuario, password, rol, status } = req.body;

  try {
    const usuarioActualizado = await prisma.tb_usuario.update({
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
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
});

router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const usuarioDesactivado = await prisma.tb_usuario.update({
      where: { id_usuario: id },
      data: { status: false },
    });
    res.json({ message: 'Usuario desactivado', usuario: usuarioDesactivado });
  } catch (error) {
    res.status(500).json({ error: 'Error al desactivar usuario' });
  }
});

module.exports = router;
