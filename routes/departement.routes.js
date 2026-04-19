import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

// GET /api/departements
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM departements ORDER BY nom ASC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur départements:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST /api/departements
router.post('/', async (req, res) => {
  try {
    const { code, nom } = req.body;
    const result = await pool.query(
      'INSERT INTO departements (code, nom) VALUES ($1, $2) RETURNING *',
      [code, nom]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erreur création département:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// PUT /api/departements/:id
router.put('/:id', async (req, res) => {
  try {
    const { code, nom } = req.body;
    const result = await pool.query(
      'UPDATE departements SET code = $1, nom = $2 WHERE id = $3 RETURNING *',
      [code, nom, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Département non trouvé' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur mise à jour département:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// DELETE /api/departements/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM departements WHERE id = $1 RETURNING *',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Département non trouvé' });
    }
    res.json({ message: 'Département supprimé' });
  } catch (error) {
    console.error('Erreur suppression département:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

export { router };