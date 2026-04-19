import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

// GET /api/salles
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM salles ORDER BY nom ASC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur salles:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST /api/salles
router.post('/', async (req, res) => {
  try {
    const { code, nom, capacite, type } = req.body;
    const result = await pool.query(
      'INSERT INTO salles (code, nom, capacite, type) VALUES ($1, $2, $3, $4) RETURNING *',
      [code, nom, capacite, type]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erreur création salle:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// PUT /api/salles/:id
router.put('/:id', async (req, res) => {
  try {
    const { code, nom, capacite, type } = req.body;
    const result = await pool.query(
      'UPDATE salles SET code = $1, nom = $2, capacite = $3, type = $4 WHERE id = $5 RETURNING *',
      [code, nom, capacite, type, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Salle non trouvée' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur mise à jour salle:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// DELETE /api/salles/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM salles WHERE id = $1 RETURNING *',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Salle non trouvée' });
    }
    res.json({ message: 'Salle supprimée' });
  } catch (error) {
    console.error('Erreur suppression salle:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

export { router };