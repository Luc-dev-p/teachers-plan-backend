import Utilisateur from '../models/Utilisateur.js';
import Enseignant from '../models/Enseignant.js';
import Departement from '../models/Departement.js';
import Filiere from '../models/Filiere.js';
import Niveau from '../models/Niveau.js';
import Classe from '../models/Classe.js';
import Salle from '../models/Salle.js';
import { hacherMotDePasse } from '../config/auth.js';
import { genererMotDePasse } from '../utils/generatePassword.js';

// ─── ENSEIGNANTS ───

export const listerEnseignants = async (req, res) => {
  try {
    const filtres = {
      recherche: req.query.recherche,
      departement_id: req.query.departement_id,
      statut: req.query.statut,
      categorie: req.query.categorie,
    };

    if (req.utilisateur.role === 'enseignant') {
      const enseignant = await Enseignant.trouverParId(req.utilisateur.enseignant_id);
      return res.json({ succes: true, donnees: enseignant ? [enseignant] : [] });
    }

    const donnees = await Enseignant.lister(filtres);
    res.json({ succes: true, donnees });
  } catch (erreur) {
    res.status(500).json({ succes: false, message: erreur.message });
  }
};

export const creerEnseignant = async (req, res) => {
  try {
    const { email, nom, prenom, matricule, telephone, date_naissance, categorie, grade, departement_id } = req.body;

    if (!email || !nom || !prenom || !matricule) {
      return res.status(400).json({ succes: false, message: 'Email, nom, prénom et matricule requis' });
    }

    const motDePasse = genererMotDePasse();
    const hash = await hacherMotDePasse(motDePasse);

    const utilisateur = await Utilisateur.creer({ email, mot_de_passe: hash, nom, prenom, role: 'enseignant' });

    const enseignant = await Enseignant.creer({
      matricule, utilisateur_id: utilisateur.id,
      telephone, date_naissance, categorie, grade, departement_id,
    });

    res.status(201).json({
      succes: true,
      donnees: enseignant,
      mot_de_passe_temporaire: motDePasse,
      message: 'Enseignant créé avec succès',
    });
  } catch (erreur) {
    if (erreur.code === '23505') {
      return res.status(409).json({ succes: false, message: 'Email ou matricule déjà existant' });
    }
    res.status(500).json({ succes: false, message: erreur.message });
  }
};

export const modifierEnseignant = async (req, res) => {
  try {
    const { nom, prenom, telephone, date_naissance, categorie, grade, departement_id, statut, actif } = req.body;

    await Utilisateur.modifier(req.params.id, { nom, prenom, actif });

    const enseignant = await Enseignant.modifier(req.params.id, {
      telephone, date_naissance, categorie, grade, departement_id, statut,
    });

    res.json({ succes: true, donnees: enseignant, message: 'Enseignant modifié' });
  } catch (erreur) {
    res.status(500).json({ succes: false, message: erreur.message });
  }
};

export const supprimerEnseignant = async (req, res) => {
  try {
    const resultat = await Enseignant.supprimer(req.params.id);
    if (!resultat) {
      return res.status(404).json({ succes: false, message: 'Enseignant non trouvé' });
    }
    res.json({ succes: true, message: 'Enseignant supprimé' });
  } catch (erreur) {
    res.status(500).json({ succes: false, message: erreur.message });
  }
};

// ─── DEPARTEMENTS ───

export const listerDepartements = async (req, res) => {
  try {
    const donnees = await Departement.lister({ recherche: req.query.recherche });
    res.json({ succes: true, donnees });
  } catch (erreur) {
    res.status(500).json({ succes: false, message: erreur.message });
  }
};

export const creerDepartement = async (req, res) => {
  try {
    const { code, nom, description } = req.body;
    if (!code || !nom) {
      return res.status(400).json({ succes: false, message: 'Code et nom requis' });
    }
    const donnees = await Departement.creer({ code, nom, description });
    res.status(201).json({ succes: true, donnees, message: 'Département créé' });
  } catch (erreur) {
    if (erreur.code === '23505') {
      return res.status(409).json({ succes: false, message: 'Ce code existe déjà' });
    }
    res.status(500).json({ succes: false, message: erreur.message });
  }
};

export const modifierDepartement = async (req, res) => {
  try {
    const donnees = await Departement.modifier(req.params.id, req.body);
    if (!donnees) {
      return res.status(404).json({ succes: false, message: 'Département non trouvé' });
    }
    res.json({ succes: true, donnees, message: 'Département modifié' });
  } catch (erreur) {
    res.status(500).json({ succes: false, message: erreur.message });
  }
};

export const supprimerDepartement = async (req, res) => {
  try {
    const resultat = await Departement.supprimer(req.params.id);
    if (!resultat) {
      return res.status(404).json({ succes: false, message: 'Département non trouvé' });
    }
    res.json({ succes: true, message: 'Département supprimé' });
  } catch (erreur) {
    res.status(500).json({ succes: false, message: erreur.message });
  }
};

// ─── FILIERES ───

export const listerFilieres = async (req, res) => {
  try {
    const donnees = await Filiere.lister({
      recherche: req.query.recherche,
      departement_id: req.query.departement_id,
    });
    res.json({ succes: true, donnees });
  } catch (erreur) {
    res.status(500).json({ succes: false, message: erreur.message });
  }
};

export const creerFiliere = async (req, res) => {
  try {
    const { code, nom, description, departement_id } = req.body;
    if (!code || !nom || !departement_id) {
      return res.status(400).json({ succes: false, message: 'Code, nom et département requis' });
    }
    const donnees = await Filiere.creer({ code, nom, description, departement_id });
    res.status(201).json({ succes: true, donnees, message: 'Filière créée' });
  } catch (erreur) {
    if (erreur.code === '23505') {
      return res.status(409).json({ succes: false, message: 'Ce code existe déjà' });
    }
    res.status(500).json({ succes: false, message: erreur.message });
  }
};

export const modifierFiliere = async (req, res) => {
  try {
    const donnees = await Filiere.modifier(req.params.id, req.body);
    if (!donnees) {
      return res.status(404).json({ succes: false, message: 'Filière non trouvée' });
    }
    res.json({ succes: true, donnees, message: 'Filière modifiée' });
  } catch (erreur) {
    res.status(500).json({ succes: false, message: erreur.message });
  }
};

export const supprimerFiliere = async (req, res) => {
  try {
    const resultat = await Filiere.supprimer(req.params.id);
    if (!resultat) {
      return res.status(404).json({ succes: false, message: 'Filière non trouvée' });
    }
    res.json({ succes: true, message: 'Filière supprimée' });
  } catch (erreur) {
    res.status(500).json({ succes: false, message: erreur.message });
  }
};

// ─── NIVEAUX ───

export const listerNiveaux = async (req, res) => {
  try {
    const donnees = await Niveau.lister();
    res.json({ succes: true, donnees });
  } catch (erreur) {
    res.status(500).json({ succes: false, message: erreur.message });
  }
};

export const creerNiveau = async (req, res) => {
  try {
    const { code, nom, ordre } = req.body;
    if (!code || !nom) {
      return res.status(400).json({ succes: false, message: 'Code et nom requis' });
    }
    const donnees = await Niveau.creer({ code, nom, ordre });
    res.status(201).json({ succes: true, donnees, message: 'Niveau créé' });
  } catch (erreur) {
    if (erreur.code === '23505') {
      return res.status(409).json({ succes: false, message: 'Ce code existe déjà' });
    }
    res.status(500).json({ succes: false, message: erreur.message });
  }
};

export const modifierNiveau = async (req, res) => {
  try {
    const donnees = await Niveau.modifier(req.params.id, req.body);
    if (!donnees) {
      return res.status(404).json({ succes: false, message: 'Niveau non trouvé' });
    }
    res.json({ succes: true, donnees, message: 'Niveau modifié' });
  } catch (erreur) {
    res.status(500).json({ succes: false, message: erreur.message });
  }
};

export const supprimerNiveau = async (req, res) => {
  try {
    const resultat = await Niveau.supprimer(req.params.id);
    if (!resultat) {
      return res.status(404).json({ succes: false, message: 'Niveau non trouvé' });
    }
    res.json({ succes: true, message: 'Niveau supprimé' });
  } catch (erreur) {
    res.status(500).json({ succes: false, message: erreur.message });
  }
};

// ─── CLASSES ───

export const listerClasses = async (req, res) => {
  try {
    const donnees = await Classe.lister({
      recherche: req.query.recherche,
      filiere_id: req.query.filiere_id,
      niveau_id: req.query.niveau_id,
    });
    res.json({ succes: true, donnees });
  } catch (erreur) {
    res.status(500).json({ succes: false, message: erreur.message });
  }
};

export const creerClasse = async (req, res) => {
  try {
    const { nom, code, filiere_id, niveau_id, effectif } = req.body;
    if (!nom || !code || !filiere_id || !niveau_id) {
      return res.status(400).json({ succes: false, message: 'Nom, code, filière et niveau requis' });
    }
    const donnees = await Classe.creer({ nom, code, filiere_id, niveau_id, effectif });
    res.status(201).json({ succes: true, donnees, message: 'Classe créée' });
  } catch (erreur) {
    if (erreur.code === '23505') {
      return res.status(409).json({ succes: false, message: 'Ce code existe déjà' });
    }
    res.status(500).json({ succes: false, message: erreur.message });
  }
};

export const modifierClasse = async (req, res) => {
  try {
    const donnees = await Classe.modifier(req.params.id, req.body);
    if (!donnees) {
      return res.status(404).json({ succes: false, message: 'Classe non trouvée' });
    }
    res.json({ succes: true, donnees, message: 'Classe modifiée' });
  } catch (erreur) {
    res.status(500).json({ succes: false, message: erreur.message });
  }
};

export const supprimerClasse = async (req, res) => {
  try {
    const resultat = await Classe.supprimer(req.params.id);
    if (!resultat) {
      return res.status(404).json({ succes: false, message: 'Classe non trouvée' });
    }
    res.json({ succes: true, message: 'Classe supprimée' });
  } catch (erreur) {
    res.status(500).json({ succes: false, message: erreur.message });
  }
};

// ─── SALLES ───

export const listerSalles = async (req, res) => {
  try {
    const donnees = await Salle.lister({
      recherche: req.query.recherche,
      type: req.query.type,
    });
    res.json({ succes: true, donnees });
  } catch (erreur) {
    res.status(500).json({ succes: false, message: erreur.message });
  }
};

export const creerSalle = async (req, res) => {
  try {
    const { nom, code, capacite, type, batiment } = req.body;
    if (!nom || !code) {
      return res.status(400).json({ succes: false, message: 'Nom et code requis' });
    }
    const donnees = await Salle.creer({ nom, code, capacite, type, batiment });
    res.status(201).json({ succes: true, donnees, message: 'Salle créée' });
  } catch (erreur) {
    if (erreur.code === '23505') {
      return res.status(409).json({ succes: false, message: 'Ce code existe déjà' });
    }
    res.status(500).json({ succes: false, message: erreur.message });
  }
};

export const modifierSalle = async (req, res) => {
  try {
    const donnees = await Salle.modifier(req.params.id, req.body);
    if (!donnees) {
      return res.status(404).json({ succes: false, message: 'Salle non trouvée' });
    }
    res.json({ succes: true, donnees, message: 'Salle modifiée' });
  } catch (erreur) {
    res.status(500).json({ succes: false, message: erreur.message });
  }
};

export const supprimerSalle = async (req, res) => {
  try {
    const resultat = await Salle.supprimer(req.params.id);
    if (!resultat) {
      return res.status(404).json({ succes: false, message: 'Salle non trouvée' });
    }
    res.json({ succes: true, message: 'Salle supprimée' });
  } catch (erreur) {
    res.status(500).json({ succes: false, message: erreur.message });
  }
};