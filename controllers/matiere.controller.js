import Matiere from '../models/Matiere.js';

export const lister = async (req, res) => {
  try {
    const donnees = await Matiere.lister({
      recherche: req.query.recherche,
      departement_id: req.query.departement_id,
      type: req.query.type,
    });
    res.json({ succes: true, donnees });
  } catch (erreur) {
    res.status(500).json({ succes: false, message: erreur.message });
  }
};

export const creer = async (req, res) => {
  try {
    const { code, nom, departement_id } = req.body;
    if (!code || !nom || !departement_id) {
      return res.status(400).json({ succes: false, message: 'Code, nom et département requis' });
    }
    const donnees = await Matiere.creer(req.body);
    res.status(201).json({ succes: true, donnees, message: 'Matière créée' });
  } catch (erreur) {
    if (erreur.code === '23505') {
      return res.status(409).json({ succes: false, message: 'Ce code existe déjà' });
    }
    res.status(500).json({ succes: false, message: erreur.message });
  }
};

export const modifier = async (req, res) => {
  try {
    const donnees = await Matiere.modifier(req.params.id, req.body);
    if (!donnees) {
      return res.status(404).json({ succes: false, message: 'Matière non trouvée' });
    }
    res.json({ succes: true, donnees, message: 'Matière modifiée' });
  } catch (erreur) {
    res.status(500).json({ succes: false, message: erreur.message });
  }
};

export const supprimer = async (req, res) => {
  try {
    const resultat = await Matiere.supprimer(req.params.id);
    if (!resultat) {
      return res.status(404).json({ succes: false, message: 'Matière non trouvée' });
    }
    res.json({ succes: true, message: 'Matière supprimée' });
  } catch (erreur) {
    res.status(500).json({ succes: false, message: erreur.message });
  }
};