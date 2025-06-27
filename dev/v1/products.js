const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.get('/',async (req, res) => {
  try {
    const products = await prisma.tb_producto.findMany({
      where: { status: true },
    });
    res.json(products);
  } catch (error) {
    console.error('ERROR REAL:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const product = await prisma.tb_producto.findUnique({
      where: { id },
    });
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el producto' });
  }
});

router.post('/', async (req, res) => {

  const { nombre_producto, sku_producto, precio_producto, stock } = req.body;
  try {
    const nuevoProducto = await prisma.tb_producto.create({
      data: {
        nombre_producto,
        sku_producto,
        precio_producto,
        stock,
        status: true,
      },
    });
    res.status(201).json(nuevoProducto);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el producto' });
  }
});

router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { nombre_producto, sku_producto, precio_producto, stock, status } = req.body;
  try {
    const productoActualizado = await prisma.tb_producto.update({
      where: { id_producto: id },
      data: { nombre_producto, sku_producto, precio_producto: parseInt(precio_producto), stock: parseInt(stock), status},
    });
    res.json(productoActualizado);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el producto' });
  }
});

router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const productoDesactivado = await prisma.tb_producto.update({
      where: { id_producto: id },
      data: { status: false },
    });
    res.json({ message: 'Producto desactivado', producto: productoDesactivado });
  } catch (error) {
    console.error(
      'Érror al desactivar: ', error
    );
    res.status(500).json({ error: 'Error al desactivar el producto' });
  }
});

module.exports = router;
