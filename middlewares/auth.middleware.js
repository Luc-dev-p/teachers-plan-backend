import jwt from 'jsonwebtoken';

function verifierToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token manquant' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.utilisateur = decoded;
    next();
  } catch (error) {
    console.error('Erreur vérification token:', error);
    res.status(401).json({ message: 'Token invalide' });
  }
}

function verifierRole(...roles) {
  return (req, res, next) => {
    if (!req.utilisateur) {
      return res.status(401).json({ message: 'Non authentifié' });
    }
    if (!roles.includes(req.utilisateur.role)) {
      return res.status(403).json({ message: 'Accès refusé' });
    }
    next();
  };
}

// Alias pour compatibilité avec les imports existants
const authMiddleware = verifierToken;

export { verifierToken, verifierRole, authMiddleware };