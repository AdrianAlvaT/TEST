const prisma = require('../../../prismaClient');

const listUsuarios = async (req, res) => {
  try {
    const usuarios = await prisma.tb_usuario.findMany();
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = listUsuarios;
