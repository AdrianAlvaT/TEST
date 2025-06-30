const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const verificarToken = require('../../middlewares/auth');

/*
 Endpoint para que el cliente vea todos los productos disponibles
 */
router.get('/products', verificarToken(), async (req, res) => {
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
router.post('/comprar', verificarToken(), async (req, res) => {
  const id_usuario = req.user.id;
  const { productos } = req.body;

  if (!productos || !Array.isArray(productos) || productos.length === 0) {
    return res.status(400).json({ error: 'Debe enviar productos a comprar' });
  }

  try {

    // 1) Obtener usuario con su persona
    const usuario = await prisma.tb_usuario.findUnique({
      where: { id_usuario },
      include: { persona: true },
    });

    if (!usuario || !usuario.persona) {
      return res.status(404).json({ error: 'Usuario o persona no encontrada' });
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
        return res.status(404).json({ error: `Producto con id ${item.id_producto} no encontrado o no disponible` });
      }

      if (prod.stock < item.cantidad) {
        return res.status(400).json({ error: `Stock insuficiente para el producto ${prod.nombre_producto}` });
      }

      const subtotal = prod.precio_producto * item.cantidad;
      total += subtotal;

      detalles.push({
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

    const nuevaOrden = await prisma.tb_ordenes.create({
      data: {
        id_persona,
        total,
        detalles: {
          create: detalles,
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

    //solo devolvemos confirmación:
    return res.status(201).json({ 
      message: 'Compra registrada exitosamente',
      orden: nuevaOrden,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al procesar la compra' });
  }
});

module.exports = router;
