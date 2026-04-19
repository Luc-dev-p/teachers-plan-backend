import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

// GET /api/heures
router.get('/', async (req, res) => {
  try {
    const { enseignant_id, annee_academique_id, mois } = req.query;

    let sql = `SELECT he.*, u.nom as enseignant_nom, u.prenom as enseignant_prenom, aa.libelle as annee_academique
               FROM heures_effectuees he
               LEFT JOIN enseignants e ON he.enseignant_id = e.id
               LEFT JOIN utilisateurs u ON e.utilisateur_id = u.id
               LEFT JOIN annees_academiques aa ON he.annee_academique_id = aa.id
               WHERE 1=1`;
    const params = [];
    let index = 1;

    if (enseignant_id) {
      sql += ` AND he.enseignant_id = $${index++}`;
      params.push(enseignant_id);
    }
    if (annee_academique_id) {
      sql += ` AND he.annee_academique_id = $${index++}`;
      params.push(annee_academique_id);
    }
    if (mois) {
      sql += ` AND he.mois = $${index++}`;
      params.push(mois);
    }

    sql += ' ORDER BY he.mois ASC, u.nom ASC';

    const result = await pool.query(sql, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur heures:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/heures/total/:enseignant_id
router.get('/total/:enseignant_id', async (req, res) => {
  try {
    const { annee_academique_id } = req.query;

    let sql = `SELECT 
      COUNT(*) as nombre_seances,
      SUM(he.heures_reelles) as total_heures_reelles,
      SUM(he.heures_equiv_td) as total_heures_equiv_td,
      SUM(he.montant_calcule) as total_montant
      FROM heures_effectuees he
      WHERE he.enseignant_id = $1`;
    const params = [req.params.enseignant_id];
    let index = 2;

    if (annee_academique_id) {
      sql += ` AND he.annee_academique_id = $${index++}`;
      params.push(annee_academique_id);
    }

    const result = await pool.query(sql, params);
    const row = result.rows[0];
    res.json({
      nombre_seances: parseInt(row.nombre_seances || 0),
      total_heures_reelles: parseFloat(row.total_heures_reelles || 0),
      total_heures_equiv_td: parseFloat(row.total_heures_equiv_td || 0),
      total_montant: parseFloat(row.total_montant || 0),
    });
  } catch (error) {
    console.error('Erreur total heures:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST /api/heures
router.post('/', async (req, res) => {
  try {
    const { enseignant_id, seance_cours_id, annee_academique_id, type_seance, heures_reelles, coefficient, heures_equiv_td, taux_horaire, montant_calcule, mois } = req.body;

    const result = await pool.query(
      `INSERT INTO heures_effectuees (enseignant_id, seance_cours_id, annee_academique_id, type_seance, heures_reelles, coefficient, heures_equiv_td, taux_horaire, montant_calcule, mois)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [enseignant_id, seance_cours_id, annee_academique_id, type_seance, heures_reelles, coefficient, heures_equiv_td, taux_horaire, montant_calcule || 0, mois]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erreur création heures:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

export { router };