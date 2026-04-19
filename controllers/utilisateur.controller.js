import Utilisateur from '../models/Utilisateur.js';
import { hacherMotDePasse, comparerMotDePasse } from '../config/auth.js';
import { roleMiddleware } from '../middlewares/role.middleware.js';

export const lister = async (req, res) => {
  try {
    const donnees = await Utilisateur.lister();
    res.json({ succes: true, donnees });
  } catch (erreur) {
    res.status(500).json({ succes: false, message: erreur.message });
  }
};

export const modifierMotDePasse = async (req, res) => {
  try {
    if (req.utilisateur.role === 'enseignant' && req.utilisateur.id !== req.params.id) {
      return res.status(403).json({ succes: false, message: 'Accès refusé' });
    }

    const { ancien_mot_de_passe, nouveau_mot_de_passe } = req.body;
    if (!ancien_mot_de_passe || !nouveau_mot_de_passe) {
      return res.status(400).json({ succes: false, message: 'Ancien et nouveau mot de passe requis' });
    }

    const utilisateur = await Utilisateur.trouverParId(req.params.id);
    if (!utilisateur) {
      return res.status(404).json({ succes: false, message: 'Utilisateur non trouvé' });
    }

    const valide = await comparerMotDePasse(ancien_mot_de_passe, utilisateur.mot_de_passe);
    if (!valide) {
      return res.status(401).json({ succes: false, message: 'Ancien mot de passe incorrect' });
    }

    const hash = await hacherMotDePasse(nouveau_mot_de_passe);
    await Utilisateur.modifierMotDePasse(req.params.id, hash);

    res.json({ succes: true, message: 'Mot de passe modifié' });
  } catch (erreur) {
    res.status(500).json({ succes: false, message: erreur.message });
  }
};

export const reinitialiserMotDePasse = async (req, res) => {
  try {
    const hash = await hacherMotDePasse('changer123');
    await Utilisateur.modifierMotDePasse(req.params.id, hash);
    res.json({ succes: true, message: 'Mot de passe réinitialisé à "changer123"' });
  } catch (erreur) {
    res.status(500).json({ succes: false, message: erreur.message });
  }
};