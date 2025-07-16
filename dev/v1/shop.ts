import express, { Request, Response } from 'express';
import prisma from '../../prismaClient';
import { v4 as uuidv4 } from 'uuid';
import verificarToken from '../../middlewares/auth';
const router = express.Router();

/*
 Endpoint para que el cliente vea todos los productos disponibles
 */
router.get('/products', verificarToken(), async (req: Request, res: Response): Promise<void> => {
  try {
    const products = await prisma.tb_producto.findMany({
      where: { status: true },
    });
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

/**
 * Endpoint para registrar una compra
 */
router.post('/comprar', verificarToken(), async (req: Request, res: Response): Promise<void> => {
  const id_usuario = req.user?.id;
  const { productos } = req.body;

  if (!productos || !Array.isArray(productos) || productos.length === 0) {
    res.status(400).json({ error: 'Debe enviar productos a comprar' });
    return;
  }

  try {
    // 1) Obtener usuario con su persona
    const usuario = await prisma.tb_usuario.findUnique({
      where: { id_usuario },
      include: { persona: true },
    });

    if (!usuario || !usuario.persona) {
      res.status(404).json({ error: 'Usuario o persona no encontrada' });
      return;
    }

    const id_persona = usuario.persona.id_persona;

    //Calcular el total sumando precio*cantidad de cada producto
    let total = 0;
    const detalles = [];

    for (const item of productos) {
      const prod = await prisma.tb_producto.findUnique({
        where: { id_producto: item.id_producto },
      });

      if (!prod || !prod.status) {
        res.status(404).json({ error: `Producto con id ${item.id_producto} no encontrado o no disponible` });
        return;
      }

      if (prod.stock === null || prod.stock < item.cantidad) {
        res.status(400).json({ error: `Stock insuficiente para el producto ${prod.nombre_producto}` });
        return;
      }

      if (prod.precio_producto === null) {
        res.status(400).json({ error: `Precio no definido para el producto ${prod.nombre_producto}` });
        return;
      }

      const subtotal = prod.precio_producto * item.cantidad;
      total += subtotal;

      detalles.push({
        id_detalle: uuidv4(),
        id_producto: item.id_producto,
        cantidad: item.cantidad,
        precio_unit: prod.precio_producto,
      });
    }

    // Actualiza stock
    for (const item of productos) {
      await prisma.tb_producto.update({
        where: { id_producto: item.id_producto },
        data: {
          stock: {
            decrement: item.cantidad,
          },
        },
      });
    }

    // Prisma requiere que detalles sea un array de objetos con los campos requeridos por tb_detalle_ordenes
    const nuevaOrden = await prisma.tb_ordenes.create({
      data: {
        id_orden: uuidv4(),
        id_persona,
        total,
        detalles: {
          create: detalles.map(det => ({
            id_detalle: det.id_detalle,
            id_producto: det.id_producto,
            cantidad: det.cantidad,
            precio_unit: det.precio_unit,
          })),
        },
      },
      include: {
        detalles: {
          include: {
            producto: true,
          },
        },
      },
    });

    res.status(201).json({ 
      message: 'Compra registrada exitosamente',
      orden: nuevaOrden,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al procesar la compra' });
  }
});

export default router;  
