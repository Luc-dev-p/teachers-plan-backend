import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

// GET /api/exports/enseignants
router.get('/enseignants', async (req, res) => {
  try {
    const { annee_academique_id } = req.query;
    let sql = `SELECT u.nom as enseignant_prenom, u.prenom as enseignant_nom, u.email,
       e.matricule, e.categorie, e.grade, e.statut,
       d.nom as departement,
       COALESCE(SUM(he.heures_reelles), 0) as total_heures_reelles,
       COALESCE(SUM(he.heures_equiv_td), 0) as total_heures_equiv_td,
       COALESCE(SUM(he.montant_calcule), 0) as total_montant
       FROM enseignants e
       JOIN utilisateurs u ON e.utilisateur_id = u.id
       LEFT JOIN departements d ON e.departement_id = d.id
       LEFT JOIN heures_effectuees he ON e.id = he.enseignant_id`;
    const params = [];
    let index = 1;

    if (annee_academique_id) {
      sql += ` WHERE he.annee_academique_id = $${index++}`;
      params.push(annee_academique_id);
    }

    sql += ' GROUP BY u.nom, u.prenom, u.email, e.matricule, e.categorie, e.grade, e.statut, d.nom ORDER BY u.nom ASC';

    const result = await pool.query(sql, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur export enseignants:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/exports/seances
router.get('/seances', async (req, res) => {
  try {
    const { annee_academique_id } = req.query;
    let sql = `SELECT sc.date, sc.heure_debut, sc.heure_fin, sc.type_seance, sc.nombre_heures, sc.statut,
       u.nom as enseignant_nom, u.prenom as enseignant_prenom,
       m.nom as matiere_nom, c.nom as classe_nom, s.nom as salle_nom
       FROM seances_cours sc
       LEFT JOIN enseignants e ON sc.enseignant_id = e.id
       LEFT JOIN utilisateurs u ON e.utilisateur_id = u.id
       LEFT JOIN matieres m ON sc.matiere_id = m.id
       LEFT JOIN classes c ON sc.classe_id = c.id
       LEFT JOIN salles s ON sc.salle_id = s.id
       WHERE 1=1`;
    const params = [];
    let index = 1;

    if (annee_academique_id) {
      sql += ` AND sc.annee_academique_id = $${index++}`;
      params.push(annee_academique_id);
    }

    sql += ' ORDER BY sc.date DESC';

    const result = await pool.query(sql, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur export séances:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/exports/paiements
router.get('/paiements', async (req, res) => {
  try {
    const { annee_academique_id, mois } = req.query;
    let sql = `SELECT he.*, u.nom as enseignant_nom, u.prenom as enseignant_prenom, aa.libelle as annee_academique
               FROM heures_effectuees he
               LEFT JOIN enseignants e ON he.enseignant_id = e.id
               LEFT JOIN utilisateurs u ON e.utilisateur_id = u.id
               LEFT JOIN annees_academiques aa ON he.annee_academique_id = aa.id
               WHERE 1=1`;
    const params = [];
    let index = 1;

    if (annee_academique_id) {
      sql += ` AND he.annee_academique_id = $${index++}`;
      params.push(annee_academique_id);
    }
    if (mois) {
      sql += ` AND he.mois = $${index++}`;
      params.push(mois);
    }

    sql += ' ORDER BY u.nom ASC, he.mois ASC';

    const result = await pool.query(sql, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur export paiements:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

export { router };