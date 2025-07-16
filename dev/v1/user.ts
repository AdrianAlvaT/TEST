import express, { Request, Response } from 'express';
import prisma from '../../prismaClient';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import verificarToken from '../../middlewares/auth';
const router = express.Router();

router.get('/', async (req: Request, res: Response): Promise<void> => {
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

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id;
  try {
    const usuario = await prisma.tb_usuario.findUnique({
      where: { id_usuario: id },
      include: { persona: true },
    });

    if (!usuario) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    res.json(usuario);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el usuario' });
  }
});

router.post('/register', verificarToken(['admin']), async (req: Request, res: Response): Promise<void> => {
  const { nombre, apellido_paterno, apellido_materno, edad, sexo, usuario, password, rol } = req.body;

  if(!nombre || !apellido_paterno || !usuario || !password){
    res.status(400).json({
      error: 'Faltan campos obligatorios: nombre, apellido_paterno, usuario y password',
    });
    return;
  }

  try {
    if (req.user?.rol !== 'admin') {
      res.status(403).json({ error: 'Acceso denegado: se requiere rol de administrador' });
      return;
    }

    const persona = await prisma.tb_persona.create({
      data: {
        id_persona: uuidv4(),
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
        id_usuario: uuidv4(),
        id_persona: persona.id_persona,
        usuario,
        password: hashedPassword,
        rol: rol || 'cliente',
        status: true,
      },
    });

    res.status(201).json({ message: 'Persona y usuario registrados exitosamente', persona, usuario: nuevoUsuario });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al persona y usuario' });
  }
});

router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id;
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

router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id;
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

export default router;
