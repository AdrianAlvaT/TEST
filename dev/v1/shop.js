const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/*
 Endpoint para que el cliente vea todos los productos disponibles
 */
router.get('/products', async (req, res) => {
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
router.post('/comprar', async (req, res) => {
  const { cliente, productos } = req.body;

  if (!cliente || !Array.isArray(productos) || productos.length === 0) {
    return res.status(400).json({ error: 'Debe enviar el nombre del cliente y un arreglo de productos' });
  }

  try {
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

    //solo devolvemos confirmación:
    res.status(201).json({ message: 'Compra registrada exitosamente', cliente, productos });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al procesar la compra' });
  }
});

module.exports = router;
