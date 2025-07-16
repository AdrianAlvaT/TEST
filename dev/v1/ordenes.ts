import express, { Request, Response } from 'express';
import prisma from '../../prismaClient';
import verificarToken from '../../middlewares/auth';

const router = express.Router();

router.get('/:id_usuario', verificarToken(['admin']), async (req: Request, res: Response): Promise<void> => {
  const id_usuario = req.params.id_usuario;

  try {
    // Buscar usuario y su persona relacionada
    const usuario = await prisma.tb_usuario.findUnique({
      where: { id_usuario },
      include: { persona: true },
    });

    if (!usuario) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    // Validar que persona no sea null
    if (!usuario.persona) {
      res.status(404).json({ error: 'Persona no encontrada para este usuario' });
      return;
    }

    // Traer órdenes con detalles y productos
    const ordenes = await prisma.tb_ordenes.findMany({
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

    res.json({
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener las órdenes del usuario' });
  }
});

export default router;