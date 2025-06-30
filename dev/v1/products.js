const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { v4: uuidv4 } = require('uuid');
const verificarToken = require('../../middlewares/auth');

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

router.post('/addproducts', verificarToken(['admin']), async (req, res) => {

  const { nombre_producto, sku_producto, precio_producto, stock } = req.body;
  
  if(!nombre_producto || !sku_producto || !precio_producto || !stock){
    return res.status(400).json({
      error: 'Faltan campos obligatorios: nombre_producto, sku_producto, precio_producto y stock',
    });
  }
  
  try {
    if (req.user.rol !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado: se requiere rol de administrador' });
    }

    const nuevoProducto = await prisma.tb_producto.create({
      data: {
        id_producto: uuidv4(),
        nombre_producto,
        sku_producto,
        precio_producto,
        stock,
        status: true,
      },
    });
    console.log(nuevoProducto);
    return res.status(201).json({message: 'Producto creado exitosamente', nuevoProducto});
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Error al crear el producto' });
  }
});

router.put('/:id', verificarToken(['admin']), async (req, res) => {
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

router.delete('/:id', verificarToken(['admin']), async (req, res) => {
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
