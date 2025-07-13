import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
const SECRET = 'secret'; // ¡Ponlo en .env si estás en producción!

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        rol: string;
      };
    }
  }
}

const verificarToken = (rolesPermitidos: string[] = []) => {
  return (req: Request, res: Response, next: NextFunction ): void => {
    const authHeader = req.headers.authorization;

    console.log(authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Token no proporcionado' });
      return;
    }

    const token = authHeader.split(' ')[1];

    try {
      const payload = jwt.verify(token, SECRET) as jwt.JwtPayload;

      if(typeof payload !== 'string' && 'rol' in payload) {
        if (rolesPermitidos.length && !rolesPermitidos.includes(payload.rol)) {
          res.status(403).json({ error: 'Acceso denegado: rol no autorizado' });
          return;
        }
        
        // Adjunta la información del usuario al objeto req
        req.user = {
          id: payload.id,
          rol: payload.rol
        };
        
        next();
      } else {
        res.status(401).json({ error: 'Token inválido' });
        return;
      }
    } catch (error) {
      res.status(401).json({ error: 'Token inválido o expirado' });
      return;
    }
  };
};

export default verificarToken;