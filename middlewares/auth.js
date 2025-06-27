const jwt = require('jsonwebtoken');
const SECRET = 'secret'; // ¡Ponlo en .env si estás en producción!

const authMiddleware = (rolesPermitidos = []) => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;

    console.log(authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    const token = authHeader.split(' ')[1];

    try {
      const payload = jwt.verify(token, SECRET);


      if (rolesPermitidos.length && !rolesPermitidos.includes(payload.rol)) {
        return res.status(403).json({ error: 'Acceso denegado: rol no autorizado' });
      }

      req.user = payload; // Guarda el usuario en el request
      next(); // Pasa al siguiente middleware/controlador
    } catch (err) {
      console.log(err);
      return res.status(401).json({ error: 'Token inválido' });
    }
  };
};

module.exports = authMiddleware;