const prisma = require('../../../prismaClient');


const listProducts = async (req, res) => {
    try {
      const productos = await prisma.tb_producto.findMany();
      res.json(productos);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

module.exports = listProducts;