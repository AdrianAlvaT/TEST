const prisma = require('../../../prismaClient');
const bcrypt = require('bcrypt');


const updateUsuario = async (req, res) => {
  const { id } = req.params;
  const { usuario } = req.body;

  try {
    const actualizado = await prisma.tb_usuario.update({
      where: { id_usuario: parseInt(id) },
      data: { usuario },
    });

    res.json(actualizado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updatePassword = async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const paswordupdate = await prisma.tb_usuario.update({
      where: { id_usuario: parseInt(id) },
      data: { password: hashedPassword },
    });

    if (!paswordupdate) {
      return res.status(401).json({ error: 'Error al actualiza contraseña' });
    }

    res.json(paswordupdate.id_usuario);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }


}
module.exports = {updateUsuario, updatePassword};