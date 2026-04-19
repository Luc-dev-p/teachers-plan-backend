import Utilisateur from '../models/Utilisateur.js';
import Enseignant from '../models/Enseignant.js';
import { genererToken, comparerMotDePasse, hacherMotDePasse } from '../config/auth.js';
import JournalAction from '../models/JournalAction.js';

export const connexion = async (req, res) => {
  try {
    const { email, mot_de_passe } = req.body;

    if (!email || !mot_de_passe) {
      return res.status(400).json({ succes: false, message: 'Email et mot de passe requis' });
    }

    const utilisateur = await Utilisateur.trouverParEmail(email);
    if (!utilisateur || !utilisateur.actif) {
      return res.status(401).json({ succes: false, message: 'Identifiants incorrects' });
    }

    const valide = await comparerMotDePasse(mot_de_passe, utilisateur.mot_de_passe);
    if (!valide) {
      return res.status(401).json({ succes: false, message: 'Identifiants incorrects' });
    }

    const enseignant = await Enseignant.trouverParUtilisateurId(utilisateur.id);

    await JournalAction.enregistrer({
      utilisateur_id: utilisateur.id,
      action: 'CONNEXION',
      entite: 'authentification',
      adresse_ip: req.ip,
    });

    const token = genererToken({
      ...utilisateur,
      enseignant_id: enseignant?.id,
    });

    res.json({
      succes: true,
      token,
      utilisateur: {
        id: utilisateur.id,
        email: utilisateur.email,
        nom: utilisateur.nom,
        prenom: utilisateur.prenom,
        role: utilisateur.role,
        enseignant_id: enseignant?.id,
        matricule: enseignant?.matricule,
      },
    });
  } catch (erreur) {
    res.status(500).json({ succes: false, message: erreur.message });
  }
};

export const profil = async (req, res) => {
  try {
    const utilisateur = await Utilisateur.trouverParId(req.utilisateur.id);
    if (!utilisateur) {
      return res.status(404).json({ succes: false, message: 'Utilisateur non trouvé' });
    }

    const enseignant = await Enseignant.trouverParUtilisateurId(req.utilisateur.id);

    res.json({
      succes: true,
      utilisateur: {
        ...utilisateur,
        enseignant: enseignant || null,
      },
    });
  } catch (erreur) {
    res.status(500).json({ succes: false, message: erreur.message });
  }
};