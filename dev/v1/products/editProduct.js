const prisma = require('../../../prismaClient');

const editProduct = async (req, res) => {
  try {
    const { nombre_producto, sku_producto, precio_producto, stock } = req.body;

    const actualizar = await prisma.tb_producto.update({
      data: {
        nombre_producto,
        sku_producto,
        precio_producto,
        stock,
      },
    });

    res.status(201).json(actualizar);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = editProduct;
