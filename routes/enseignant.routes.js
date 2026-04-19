import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

// GET /api/enseignants
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT e.*, u.nom, u.prenom, u.email, d.nom as departement_nom
       FROM enseignants e
       JOIN utilisateurs u ON e.utilisateur_id = u.id
       LEFT JOIN departements d ON e.departement_id = d.id
       ORDER BY u.nom ASC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur enseignants:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/enseignants/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT e.*, u.nom, u.prenom, u.email, d.nom as departement_nom
       FROM enseignants e
       JOIN utilisateurs u ON e.utilisateur_id = u.id
       LEFT JOIN departements d ON e.departement_id = d.id
       WHERE e.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Enseignant non trouvé' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur enseignant:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST /api/enseignants
router.post('/', async (req, res) => {
  try {
    const { matricule, utilisateur_id, departement_id, telephone, date_naissance, categorie, grade } = req.body;

    const result = await pool.query(
      `INSERT INTO enseignants (matricule, utilisateur_id, departement_id, telephone, date_naissance, categorie, grade)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [matricule, utilisateur_id, departement_id, telephone, date_naissance, categorie || 'Vacataire', grade]
    );

    const enseignant = result.rows[0];
    const userResult = await pool.query(
      'SELECT nom, prenom, email FROM utilisateurs WHERE id = $1',
      [utilisateur_id]
    );

    res.status(201).json({ ...enseignant, ...userResult.rows[0] });
  } catch (error) {
    console.error('Erreur création enseignant:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// PUT /api/enseignants/:id
router.put('/:id', async (req, res) => {
  try {
    const { departement_id, telephone, date_naissance, categorie, grade, statut } = req.body;
    const result = await pool.query(
      `UPDATE enseignants 
       SET departement_id = $1, telephone = $2, date_naissance = $3, categorie = $4, grade = $5, statut = $6, modifie_le = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING *`,
      [departement_id, telephone, date_naissance, categorie, grade, statut, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Enseignant non trouvé' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur mise à jour enseignant:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// DELETE /api/enseignants/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM enseignants WHERE id = $1 RETURNING *',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Enseignant non trouvé' });
    }
    res.json({ message: 'Enseignant supprimé' });
  } catch (error) {
    console.error('Erreur suppression enseignant:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/enseignants/:id/heures
router.get('/:id/heures', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT he.* FROM heures_effectuees he
       WHERE he.enseignant_id = $1
       ORDER BY he.mois ASC`,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur heures enseignant:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

export { router };