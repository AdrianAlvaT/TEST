import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
const router = express.Router();
const prisma = new PrismaClient();

router.get('/:id_usuario', async (req: Request, res: Response) => {
    const id_usuario = req.params.id_usuario;
  
    try {
      // Validar que usuario exista
      const usuario = await prisma.tb_usuario.findUnique({
        where: { id_usuario },
        include: {persona: true},
      });
  
      if (!usuario) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
  
      // Traer todas las órdenes con sus detalles y los datos de los productos
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
  
      return res.json({
        usuario: {
          id_usuario: usuario.id_usuario,
          usuario: usuario.usuario,
          rol: usuario.rol,
          persona:{
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