const prisma = require('../../../prismaClient');

const createProduct = async (req, res) => {
  try {
    const { nombre_producto, sku_producto, precio_producto, stock } = req.body;

    const nuevoProducto = await prisma.tb_producto.create({
      data: {
        nombre_producto,
        sku_producto,
        precio_producto,
        stock,
      },
    });

    res.status(201).json(nuevoProducto);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = createProduct;
