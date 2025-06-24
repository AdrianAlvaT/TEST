const prisma = require('../../../prismaClient');

const deleteUsuario = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.tb_usuario.delete({
      where: { id_usuario: parseInt(id) },
    });

    res.json({ message: 'Usuario eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = deleteUsuario;
