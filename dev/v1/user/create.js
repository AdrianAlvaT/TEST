const prisma = require('../../../prismaClient');
const bcrypt = require('bcrypt');


const createUsuario = async (req, res) => {
  try {
    const { usuario, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const nuevo = await prisma.tb_usuario.create({
      data: { usuario, password: hashedPassword  },
    });

    res.status(201).json(nuevo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = createUsuario;
