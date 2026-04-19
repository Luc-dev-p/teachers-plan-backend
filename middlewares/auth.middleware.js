import { verifierToken } from '../config/auth.js';

export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Porteur ')) {
      return res.status(401).json({ succes: false, message: 'Token manquant' });
    }

    const token = authHeader.split(' ')[1];
    const decode = verifierToken(token);
    req.utilisateur = decode;
    next();
  } catch (erreur) {
    return res.status(401).json({ succes: false, message: 'Token invalide ou expiré' });
  }
};