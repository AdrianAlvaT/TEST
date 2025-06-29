const prisma = require('../../prismaClient');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SECRET = 'secret'; // Reemplázalo con process.env.SECRET en producción

const loginUsuario = async (req, res) => {
  const { usuario, password } = req.body;

  try {
    const user = await prisma.tb_usuario.findUnique({
      where: { usuario },
    });
    console.log(user);

    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const valid = await bcrypt.compare(password, user.password);
    console.log(valid);
    if (!valid) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    //generar el token con id y rol
    const token = jwt.sign(
      { id: user.id_usuario, rol: user.rol },
      SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      message: 'Login exitoso',
      token,
      usuario: user.usuario,
      rol: user.rol,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = loginUsuario;