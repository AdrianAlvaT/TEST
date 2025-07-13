import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
const SECRET = 'secret'; // ¡Ponlo en .env si estás en producción!

const authMiddleware = (rolesPermitidos: string[] = []) => {
  return (req: Request, res: Response, next: NextFunction ) => {
    const authHeader = req.headers.authorization;

    console.log(authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    const token = authHeader.split(' ')[1];

    const payload = jwt.verify(token, SECRET);

    if(typeof payload !== 'string' && 'rol' in payload) {
        if (rolesPermitidos.length && !rolesPermitidos.includes(payload.rol)) {
          return res.status(403).json({ error: 'Token inválido' });
        }
        next();
      }else{
        return res.status(401).json({ error: 'Token inválido' });
    }
  };
};

export default verificarToken;