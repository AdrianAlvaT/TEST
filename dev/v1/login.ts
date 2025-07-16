import prisma from '../../prismaClient';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';

const SECRET = 'secret'; // Reemplázalo con process.env.SECRET en producción

const loginUsuario = async (req: Request, res: Response): Promise<void> => {
  const { usuario, password } = req.body;

  try {
    const user = await prisma.tb_usuario.findUnique({
      where: { usuario },
    });
    console.log(user);

    if (!user) {
      res.status(401).json({ error: 'Credenciales inválidas' });
      return;
    }

    const valid = await bcrypt.compare(password, user.password!);
    console.log(valid);
    if (!valid) {
      res.status(401).json({ error: 'Credenciales inválidas' });
      return;
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
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Error desconocido' });
    }
  }
};

export default loginUsuario;