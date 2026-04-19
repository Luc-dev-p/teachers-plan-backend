import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

// GET /api/classes
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*, f.nom as filiere_nom, n.nom as niveau_nom 
       FROM classes c 
       LEFT JOIN filieres f ON c.filiere_id = f.id 
       LEFT JOIN niveaux n ON c.niveau_id = n.id 
       ORDER BY c.nom ASC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur classes:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST /api/classes
router.post('/', async (req, res) => {
  try {
    const { code, nom, filiere_id, niveau_id } = req.body;
    const result = await pool.query(
      'INSERT INTO classes (code, nom, filiere_id, niveau_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [code, nom, filiere_id, niveau_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erreur création classe:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// PUT /api/classes/:id
router.put('/:id', async (req, res) => {
  try {
    const { code, nom, filiere_id, niveau_id } = req.body;
    const result = await pool.query(
      'UPDATE classes SET code = $1, nom = $2, filiere_id = $3, niveau_id = $4 WHERE id = $5 RETURNING *',
      [code, nom, filiere_id, niveau_id, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Classe non trouvée' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur mise à jour classe:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// DELETE /api/classes/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM classes WHERE id = $1 RETURNING *',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Classe non trouvée' });
    }
    res.json({ message: 'Classe supprimée' });
  } catch (error) {
    console.error('Erreur suppression classe:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

export { router };