import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

// GET /api/dashboard/statistiques
router.get('/statistiques', async (req, res) => {
  try {
    const enseignantsResult = await pool.query("SELECT COUNT(*) as total FROM enseignants WHERE statut = 'actif'");
    const seancesResult = await pool.query('SELECT COUNT(*) as total FROM seances_cours');
    const heuresResult = await pool.query('SELECT COALESCE(SUM(heures_equiv_td), 0) as total FROM heures_effectuees');

    const stats = {
      enseignants: parseInt(enseignantsResult.rows[0]?.total || 0),
      seances: parseInt(seancesResult.rows[0]?.total || 0),
      heures: parseFloat(heuresResult.rows[0]?.total || 0),
    };

    res.json(stats);
  } catch (error) {
    console.error('Erreur statistiques:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/dashboard/recents
router.get('/recents', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT sc.*, u.nom as enseignant_nom, u.prenom as enseignant_prenom, m.nom as matiere_nom
       FROM seances_cours sc
       LEFT JOIN enseignants e ON sc.enseignant_id = e.id
       LEFT JOIN utilisateurs u ON e.utilisateur_id = u.id
       LEFT JOIN matieres m ON sc.matiere_id = m.id
       ORDER BY sc.cree_le DESC
       LIMIT 10`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur récentes:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/dashboard
router.get('/', async (req, res) => {
  try {
    const enseignantsResult = await pool.query("SELECT COUNT(*) as total FROM enseignants WHERE statut = 'actif'");
    const seancesResult = await pool.query('SELECT COUNT(*) as total FROM seances_cours');
    const heuresResult = await pool.query('SELECT COALESCE(SUM(heures_equiv_td), 0) as total FROM heures_effectuees');

    const stats = {
      enseignants: parseInt(enseignantsResult.rows[0]?.total || 0),
      seances: parseInt(seancesResult.rows[0]?.total || 0),
      heures: parseFloat(heuresResult.rows[0]?.total || 0),
    };

    const recentsResult = await pool.query(
      `SELECT sc.*, u.nom as enseignant_nom, u.prenom as enseignant_prenom, m.nom as matiere_nom
       FROM seances_cours sc
       LEFT JOIN enseignants e ON sc.enseignant_id = e.id
       LEFT JOIN utilisateurs u ON e.utilisateur_id = u.id
       LEFT JOIN matieres m ON sc.matiere_id = m.id
       ORDER BY sc.cree_le DESC
       LIMIT 5`
    );

    res.json({
      stats,
      recents: recentsResult.rows,
    });
  } catch (error) {
    console.error('Erreur dashboard:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

export { router };