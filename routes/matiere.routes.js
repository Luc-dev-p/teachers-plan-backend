import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

// GET /api/matieres
router.get('/', async (req, res) => {
  try {
    const { departement_id } = req.query;
    let sql = `SELECT m.*, d.nom as departement_nom
               FROM matieres m
               LEFT JOIN departements d ON m.departement_id = d.id
               WHERE 1=1`;
    const params = [];
    let index = 1;

    if (departement_id) {
      sql += ` AND m.departement_id = $${index++}`;
      params.push(departement_id);
    }

    sql += ' ORDER BY m.nom ASC';

    const result = await pool.query(sql, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur matières:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/matieres/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT m.*, d.nom as departement_nom FROM matieres m LEFT JOIN departements d ON m.departement_id = d.id WHERE m.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Matière non trouvée' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur matière:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST /api/matieres
router.post('/', async (req, res) => {
  try {
    const { code, nom, description, credit, heures_cm, heures_td, heures_tp, type, departement_id } = req.body;

    const result = await pool.query(
      `INSERT INTO matieres (code, nom, description, credit, heures_cm, heures_td, heures_tp, type, departement_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [code, nom, description, credit || 2, heures_cm || 0, heures_td || 0, heures_tp || 0, type || 'fondamentale', departement_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erreur création matière:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// PUT /api/matieres/:id
router.put('/:id', async (req, res) => {
  try {
    const { code, nom, description, credit, heures_cm, heures_td, heures_tp, type, departement_id } = req.body;
    const result = await pool.query(
      `UPDATE matieres SET code = $1, nom = $2, description = $3, credit = $4, heures_cm = $5, heures_td = $6, heures_tp = $7, type = $8, departement_id = $9, modifie_le = CURRENT_TIMESTAMP
       WHERE id = $10 RETURNING *`,
      [code, nom, description, credit, heures_cm, heures_td, heures_tp, type, departement_id, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Matière non trouvée' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur mise à jour matière:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// DELETE /api/matieres/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM matieres WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Matière non trouvée' });
    }
    res.json({ message: 'Matière supprimée' });
  } catch (error) {
    console.error('Erreur suppression matière:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

export { router };