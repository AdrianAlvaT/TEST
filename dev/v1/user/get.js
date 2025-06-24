const prisma = require('../../../prismaClient');

const getUsuarioById = async (req, res) => {
  const { id } = req.params;
  try {
    const usuario = await prisma.tb_usuario.findUnique({
      where: { id_usuario: parseInt(id) },
    });

    if (!usuario) return res.status(404).json({ message: 'No encontrado' });
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = getUsuarioById;
