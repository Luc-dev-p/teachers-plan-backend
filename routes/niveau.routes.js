import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

// GET /api/filieres
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT f.*, d.nom as departement_nom FROM filieres f LEFT JOIN departements d ON f.departement_id = d.id ORDER BY f.nom ASC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur filières:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST /api/filieres
router.post('/', async (req, res) => {
  try {
    const { code, nom, departement_id } = req.body;
    const result = await pool.query(
      'INSERT INTO filieres (code, nom, departement_id) VALUES ($1, $2, $3) RETURNING *',
      [code, nom, departement_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erreur création filière:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// PUT /api/filieres/:id
router.put('/:id', async (req, res) => {
  try {
    const { code, nom, departement_id } = req.body;
    const result = await pool.query(
      'UPDATE filieres SET code = $1, nom = $2, departement_id = $3 WHERE id = $4 RETURNING *',
      [code, nom, departement_id, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Filière non trouvée' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur mise à jour filière:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// DELETE /api/filieres/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM filieres WHERE id = $1 RETURNING *',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Filière non trouvée' });
    }
    res.json({ message: 'Filière supprimée' });
  } catch (error) {
    console.error('Erreur suppression filière:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

export { router };